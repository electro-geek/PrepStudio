from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.all import SystemDesignTrack, SystemDesignChallenge
from app.services.gemini_service import gemini
from app.services.user_service import upsert_user

_DIFFICULTY_RANK = {"easy": 0, "medium": 1, "hard": 2}


class SystemDesignService:
    async def create_track(
        self,
        db: AsyncSession,
        user_id: str,
        total_days: int,
        email: str = "",
        name: str = "",
    ) -> SystemDesignTrack:
        # 1. Ensure the user exists (idempotent), mirroring plan_service.
        await upsert_user(db, uid=user_id, email=email, name=name)

        # 2. Ask Gemini for a progressive challenge ladder.
        data = await gemini.generate_system_design_challenges(total_days)

        # 3. Persist the track.
        track = SystemDesignTrack(
            user_id=user_id,
            total_days=total_days,
            status="active",
        )
        db.add(track)
        await db.flush()  # gets track.id

        # 4. Persist challenges.
        for ch in data.get("challenges", []):
            difficulty = str(ch.get("difficulty", "medium")).lower()
            if difficulty not in _DIFFICULTY_RANK:
                difficulty = "medium"
            rank = ch.get("difficulty_rank")
            if not isinstance(rank, int):
                rank = _DIFFICULTY_RANK[difficulty]
            db.add(SystemDesignChallenge(
                track_id=track.id,
                product=str(ch.get("product", "Design a System")),
                prompt=str(ch.get("prompt", "")),
                difficulty=difficulty,
                difficulty_rank=rank,
                day_number=int(ch.get("day_number", 1) or 1),
                is_complete=False,
            ))

        await db.commit()

        # 5. Return the fully loaded track.
        stmt = (
            select(SystemDesignTrack)
            .filter(SystemDesignTrack.id == track.id)
            .options(selectinload(SystemDesignTrack.challenges))
        )
        result = await db.execute(stmt)
        return result.scalar_one()


system_design_service = SystemDesignService()
