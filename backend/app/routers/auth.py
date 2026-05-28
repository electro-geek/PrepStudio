from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from firebase_admin import auth as firebase_auth
from app.core.config import settings
from app.core.jwt_utils import create_access_token
from app.schemas.all import TokenResponse

router = APIRouter(tags=["auth"])
_security = HTTPBearer(auto_error=False)


@router.post("/auth/token", response_model=TokenResponse)
async def exchange_token(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
):
    """
    Exchange a Firebase ID token (or mock token in AUTH_BYPASS mode) for a
    short-lived backend JWT.  After this call the client should use the
    returned token for all subsequent requests — Firebase is never hit again
    until the backend JWT expires.
    """
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing Authorization header")

    raw = credentials.credentials

    if settings.AUTH_BYPASS:
        # Accept "uid:email" mock format
        if ":" in raw:
            uid, email = raw.split(":", 1)
        else:
            uid, email = raw, f"{raw}@prepstudio.app"
        name = email.split("@")[0].capitalize()
    else:
        try:
            decoded = firebase_auth.verify_id_token(raw)
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid Firebase token: {exc}",
            )
        uid = decoded.get("uid", "")
        email = decoded.get("email", "")
        name = decoded.get("name", "")

    token = create_access_token(uid=uid, email=email, name=name)
    return TokenResponse(
        access_token=token,
        expires_in=settings.JWT_EXPIRE_HOURS * 3600,
    )
