import json
import re
import base64
import google.generativeai as genai
from typing import List, Dict, Any, Optional, Tuple
from app.core.config import settings

class GeminiService:
    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.is_configured = bool(self.api_key and not self.api_key.startswith("YOUR_"))
        if self.is_configured:
            try:
                genai.configure(api_key=self.api_key)
            except Exception as e:
                print(f"Error configuring Gemini SDK: {e}")
                self.is_configured = False

    async def generate_plan(self, topic: str, days: int) -> Dict[str, Any]:
        if not self.is_configured:
            return self._mock_plan(topic, days)
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""You are an expert curriculum designer and academic planner. 
Create a structured day-by-day study curriculum for a student wanting to learn "{topic}" over a duration of {days} days.
Each day must have a short, descriptive title and a set of 2 to 4 specific topic titles that are logical, progressive, and cover the main components of learning {topic}.
For each topic, provide a short 1-sentence summary of what it covers.

Return JSON only, matching this exact structure:
{{
  "days": [
    {{
      "day_number": 1,
      "title": "Introduction to...",
      "topics": [
        {{ "title": "Understanding ...", "summary": "An introduction to ..." }},
        {{ "title": "Setting up ...", "summary": "How to install and configure ..." }}
      ]
    }}
  ]
}}"""
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini generate_plan failed: {e}. Using mock backup.")
            return self._mock_plan(topic, days)

    async def generate_topic_content(self, plan_topic: str, topic_title: str, day_title: str) -> Dict[str, Any]:
        if not self.is_configured:
            return self._mock_content(plan_topic, topic_title)
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""You are an expert technical writer and teacher. 
Write a comprehensive, deep, and highly informative learning article for the topic "{topic_title}" under the section "{day_title}" as part of a study plan on "{plan_topic}".

Write a premium-quality tutorial including:
1. A clear, engaging introduction explaining what it is, why it matters, and a high-level analogy to make it easy to understand.
2. Core concepts explained in detail with clear subheadings.
3. A practical, step-by-step walkthrough or code examples (if applicable) with rich explanations.
4. Common mistakes or gotchas to watch out for.

Ensure the content is written in rich Markdown, highly detailed, professional, and comprehensive.

At the very end of your response, output a distinct section starting with "ARTICLE_IDEAS:" followed by a JSON array of 3 creative, distinct blog/article ideas that a student could write based on this content.
Each element of the array MUST be a plain string (the article title only) — do NOT use objects with title/description keys.
For example:
ARTICLE_IDEAS: ["5 Django ORM tricks every beginner misses", "How Django QuerySets are lazy and why it matters", "Building efficient DB queries in Django"]"""
            
            response = model.generate_content(prompt)
            full_text = response.text
            
            # Parse ideas
            default_ideas = ["How to build projects with " + topic_title, "Advanced guide to " + topic_title, "Mistakes to avoid in " + topic_title]
            ideas = default_ideas
            content = full_text

            if "ARTICLE_IDEAS:" in full_text:
                parts = full_text.split("ARTICLE_IDEAS:", 1)
                content = parts[0].strip()
                try:
                    # Clean up JSON formatting
                    json_str = parts[1].strip()
                    ideas = json.loads(json_str)
                except Exception:
                    # Regex fallback
                    match = re.search(r'\[.*\]', parts[1])
                    if match:
                        try:
                            ideas = json.loads(match.group(0))
                        except Exception:
                            pass

            return {"content": content, "article_ideas": self._normalize_ideas(ideas, default_ideas)}
        except Exception as e:
            print(f"Gemini generate_topic_content failed: {e}. Using mock backup.")
            return self._mock_content(plan_topic, topic_title)

    @staticmethod
    def _normalize_ideas(raw: Any, fallback: List[str]) -> List[str]:
        # Gemini sometimes ignores the string-array instruction and returns
        # objects like {"title": ..., "description": ...}; TopicResponse
        # declares List[str], so anything else 500s at serialization.
        if not isinstance(raw, list):
            return fallback
        ideas = []
        for item in raw:
            if isinstance(item, str) and item.strip():
                ideas.append(item.strip())
            elif isinstance(item, dict):
                title = item.get("title") or item.get("idea") or item.get("name")
                if isinstance(title, str) and title.strip():
                    ideas.append(title.strip())
        return ideas or fallback

    async def refine_article(self, raw_text: str, topic_context: str) -> Dict[str, str]:
        if not self.is_configured:
            return self._mock_refine(raw_text, topic_context)
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""You are a professional technical editor.
Your job is to rewrite the student's messy notes and thoughts about the topic "{topic_context}" into a publication-ready technical blog post.

Student Notes:
\"\"\"
{raw_text}
\"\"\"

Generate two things:
1. A polished Markdown article with an attractive title, clean section headings, clear explanations, formatted code blocks (if applicable), and a concise conclusion.
2. An engaging Twitter/X thread version of this article, consisting of 4-6 numbered tweets, designed to maximize engagement and summarize the key takeaways.

Return JSON only, matching this exact structure:
{{
  "refined_markdown": "...",
  "twitter_thread": "..."
}}"""
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            res_data = json.loads(response.text)
            return {
                "refined_markdown": res_data.get("refined_markdown", ""),
                "twitter_thread": res_data.get("twitter_thread", "")
            }
        except Exception as e:
            print(f"Gemini refine_article failed: {e}. Using mock backup.")
            return self._mock_refine(raw_text, topic_context)

    async def generate_interview_questions(self, plan_topic: str, topics_list: List[str]) -> List[str]:
        if not self.is_configured:
            return self._mock_interview_questions(plan_topic, topics_list)
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""You are a technical interviewer testing a student on their study plan about "{plan_topic}".
Here are the topics they studied:
{chr(10).join(topics_list)}

Generate exactly 8 challenging interview questions. The questions should cover a mix of:
- Conceptual understanding
- Practical application/scenarios
- Deep-dives into core mechanisms

Return JSON only, matching this exact structure:
{{
  "questions": [
    "Question 1",
    "Question 2",
    "Question 3",
    "Question 4",
    "Question 5",
    "Question 6",
    "Question 7",
    "Question 8"
  ]
}}"""
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            res_data = json.loads(response.text)
            return res_data.get("questions", self._mock_interview_questions(plan_topic, topics_list))
        except Exception as e:
            print(f"Gemini generate_interview_questions failed: {e}. Using mock backup.")
            return self._mock_interview_questions(plan_topic, topics_list)

    async def evaluate_answer(self, question: str, answer: str) -> Dict[str, Any]:
        if not self.is_configured:
            return self._mock_evaluation(question, answer)
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""You are a strict but constructive technical evaluator.
Evaluate the student's spoken/text answer to the interview question.

Question: {question}
Student Answer: {answer}

Score the answer out of 100 based on accuracy, technical depth, and clarity.
Provide constructive feedback detailing strengths of their answer and areas they can improve.

Return JSON only, matching this exact structure:
{{
  "score": 85,
  "feedback": {{
    "strengths": "Explain why the answer was good or what specific parts were correct.",
    "improvements": "Suggest how to expand, clarify, or fix the parts that were missing."
  }}
}}"""
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"}
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini evaluate_answer failed: {e}. Using mock backup.")
            return self._mock_evaluation(question, answer)

    async def evaluate_interview_transcript(
        self, plan_topic: str, questions: List[str], transcript: str
    ) -> Dict[str, Any]:
        if not self.is_configured:
            return self._mock_transcript_evaluation(plan_topic, questions)
        try:
            model = genai.GenerativeModel("gemini-2.5-flash")
            numbered_questions = "\n".join(
                [f"Q{i+1}: {q}" for i, q in enumerate(questions)]
            )
            prompt = f"""You are evaluating a technical voice interview for a candidate studying {plan_topic}.

QUESTIONS THAT WERE ASKED:
{numbered_questions}

FULL CONVERSATION TRANSCRIPT:
{transcript[:8000]}

Carefully analyse how the candidate answered each question based on the transcript.
Return JSON only, matching this exact structure:
{{
  "overall_score": <integer 0-100>,
  "overall_grade": "<letter grade, e.g. A, B+, C->",
  "summary": "<2-sentence overall assessment of the candidate's performance>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific improvement area 1>", "<specific improvement area 2>", "<specific improvement area 3>"],
  "question_feedback": [
    {{
      "question": "<question text>",
      "score": <integer 0-100>,
      "assessment": "<1-2 sentence evaluation of their answer to this specific question>"
    }}
  ]
}}"""
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"},
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"Gemini evaluate_interview_transcript failed: {e}. Using mock.")
            return self._mock_transcript_evaluation(plan_topic, questions)

    def _mock_transcript_evaluation(
        self, plan_topic: str, questions: List[str]
    ) -> Dict[str, Any]:
        feedback = [
            {
                "question": q,
                "score": 75,
                "assessment": "Demonstrated foundational understanding with room for more technical depth.",
            }
            for q in questions
        ]
        return {
            "overall_score": 78,
            "overall_grade": "B+",
            "summary": (
                f"The candidate showed solid knowledge of {plan_topic} and communicated clearly. "
                "Most answers covered core concepts, with opportunities to go deeper on advanced topics."
            ),
            "strengths": [
                "Clear communication and well-structured answers",
                "Good grasp of fundamental concepts",
                "Engaged thoughtfully with each question",
            ],
            "improvements": [
                "Include more concrete real-world examples",
                "Go deeper on edge cases and error handling",
                "Strengthen answers on advanced architectural patterns",
            ],
            "question_feedback": feedback,
        }

    # --- Fallback Mock Implementations ---

    def _mock_plan(self, topic: str, days: int) -> Dict[str, Any]:
        days_list = []
        common_topics = {
            "django": [
                ("Introduction & Architecture", ["MVT Pattern Architecture", "Django project structure and settings", "Routing with URLconf"]),
                ("Models & Databases", ["Django Models and Migrations", "QuerySets and basic filtering", "Relationships (One-to-Many, Many-to-Many)"]),
                ("Views & Templates", ["Function-Based Views (FBVs)", "Class-Based Views (CBVs)", "Django Template Language (DTL)"]),
                ("Forms & Validation", ["Django Forms API", "ModelForms", "Custom validations"]),
                ("Authentication & Security", ["Django User Authentication", "Session management", "CSRF and XSS protection"]),
                ("REST APIs with DRF", ["Django REST Framework basics", "Serializers", "Viewsets and API routing"]),
                ("Advanced Topics", ["Django Admin customization", "Signals & Middleware", "Query optimization & caching"]),
            ],
            "react": [
                ("Core Concepts", ["JSX and Component Tree", "Props and State", "Virtual DOM and rendering cycle"]),
                ("Hooks Deep Dive", ["useState & useEffect", "useMemo & useCallback", "Custom hooks creation"]),
                ("State Management", ["Context API", "Introduction to Zustand/Redux", "Data flows"]),
                ("Routing & Navigation", ["React Router basics", "Dynamic routing", "Protected routes"]),
                ("Forms & Side Effects", ["Controlled vs Uncontrolled components", "React Hook Form integration", "API calls with TanStack Query"]),
                ("Performance & Testing", ["React.memo & lazy loading", "Writing unit tests with Jest", "Debugging React apps"]),
                ("Advanced Ecosystem", ["Server-Side Rendering (SSR) concepts", "Next.js intro", "Production builds & optimizations"]),
            ]
        }

        # Select custom curriculum, fallback to procedural generation
        topic_key = topic.lower()
        matched_curriculum = None
        for key in common_topics:
            if key in topic_key:
                matched_curriculum = common_topics[key]
                break

        for d in range(1, days + 1):
            if matched_curriculum and d <= len(matched_curriculum):
                day_title, topic_titles = matched_curriculum[d - 1]
            else:
                day_title = f"Deep Dive into {topic} - Phase {d}"
                topic_titles = [
                    f"Core principles of {topic} (Part {d})",
                    f"Practical applications and setups of {topic}",
                    f"Intermediate patterns and testing in {topic}"
                ]
            
            topics = []
            for t_idx, title in enumerate(topic_titles):
                topics.append({
                    "title": title,
                    "summary": f"Learn the foundational mechanisms and best practices concerning {title.lower()} within {topic}."
                })
            
            days_list.append({
                "day_number": d,
                "title": day_title,
                "topics": topics
            })

        return {"days": days_list}

    def _mock_content(self, plan_topic: str, topic_title: str) -> Dict[str, Any]:
        content = f"""# Masterclass: {topic_title}

Welcome to this in-depth guide on **{topic_title}**, compiled as a critical module of your customized study track in **{plan_topic}**. Understanding this core area is essential for writing high-performance, maintainable software and architecting premium systems.

---

## 🚀 1. The Core Paradigm & Analogy

To grasp **{topic_title}**, let's use a simple real-world analogy. Think of it like a **professional restaurant kitchen**. 

Instead of the head chef running around taking orders, cutting vegetables, washing plates, and cooking steaks all at once (which represents a highly congested, synchronous process), a kitchen uses **specialized stations** and a **structured order queue**. Waiters place orders on a ticket window (the database query queue), which chefs process asynchronously based on category. Each section handles its job perfectly, enabling the kitchen to scale and feed hundreds of guests simultaneously without crashing!

In computer systems, **{topic_title}** accomplishes exactly this: it establishes clear segregation, decouples heavy operations, and ensures high efficiency.

---

## 🛠️ 2. Key Architecture & Concepts

Here are the central building blocks you must master:

1. **The Decoupling Layer**: This isolates incoming client requests from time-consuming processing tasks.
2. **Lazy Execution / Evaluation**: Operations are not computed until the results are strictly required, saving valuable memory and database connection cycles.
3. **Data Caching**: Storing highly-requested resources in temporary high-speed memory modules to skip expensive recalculations.

### Why This Matters

Without these paradigms, your applications will experience heavy resource contention, database locks, slow response latencies, and rapid infrastructure cost inflation.

---

## 💻 3. Practical Implementation Example

Here is how you would typically implement these principles in modern code:

```python
# A premium, production-ready implementation demonstrating the core mechanics
import asyncio
import time
from typing import Dict, Any

class LazyResourceLoader:
    def __init__(self, resource_id: str):
        self.resource_id = resource_id
        self._cached_data = None
        self._is_loaded = False
        
    async def fetch_from_source(self) -> Dict[str, Any]:
        \"\"\"
        Simulates an expensive remote API or database hit.
        \"\"\"
        print(f"[Database] Fetching resource data for: {self.resource_id}...")
        await asyncio.sleep(1.5) # Simulate database network latency
        return {
            "id": self.resource_id,
            "status": "active",
            "payload": "Premium learning materials generated successfully.",
            "timestamp": time.time()
        }

    async def get_data(self) -> Dict[str, Any]:
        \"\"\"
        Implements lazy-loading and caching. The database is hit
        ONLY on the first request. Subsequent loads are instant.
        \"\"\"
        if not self._is_loaded:
            self._cached_data = await self.fetch_from_source()
            self._is_loaded = True
            print("[Cache] Successfully loaded and cached in-memory.")
        else:
            print("[Cache] Cache hit! Returning in-memory asset immediately.")
        return self._cached_data

async def main():
    loader = LazyResourceLoader("plan_day_topic_99")
    
    # First invocation (loads from remote database source)
    print("--- Requesting Data (First Time) ---")
    data1 = await loader.get_data()
    print(f"Result: {data1}\n")
    
    # Second invocation (returns cache instantly)
    print("--- Requesting Data (Second Time) ---")
    data2 = await loader.get_data()
    print(f"Result: {data2}")

if __name__ == "__main__":
    asyncio.run(main())
```

---

## ⚠️ 4. Crucial Gotchas & Mistakes

Watch out for these common architectural pitfalls:
* **Over-caching**: Caching volatile data that changes every second leads to data corruption and out-of-sync dashboards.
* **N+1 Query Exploded Latency**: Querying parent tables and then making individual sub-queries for every single child inside a loop. Always use eager loading (`select_related` / `prefetch_related` or equivalents).
* **Missing Error Boundaries**: Neglecting to catch external service timeouts, which blocks your app thread indefinitely.

---

## 🎯 Summary

By implementing lazy loading, segregating logic paths, and caching expensive database results, you transform slow applications into highly concurrent systems ready to scale!
"""
        ideas = [
            f"How {topic_title} changes the game for scalable applications",
            f"Top 5 architectural gotchas with {topic_title} and how to fix them",
            f"Building a custom {topic_title} wrapper: A step-by-step developer guide"
        ]
        return {"content": content, "article_ideas": ideas}

    def _mock_refine(self, raw_text: str, topic_context: str) -> Dict[str, str]:
        refined = f"""# Deep Dive: Mastery of {topic_context}

## Introduction
Writing clean, high-performance applications requires more than just making code compile. It demands strategic database querying, clean modular structure, and robust caching policies. In this article, we translate basic developer concepts into professional architectural design patterns.

---

## 💡 The Core Breakdown
Based on a recent study, here is how we refine the key technical pillars of **{topic_context}**:

1. **Segmented Logic Boundaries**: Never write massive spaghetti functions. Keep database, presentation, and routing layers strictly independent.
2. **Lazy Execution Mechanics**: Ensure database connections are used efficiently. Only fetch fields you actually intend to read.
3. **Robust Caching**: Save user request latency by keeping static assets locally accessible in RAM.

---

## 🛠️ Implementation Strategy
For maximum performance, your pipeline should mimic this structure:

* **Ingestion**: Standardize incoming REST request schemas.
* **Validation**: Run strict type and constraint checks using Pydantic or custom classes.
* **Execution**: Run computationally expensive functions asynchronously.
* **Response**: Return compressed, clean JSON structures.

---

## 🎯 Conclusion
Adopting these architectural principles immediately impacts user experience, decreases database loads, and streamlines application stability.
"""
        tweets = f"""1/6 🚀 Ready to level up your systems design? Let's talk about the secret pillars of #{topic_context.replace(' ', '')}! Here is a quick breakdown of how to make your apps faster, lighter, and fully scalable. 👇

2/6 🧵 First: Segmented Logic Boundaries. Keep your DB connections, REST routers, and helper scripts strictly separated. Spaghetti code isn't just hard to read—it introduces critical side-effects and resource leaks.

3/6 🧵 Second: Lazy Execution! Why fetch 50 table rows and columns when you only need two? Evaluate your queries lazily and let your backend breath. N+1 queries are the silent killer of API speeds.

4/6 🧵 Third: Robust Caching. RAM is orders of magnitude faster than hard disk database lookups. Use Redis or in-memory LRU caches for configuration settings, user profiles, and static content!

5/6 🧵 The key to premium apps is resilience: always catch query exceptions, set timeouts, and structure your validation layers with strict Schemas.

6/6 🏆 If you enjoyed this thread on #{topic_context.replace(' ', '')}, retweet the first tweet and follow for more technical deep dives! What's your favorite performance trick? Let's discuss in the replies! 💬"""
        return {"refined_markdown": refined, "twitter_thread": tweets}

    def _mock_interview_questions(self, plan_topic: str, topics_list: List[str]) -> List[str]:
        return [
            f"Can you explain the main architectural patterns associated with {plan_topic}?",
            f"How does lazy evaluation or lazy querysets function, and why are they beneficial?",
            f"What is the difference between select_related and prefetch_related, and when would you use each?",
            f"How do you handle database migrations safely without causing table locks in production?",
            f"What security practices (such as anti-CSRF or CORS configurations) are critical in a {plan_topic} application?",
            f"Can you describe how standard middleware works, and how you would build a custom token verification middleware?",
            f"How do you structure data validation for incoming API requests to ensure security and type safety?",
            f"What caching strategies would you apply to highly frequent database requests in a {plan_topic} environment?"
        ]

    def _mock_evaluation(self, question: str, answer: str) -> Dict[str, Any]:
        length = len(answer.strip())
        
        # Give higher scores for longer, more technical answers
        if length == 0:
            score = 0
            strengths = "No answer was provided."
            improvements = "Please speak or write an answer to be evaluated by the AI interviewer."
        elif length < 20:
            score = 45
            strengths = "You provided a brief answer and attempted the question."
            improvements = "Expand your response! Give concrete examples, talk about the core mechanics, and explain the why behind the technology."
        elif length < 100:
            score = 72
            strengths = "Good high-level overview. You understand the primary definition and why the concept exists."
            improvements = "To score in the high 90s, mention specific libraries, code keywords, performance benefits, or real-world database impacts."
        else:
            score = 90
            strengths = "Excellent, highly detailed response! You covered multiple technical angles, detailed key architectural details, and gave practical explanations."
            improvements = "For a perfect score, touch briefly on unit-testing your approach and handling edge cases like network dropouts or concurrent race conditions."

        return {
            "score": score,
            "feedback": {
                "strengths": strengths,
                "improvements": improvements
            }
        }

    # ── System Design ────────────────────────────────────────────────────────

    @staticmethod
    def decode_data_url(data_url: Optional[str]) -> Optional[Tuple[str, bytes]]:
        """Turn a 'data:image/png;base64,....' string into (mime_type, raw_bytes).
        Returns None for empty/invalid input so callers can skip the image part."""
        if not data_url or not isinstance(data_url, str):
            return None
        try:
            if data_url.startswith("data:"):
                header, b64 = data_url.split(",", 1)
                mime = header[5:].split(";")[0] or "image/png"
            else:
                # Bare base64 with no header — assume PNG.
                b64, mime = data_url, "image/png"
            return mime, base64.b64decode(b64)
        except Exception:
            return None

    async def generate_system_design_challenges(self, days: int) -> Dict[str, Any]:
        if not self.is_configured:
            return self._mock_system_design_challenges(days)
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            prompt = f"""You are a senior staff engineer designing a system-design practice curriculum.
Create a progressive set of well-known product system-design challenges spread across {days} day(s).

Rules:
- Distribute roughly 1-2 challenges per day (total ~{max(days, days * 2 // 2)} challenges, scale sensibly with the day count).
- Order the curriculum so difficulty escalates from "easy" early days to "hard" later days.
- Use classic, recognizable problems (e.g. URL shortener, pastebin, rate limiter, Twitter timeline, WhatsApp chat, Instagram, Uber, Netflix CDN, Google Drive, payment system, distributed cache, search autocomplete, notification system).
- "product" is a short title like "Design a URL Shortener".
- "prompt" is 1-2 sentences describing what to design and the key constraints/scale to consider.
- "difficulty" is one of "easy", "medium", "hard".
- "difficulty_rank" is an integer 0,1,2 for easy,medium,hard respectively.

Return JSON only, matching this exact structure:
{{
  "challenges": [
    {{ "product": "Design a URL Shortener", "prompt": "Design a service that shortens long URLs and redirects users, handling ~100M URLs and high read throughput.", "difficulty": "easy", "difficulty_rank": 0, "day_number": 1 }}
  ]
}}"""
            response = model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"},
            )
            data = json.loads(response.text)
            if not data.get("challenges"):
                return self._mock_system_design_challenges(days)
            return data
        except Exception as e:
            print(f"Gemini generate_system_design_challenges failed: {e}. Using mock backup.")
            return self._mock_system_design_challenges(days)

    async def evaluate_system_design(
        self,
        product: str,
        prompt: str,
        functional: str,
        nonfunctional: str,
        hld_image: Optional[str],
        hld_notes: str,
        lld_text: str,
        lld_image: Optional[str],
    ) -> Dict[str, Any]:
        if not self.is_configured:
            return self._mock_system_design_evaluation(product)
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            text_prompt = f"""You are a strict but constructive senior systems architect (FAANG-level interviewer)
evaluating a candidate's system-design submission for the problem: "{product}".
Problem brief: {prompt}

The candidate provided the following. One or two images may also be attached:
- The first attached image (if any) is the candidate's HIGH-LEVEL DESIGN (HLD) architecture diagram.
- A second attached image (if any) is supplementary LOW-LEVEL DESIGN (LLD) detail.

FUNCTIONAL REQUIREMENTS (candidate):
{functional or "(none provided)"}

NON-FUNCTIONAL REQUIREMENTS (candidate):
{nonfunctional or "(none provided)"}

HLD NOTES (candidate):
{hld_notes or "(none provided)"}

LOW-LEVEL DESIGN — APIs / DB schema / classes (candidate):
{lld_text or "(none provided)"}

Carefully read any attached diagram image(s) and the text. Evaluate the submission on three dimensions:
1. requirements — completeness/correctness of functional & non-functional requirements.
2. hld — high-level architecture: components, data flow, scalability, load balancing, caching, storage choices, partitioning/sharding, replication, CAP/consistency tradeoffs. Use the HLD diagram image if present.
3. lld — low-level design: API contracts, database schema, key data structures/algorithms, class design.

For each dimension list what was COVERED well and what was MISSING/incorrect.

Respond in THREE sections separated by sentinel lines (this avoids JSON escaping issues):

SECTION 1 — a single JSON object with ONLY the scored fields (keep strings short, one sentence each):
{{
  "overall_score": <int 0-100>,
  "overall_grade": "<letter grade e.g. A, B+, C->",
  "hld_score": <int 0-100>,
  "lld_score": <int 0-100>,
  "requirements_score": <int 0-100>,
  "summary": "<2-3 sentence overall assessment>",
  "requirements_feedback": {{ "covered": ["..."], "missing": ["..."] }},
  "hld_feedback": {{ "covered": ["..."], "missing": ["..."] }},
  "lld_feedback": {{ "covered": ["..."], "missing": ["..."] }}
}}
Then a line containing exactly "---ANSWER---"
SECTION 2 — a corrected REFERENCE model answer in markdown (concise but complete).
Then a line containing exactly "---MERMAID---"
SECTION 3 — a valid Mermaid 'graph TD' (or 'flowchart TD') diagram of the ideal architecture, NO markdown fences."""

            parts: List[Any] = [text_prompt]
            hld_blob = self.decode_data_url(hld_image)
            if hld_blob:
                parts.append({"mime_type": hld_blob[0], "data": hld_blob[1]})
            lld_blob = self.decode_data_url(lld_image)
            if lld_blob:
                parts.append({"mime_type": lld_blob[0], "data": lld_blob[1]})

            response = model.generate_content(parts)
            full = response.text or ""

            json_part, _, rest = full.partition("---ANSWER---")
            answer_part, _, mermaid_part = rest.partition("---MERMAID---")

            # The JSON section is small now, so parsing is reliable. Strip fences.
            json_text = re.sub(r"^```(?:json)?\s*", "", json_part.strip())
            json_text = re.sub(r"\s*```$", "", json_text).strip()
            match = re.search(r"\{.*\}", json_text, re.DOTALL)
            data = json.loads(match.group(0) if match else json_text)

            if answer_part.strip():
                data["model_answer_markdown"] = answer_part.strip()
            if mermaid_part.strip():
                data["model_diagram_mermaid"] = self._clean_mermaid(mermaid_part)
            return self._normalize_sd_evaluation(data, product)
        except Exception as e:
            print(f"Gemini evaluate_system_design failed: {e}. Using mock backup.")
            return self._mock_system_design_evaluation(product)

    async def generate_system_design_solution(self, product: str, prompt: str) -> Dict[str, str]:
        if not self.is_configured:
            mock = self._mock_system_design_evaluation(product)
            return {
                "model_answer_markdown": mock["model_answer_markdown"],
                "model_diagram_mermaid": mock["model_diagram_mermaid"],
            }
        try:
            model = genai.GenerativeModel('gemini-2.5-flash')
            # Plain-text + delimiter (NOT JSON mode): large markdown answers
            # routinely break JSON escaping, so we split on a sentinel instead.
            text_prompt = f"""You are a senior systems architect. Write the ideal model answer for the
system-design problem "{product}". Problem brief: {prompt}

Produce a complete, well-structured markdown solution covering:
- Functional & non-functional requirements
- Capacity / back-of-envelope estimates
- High-Level Design (components, data flow, scaling, caching, load balancing, storage)
- Low-Level Design (API contracts, database schema, key data structures, class design)
- Bottlenecks, tradeoffs, and how to scale further

After the markdown solution, output a line containing exactly "---MERMAID---" and then a
valid Mermaid 'graph TD' (or 'flowchart TD') architecture diagram with NO markdown fences."""
            response = model.generate_content(text_prompt)
            full = response.text or ""
            fallback = self._mock_system_design_evaluation(product)
            if "---MERMAID---" in full:
                answer, _, mermaid = full.partition("---MERMAID---")
            else:
                answer, mermaid = full, ""
            return {
                "model_answer_markdown": answer.strip() or fallback["model_answer_markdown"],
                "model_diagram_mermaid": self._clean_mermaid(mermaid) or fallback["model_diagram_mermaid"],
            }
        except Exception as e:
            print(f"Gemini generate_system_design_solution failed: {e}. Using mock backup.")
            mock = self._mock_system_design_evaluation(product)
            return {
                "model_answer_markdown": mock["model_answer_markdown"],
                "model_diagram_mermaid": mock["model_diagram_mermaid"],
            }

    @staticmethod
    def _clean_mermaid(raw: Any) -> str:
        # Strip accidental ```mermaid fences the model sometimes adds.
        if not isinstance(raw, str):
            return ""
        text = raw.strip()
        text = re.sub(r"^```(?:mermaid)?\s*", "", text)
        text = re.sub(r"\s*```$", "", text)
        return text.strip()

    @classmethod
    def _normalize_sd_evaluation(cls, data: Dict[str, Any], product: str) -> Dict[str, Any]:
        fallback = cls._mock_system_design_evaluation_static(product)

        def dim(key):
            d = data.get(key) or {}
            if not isinstance(d, dict):
                return {"covered": [], "missing": []}
            covered = d.get("covered") or []
            missing = d.get("missing") or []
            return {
                "covered": [str(x) for x in covered if x],
                "missing": [str(x) for x in missing if x],
            }

        def score(key):
            try:
                return max(0, min(100, int(data.get(key, fallback[key]))))
            except (TypeError, ValueError):
                return fallback[key]

        mermaid = cls._clean_mermaid(data.get("model_diagram_mermaid", "")) or fallback["model_diagram_mermaid"]
        return {
            "overall_score": score("overall_score"),
            "overall_grade": str(data.get("overall_grade") or fallback["overall_grade"]),
            "hld_score": score("hld_score"),
            "lld_score": score("lld_score"),
            "requirements_score": score("requirements_score"),
            "summary": str(data.get("summary") or fallback["summary"]),
            "requirements_feedback": dim("requirements_feedback"),
            "hld_feedback": dim("hld_feedback"),
            "lld_feedback": dim("lld_feedback"),
            "model_answer_markdown": str(data.get("model_answer_markdown") or fallback["model_answer_markdown"]),
            "model_diagram_mermaid": mermaid,
        }

    # --- System Design Mocks ---

    def _mock_system_design_challenges(self, days: int) -> Dict[str, Any]:
        ladder = [
            ("Design a URL Shortener", "Shorten long URLs and redirect users; handle ~100M URLs and read-heavy traffic.", "easy", 0),
            ("Design Pastebin", "Store and serve text snippets with expiry and public/private access.", "easy", 0),
            ("Design a Rate Limiter", "Throttle API requests per user/IP using token-bucket or sliding-window at scale.", "medium", 1),
            ("Design a Notification System", "Deliver push/email/SMS notifications with fan-out and retries.", "medium", 1),
            ("Design Twitter Timeline", "Design tweet posting and home-timeline fan-out for millions of users.", "medium", 1),
            ("Design WhatsApp / Chat", "Real-time 1:1 and group messaging with delivery/read receipts and presence.", "hard", 2),
            ("Design Uber", "Match riders to drivers in real time with geospatial indexing and surge pricing.", "hard", 2),
            ("Design Netflix CDN", "Stream video globally with adaptive bitrate, caching and a CDN strategy.", "hard", 2),
        ]
        challenges = []
        # Spread the ladder across the requested days, escalating difficulty.
        per_day = max(1, (len(ladder) + days - 1) // days) if days else 1
        idx = 0
        for day in range(1, days + 1):
            for _ in range(per_day):
                if idx >= len(ladder):
                    break
                product, prompt, difficulty, rank = ladder[idx]
                challenges.append({
                    "product": product,
                    "prompt": prompt,
                    "difficulty": difficulty,
                    "difficulty_rank": rank,
                    "day_number": day,
                })
                idx += 1
        # Ensure at least one challenge per day if the ladder ran out.
        while len(challenges) < days:
            day = len(challenges) + 1
            product, prompt, difficulty, rank = ladder[(day - 1) % len(ladder)]
            challenges.append({
                "product": product,
                "prompt": prompt,
                "difficulty": difficulty,
                "difficulty_rank": rank,
                "day_number": day,
            })
        return {"challenges": challenges}

    @staticmethod
    def _mock_system_design_evaluation_static(product: str) -> Dict[str, Any]:
        diagram = (
            "graph TD\n"
            "  Client[Client Apps] --> LB[Load Balancer]\n"
            "  LB --> API[API / App Servers]\n"
            "  API --> Cache[(Redis Cache)]\n"
            "  API --> DB[(Primary DB)]\n"
            "  DB --> Replica[(Read Replicas)]\n"
            "  API --> Queue[Message Queue]\n"
            "  Queue --> Workers[Async Workers]\n"
            "  API --> Blob[(Object Storage / CDN)]"
        )
        answer = f"""# Reference Solution: {product}

## 1. Requirements
- **Functional**: core read/write operations, the primary user journeys, and supporting flows.
- **Non-functional**: high availability, low latency (p99), horizontal scalability, durability, and security.

## 2. High-Level Design
A stateless API tier behind a load balancer, a caching layer for hot reads, a primary datastore with read replicas, an async message queue for heavy/decoupled work, and object storage/CDN for large blobs.

## 3. Low-Level Design
- **APIs**: clear REST/gRPC contracts with pagination and idempotency keys for writes.
- **Schema**: normalized core entities with indexes on hot lookup paths; consider sharding by a high-cardinality key.
- **Data structures**: hashing for partitioning, queues for fan-out.

## 4. Scaling & Tradeoffs
- Cache-aside for reads, write-through where consistency matters.
- Shard/partition the datastore; replicate for read scaling and failover.
- Watch the hot-partition and thundering-herd problems; add backpressure and rate limiting.
"""
        return {
            "overall_score": 72,
            "overall_grade": "B",
            "hld_score": 75,
            "lld_score": 64,
            "requirements_score": 78,
            "summary": (
                f"Solid foundational design for {product} with a reasonable high-level architecture. "
                "The low-level design needs more concrete API and schema detail, and a few scaling concerns are unaddressed."
            ),
            "requirements_feedback": {
                "covered": ["Captured the core functional requirements", "Identified key non-functional goals"],
                "missing": ["Quantify scale (QPS, storage, read:write ratio)", "Clarify consistency vs availability priorities"],
            },
            "hld_feedback": {
                "covered": ["Clear separation of API, cache, and storage tiers", "Included a load balancer"],
                "missing": ["Partitioning/sharding strategy", "Replication & failover details", "CDN/edge for large or static assets"],
            },
            "lld_feedback": {
                "covered": ["Outlined the main entities"],
                "missing": ["Concrete API contracts (methods, params, responses)", "Database schema with indexes", "Idempotency for writes"],
            },
            "model_answer_markdown": answer,
            "model_diagram_mermaid": diagram,
        }

    def _mock_system_design_evaluation(self, product: str) -> Dict[str, Any]:
        return self._mock_system_design_evaluation_static(product)

gemini = GeminiService()
