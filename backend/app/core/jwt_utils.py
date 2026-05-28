import jwt
from datetime import datetime, timedelta, timezone
from app.core.config import settings

_ALGORITHM = "HS256"


def create_access_token(uid: str, email: str, name: str = "") -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=settings.JWT_EXPIRE_HOURS)
    payload = {
        "sub": uid,
        "email": email,
        "name": name,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, settings.JWT_SECRET, algorithm=_ALGORITHM)


def decode_access_token(token: str) -> dict:
    """Raises jwt.InvalidTokenError on failure."""
    return jwt.decode(token, settings.JWT_SECRET, algorithms=[_ALGORITHM])
