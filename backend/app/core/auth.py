from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings

security = HTTPBearer(auto_error=False)

# Initialize Firebase Admin if configured and not bypassed
firebase_app = None
if not settings.AUTH_BYPASS:
    try:
        if settings.FIREBASE_PROJECT_ID and settings.FIREBASE_PRIVATE_KEY and settings.FIREBASE_CLIENT_EMAIL:
            cred = credentials.Certificate({
                "type": "service_account",
                "project_id": settings.FIREBASE_PROJECT_ID,
                "private_key": settings.FIREBASE_PRIVATE_KEY,
                "client_email": settings.FIREBASE_CLIENT_EMAIL,
                "token_uri": "https://oauth2.googleapis.com/token",
            })
            firebase_app = firebase_admin.initialize_app(cred)
        else:
            firebase_app = firebase_admin.initialize_app()
    except Exception as e:
        print(f"Firebase Admin SDK initialization skipped/failed: {e}. Falling back to default auth config.")

class UserPayload:
    def __init__(self, uid: str, email: str, name: str = None):
        self.uid = uid
        self.email = email
        self.name = name or (email.split("@")[0].capitalize() if email else "Learner")

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UserPayload:
    # If auth bypass is enabled, return a mock user payload
    if settings.AUTH_BYPASS:
        uid = "mock-user-123"
        email = "user@learnforge.com"
        name = "Mock Learner"
        
        # If token format is "Bearer <uid>:<email>", parse it to support multiple mock users
        if credentials and credentials.credentials:
            token = credentials.credentials
            if ":" in token:
                parts = token.split(":", 1)
                uid = parts[0]
                email = parts[1]
                name = email.split("@")[0].capitalize()
            elif token.startswith("mock-"):
                uid = token
                email = f"{token}@learnforge.com"
                name = token.replace("mock-", "").capitalize() + " Learner"
                
        return UserPayload(uid=uid, email=email, name=name)

    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing Authorization Header",
        )

    token = credentials.credentials
    try:
        decoded_token = auth.verify_id_token(token)
        uid = decoded_token.get("uid")
        email = decoded_token.get("email", "")
        name = decoded_token.get("name", "")
        return UserPayload(uid=uid, email=email, name=name)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired Firebase ID token: {str(e)}",
        )
