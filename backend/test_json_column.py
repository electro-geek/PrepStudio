import asyncio
from app.core.database import SessionLocal
from app.models.all import Topic

async def test():
    async with SessionLocal() as db:
        topic = Topic(
            day_id="test",
            title="test",
            content="test",
            article_ideas=["a", "b"]
        )
        db.add(topic)
        try:
            await db.commit()
            print("Commit successful!")
        except Exception as e:
            print("Commit failed:", e)

asyncio.run(test())
