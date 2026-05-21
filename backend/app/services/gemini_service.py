import json
import re
import google.generativeai as genai
from typing import List, Dict, Any
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
For example:
ARTICLE_IDEAS: ["5 Django ORM tricks every beginner misses", "How Django QuerySets are lazy and why it matters", "Building efficient DB queries in Django"]"""
            
            response = model.generate_content(prompt)
            full_text = response.text
            
            # Parse ideas
            ideas = ["How to build projects with " + topic_title, "Advanced guide to " + topic_title, "Mistakes to avoid in " + topic_title]
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
                            
            return {"content": content, "article_ideas": ideas}
        except Exception as e:
            print(f"Gemini generate_topic_content failed: {e}. Using mock backup.")
            return self._mock_content(plan_topic, topic_title)

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

gemini = GeminiService()
