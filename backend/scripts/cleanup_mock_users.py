"""
One-off cleanup for synthetic users created while AUTH_BYPASS was enabled.

During the bypass window every login collapsed to the hardcoded uid
'mock-user-123', and the only persisted user rows used a fabricated
'<uid>@learnforge.com' email + the constant display_name 'Learner'. Those
rows — and every plan / day / topic / article / interview hanging off them —
are orphaned now that auth resolves real Firebase uids.

All foreign keys to app_users are ON DELETE CASCADE, so deleting the synthetic
user rows removes their entire subtree in one statement.

Dry-run by default (read-only). Pass --apply to delete. Before deleting,
--apply first writes an audit snapshot of exactly what will be removed to
scripts/cleanup_backup_<timestamp>.json.

    cd backend
    source venv/bin/activate
    python -m scripts.cleanup_mock_users          # report only (safe)
    python -m scripts.cleanup_mock_users --apply  # delete (irreversible)
"""
import asyncio
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import select, delete, or_, func

from app.core.config import settings
from app.core.database import AsyncSessionLocal
from app.models.all import User, Plan, Article, Interview

# ── Signatures of bypass-era synthetic accounts ──────────────────────────────
# Conservative: only the hardcoded bypass uid and the fabricated placeholder
# email domain. Real Firebase users have real uids/emails and won't match.
SUSPECT_UIDS = ["mock-user-123"]
SUSPECT_EMAIL_LIKE = "%@learnforge.com"


def _suspect_filter():
    return or_(
        User.id.in_(SUSPECT_UIDS),
        User.email.like(SUSPECT_EMAIL_LIKE),
    )


def _db_label() -> str:
    """Host/db portion of the URL, credentials stripped — so we know the target."""
    url = settings.DATABASE_URL or "(unset)"
    tail = url.split("@", 1)[-1] if "@" in url else url
    return tail.split("?", 1)[0]


async def _scalar(session, stmt) -> int:
    return (await session.execute(stmt)).scalar_one()


async def main(apply: bool) -> None:
    print(f"Target DB: {_db_label()}")
    print(f"Mode: {'APPLY (will delete)' if apply else 'DRY RUN (read-only)'}\n")

    async with AsyncSessionLocal() as session:
        users = (
            await session.execute(select(User).filter(_suspect_filter()))
        ).scalars().all()

        if not users:
            print("No synthetic bypass users found — nothing to clean up.")
            return

        snapshot = []
        total_plans = total_articles = total_interviews = 0
        print(f"Found {len(users)} synthetic user(s):")
        for u in users:
            plans = (
                await session.execute(
                    select(Plan).filter(Plan.user_id == u.id)
                )
            ).scalars().all()
            articles = await _scalar(
                session,
                select(func.count()).select_from(Article).filter(Article.user_id == u.id),
            )
            interviews = await _scalar(
                session,
                select(func.count()).select_from(Interview).filter(Interview.user_id == u.id),
            )
            total_plans += len(plans)
            total_articles += articles
            total_interviews += interviews
            print(
                f"  - {u.id}  email={u.email!r}  name={u.display_name!r}  "
                f"| plans={len(plans)} articles={articles} interviews={interviews}"
            )
            snapshot.append({
                "id": u.id,
                "email": u.email,
                "display_name": u.display_name,
                "plans": [
                    {"id": p.id, "topic": p.topic, "total_days": p.total_days,
                     "created_at": p.created_at.isoformat() if p.created_at else None}
                    for p in plans
                ],
                "article_count": articles,
                "interview_count": interviews,
            })

        print(
            f"\nTotals: {len(users)} users, {total_plans} plans, "
            f"{total_articles} articles, {total_interviews} interviews"
        )
        print("(plan_days + topics cascade-delete with their plans)")

        if not apply:
            print("\nDRY RUN — no changes made. Re-run with --apply to delete.")
            return

        # Audit snapshot before the irreversible delete.
        ts = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
        backup = Path(__file__).parent / f"cleanup_backup_{ts}.json"
        backup.write_text(json.dumps(snapshot, indent=2))
        print(f"\nAudit snapshot written to {backup}")

        await session.execute(delete(User).where(_suspect_filter()))
        await session.commit()
        print("✅ Deleted. Cleanup complete.")


if __name__ == "__main__":
    asyncio.run(main(apply="--apply" in sys.argv))
