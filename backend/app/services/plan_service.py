from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.models.all import Plan, PlanDay, Topic
from app.services.gemini_service import gemini
from app.services.user_service import upsert_user

class PlanService:
    async def create_plan(
        self,
        db: AsyncSession,
        user_id: str,
        topic: str,
        total_days: int,
        email: str = "",
        name: str = "",
    ) -> Plan:
        # 1. Ensure the user exists with their real profile info (idempotent).
        await upsert_user(db, uid=user_id, email=email, name=name)

        # 2. Call Gemini service to design the curriculum
        curriculum = await gemini.generate_plan(topic, total_days)
        
        # 3. Create the Plan
        plan = Plan(
            user_id=user_id,
            topic=topic.capitalize(),
            total_days=total_days,
            status="active"
        )
        db.add(plan)
        await db.flush()  # gets the plan.id

        # 4. Save Days and Topics
        days_data = curriculum.get("days", [])
        for day_data in days_data:
            day_num = day_data.get("day_number", 1)
            day_title = day_data.get("title", f"Day {day_num} Overview")
            
            day_record = PlanDay(
                plan_id=plan.id,
                day_number=day_num,
                title=day_title,
                is_complete=False
            )
            db.add(day_record)
            await db.flush()  # gets the day_record.id

            topics_data = day_data.get("topics", [])
            for position, topic_data in enumerate(topics_data):
                topic_title = topic_data.get("title", "Topic Study")

                topic_record = Topic(
                    day_id=day_record.id,
                    title=topic_title,
                    is_complete=False,
                    position=position,  # preserve Gemini's curriculum order
                )
                db.add(topic_record)
        
        await db.commit()
        
        # 5. Fetch fully loaded plan to return
        stmt = (
            select(Plan)
            .filter(Plan.id == plan.id)
            .options(
                selectinload(Plan.days).selectinload(PlanDay.topics)
            )
        )
        result = await db.execute(stmt)
        return result.scalar_one()

plan_service = PlanService()
