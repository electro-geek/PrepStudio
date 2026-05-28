from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
import firebase_admin
from firebase_admin import credentials, auth
from app.core.config import settings
from app.core.jwt_utils import decode_access_token

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
    if settings.AUTH_BYPASS:
        uid = "mock-user-123"
        email = "user@learnforge.com"
        name = "Mock Learner"

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

    # Fast path: our own JWT (no network call)
    try:
        payload = decode_access_token(token)
        return UserPayload(
            uid=payload["sub"],
            email=payload.get("email", ""),
            name=payload.get("name", ""),
        )
    except jwt.InvalidTokenError:
        pass

    # Legacy path: Firebase ID token (only reached by old clients that haven't
    # exchanged for a backend JWT yet).  Verify once here; the client should
    # call POST /auth/token to get a backend JWT for future requests.
    try:
        decoded_token = auth.verify_id_token(token)
        return UserPayload(
            uid=decoded_token.get("uid"),
            email=decoded_token.get("email", ""),
            name=decoded_token.get("name", ""),
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid or expired token: {str(e)}",
        )
