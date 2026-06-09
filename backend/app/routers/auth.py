from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from firebase_admin import auth as firebase_auth
from app.core.auth import firebase_app, firebase_init_error
from app.core.config import settings
from app.core.database import get_db
from app.core.jwt_utils import create_access_token
from app.schemas.all import TokenResponse
from app.services.user_service import upsert_user

router = APIRouter(tags=["auth"])
_security = HTTPBearer(auto_error=False)


@router.post("/auth/token", response_model=TokenResponse)
async def exchange_token(
    credentials: HTTPAuthorizationCredentials = Depends(_security),
    db: AsyncSession = Depends(get_db),
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
        # If Firebase Admin never initialized (bad/missing FIREBASE_* config),
        # this is a server problem, not a bad token — say so with a 503 instead
        # of a misleading 401 that sends users chasing their own credentials.
        if firebase_app is None:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=f"Auth is not configured on the server: {firebase_init_error}",
            )
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

    # Persist (or refresh) the user's profile at login so a row always exists
    # with their real email/name, independent of whether they create a plan.
    # get_db commits the session when the request completes.
    await upsert_user(db, uid=uid, email=email, name=name)

    token = create_access_token(uid=uid, email=email, name=name)
    return TokenResponse(
        access_token=token,
        expires_in=settings.JWT_EXPIRE_HOURS * 3600,
    )
