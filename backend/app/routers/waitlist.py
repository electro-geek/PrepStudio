from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.database import get_db
from app.core.auth import get_current_user, UserPayload
from app.models.all import WaitlistEntry
from app.schemas.all import WaitlistJoin, WaitlistResponse

router = APIRouter(tags=["waitlist"])


@router.post("/waitlist", response_model=WaitlistResponse, status_code=status.HTTP_201_CREATED)
async def join_waitlist(
    payload: WaitlistJoin,
    db: AsyncSession = Depends(get_db),
    user: UserPayload = Depends(get_current_user),
):
    """Record a request for early access to a premium (waitlisted) feature.

    The page that calls this is auth-guarded, so we capture the signed-in user's
    uid for context, but trust the email/name in the body (the client pre-fills
    them from the auth profile). Re-joining the same feature with the same email
    is idempotent — we return the existing row instead of creating a duplicate.
    """
    email = (payload.email or user.email or "").strip().lower()
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An email address is required to join the waitlist.",
        )

    name = (payload.name or user.name or "").strip() or None
    feature = (payload.feature or "audio_lesson").strip()

    # Idempotent on (email, feature) so a double-click doesn't create dupes.
    existing = await db.execute(
        select(WaitlistEntry).filter(
            WaitlistEntry.email == email,
            WaitlistEntry.feature == feature,
        )
    )
    row = existing.scalar_one_or_none()
    if row:
        resp = WaitlistResponse.model_validate(row)
        resp.already_joined = True
        return resp

    entry = WaitlistEntry(email=email, name=name, feature=feature, user_id=user.uid)
    db.add(entry)
    await db.flush()  # populate id/created_at; get_db commits on request completion
    await db.refresh(entry)
    return WaitlistResponse.model_validate(entry)
