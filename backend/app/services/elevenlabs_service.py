import asyncio
from typing import List
from elevenlabs import AsyncElevenLabs
from elevenlabs.types import (
    ConversationalConfig,
    AgentConfig,
    PromptAgentApiModelOutput,
    TtsConversationalConfigOutput,
)
from app.core.config import settings


class ElevenLabsService:
    def __init__(self):
        self.api_key = settings.ELEVENLABS_API_KEY
        self.is_configured = bool(self.api_key and len(self.api_key) > 10)

    def _client(self) -> AsyncElevenLabs:
        return AsyncElevenLabs(api_key=self.api_key)

    async def _create_agent(self, name: str, system_prompt: str, first_message: str) -> str:
        client = self._client()
        response = await client.conversational_ai.agents.create(
            name=name,
            conversation_config=ConversationalConfig(
                agent=AgentConfig(
                    prompt=PromptAgentApiModelOutput(
                        prompt=system_prompt,
                        llm="gemini-2.0-flash",
                        temperature=0.7,
                    ),
                    first_message=first_message,
                    language="en",
                ),
                tts=TtsConversationalConfigOutput(
                    model_id="eleven_turbo_v2",
                ),
            ),
        )
        return response.agent_id

    async def _get_signed_url(self, agent_id: str) -> str:
        client = self._client()
        response = await client.conversational_ai.conversations.get_signed_url(
            agent_id=agent_id
        )
        return response.signed_url

    async def create_lesson_session(
        self, topic_title: str, plan_topic: str, content: str
    ) -> dict:
        if not self.is_configured:
            raise ValueError(
                "ElevenLabs API key not set. Add ELEVENLABS_API_KEY to config.properties"
            )

        system_prompt = f"""You are Nova, a world-class AI tutor who loves making complex topics click.
You are teaching: "{topic_title}" — part of a course on "{plan_topic}".

REFERENCE MATERIAL (your source of truth):
{content[:6000]}

HOW YOU TEACH:
- Never recite the text verbatim. Transform it into a spoken, engaging lesson.
- Open with a hook: one surprising fact or question to grab attention.
- Use vivid analogies: "Think of it like...", "Imagine you're a chef and..."
- Speak with warmth and genuine excitement: "Here's where it gets really interesting..."
- After covering each concept, check in: "Does that land? Any questions so far?"
- When the student asks something, answer directly, then ease back into the lesson.
- End by summarising exactly 3 key takeaways, then invite final questions.

VOICE RULES (you are speaking, not writing):
- Short sentences. Natural pauses. No bullet points or headers aloud.
- Say "you" not "the student". Make it personal.
- Vary your tone — slow down on hard concepts, speed up on familiar ones."""

        first_message = (
            f"Hey! So today we're tackling {topic_title}, and honestly, "
            f"once this clicks it changes how you see a lot of things in {plan_topic}. "
            f"Before I dive in — what do you already know or think this topic is about?"
        )

        agent_id = await self._create_agent(
            name=f"PrepStudio Tutor | {topic_title[:40]}",
            system_prompt=system_prompt,
            first_message=first_message,
        )
        signed_url = await self._get_signed_url(agent_id)
        return {"signed_url": signed_url, "agent_id": agent_id, "topic_title": topic_title}

    async def create_interview_session(
        self, plan_topic: str, questions: List[str]
    ) -> dict:
        if not self.is_configured:
            raise ValueError(
                "ElevenLabs API key not set. Add ELEVENLABS_API_KEY to config.properties"
            )

        numbered_questions = "\n".join(
            [f"Q{i + 1}: {q}" for i, q in enumerate(questions)]
        )

        system_prompt = f"""You are Alex, a senior technical interviewer at a leading tech company.
You are conducting a voice interview. Subject: {plan_topic}

YOUR QUESTIONS (ask them in this exact order, one at a time):
{numbered_questions}

INTERVIEW SCRIPT:
1. Greet the candidate warmly. Introduce yourself as Alex. Ask them to give a brief introduction.
2. After the intro, say: "Perfect. Let's move into the technical questions."
3. Ask Q1. Wait for a full answer.
4. Acknowledge briefly ("Interesting.", "Got it.", "I see.") — never hint if correct or wrong.
5. Continue Q2 through Q{len(questions)} in order, one at a time.
6. After the final answer, say: "That's everything I had for today. Thank you for your time." Then say EXACTLY this phrase: INTERVIEW_COMPLETE

STRICT RULES:
- One question per turn. Never bundle two questions.
- Zero hints, corrections, or teaching during the interview.
- If they ask to repeat, repeat the question once.
- Keep your own turns short. You are interviewing, not lecturing.
- Be human, calm, and professional."""

        first_message = (
            f"Hello, and welcome! I'm Alex, and I'll be running your technical interview on {plan_topic} today. "
            f"Before we get into the questions, could you take a moment to introduce yourself?"
        )

        agent_id = await self._create_agent(
            name=f"PrepStudio Interviewer | {plan_topic[:40]}",
            system_prompt=system_prompt,
            first_message=first_message,
        )
        signed_url = await self._get_signed_url(agent_id)
        return {"signed_url": signed_url, "agent_id": agent_id}


elevenlabs_service = ElevenLabsService()
