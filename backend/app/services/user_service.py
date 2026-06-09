from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.all import User


async def upsert_user(
    db: AsyncSession,
    uid: str,
    email: str = "",
    name: str = "",
) -> User:
    """
    Insert the user row if it doesn't exist, or refresh email/display_name with
    the latest values from the auth provider.  Idempotent — safe to call on
    every login and on plan creation.

    The caller is responsible for committing the surrounding transaction; this
    helper only flushes so the row is queryable within the same session.
    """
    # email is unique + NOT NULL — never persist an empty string.
    email = email or f"{uid}@prepstudio.app"

    result = await db.execute(select(User).filter(User.id == uid))
    user = result.scalar_one_or_none()

    if user is None:
        user = User(id=uid, email=email, display_name=name or None)
        db.add(user)
    else:
        # Keep the stored profile in sync with the provider's latest values.
        if email and user.email != email:
            user.email = email
        if name and user.display_name != name:
            user.display_name = name

    await db.flush()
    return user
