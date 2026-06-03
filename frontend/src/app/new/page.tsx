"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/auth/AuthGuard";
import { Wordmark } from "../../components/BrandLogo";
import { ThemeToggle } from "../../components/ThemeToggle";
import api from "../../lib/api";
import { ArrowLeft, Send } from "lucide-react";

interface Message {
  id: string;
  sender: "bot" | "user";
  text: string;
}

export default function NewPlan() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      sender: "bot",
      text: "AI learning assistant online. State the subject or skill you intend to master. (e.g. 'Django ORM', 'Machine Learning Basics', 'React with TypeScript')",
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState(1);
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userText = inputValue.trim();
    setInputValue("");

    setMessages((prev) => [...prev, { id: Math.random().toString(), sender: "user", text: userText }]);

    if (step === 1) {
      setTopic(userText);
      setStep(2);
      setLoading(true);
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "bot",
            text: `Subject logged: "${userText}". Specify your study window. Enter a number of days between 1 and 30.`,
          },
        ]);
        setLoading(false);
      }, 700);
    } else if (step === 2) {
      const parsedDays = parseInt(userText);
      if (isNaN(parsedDays) || parsedDays < 1 || parsedDays > 30) {
        setLoading(true);
        setTimeout(() => {
          setMessages((prev) => [
            ...prev,
            { id: Math.random().toString(), sender: "bot", text: "INVALID INPUT. Enter an integer between 1 and 30." },
          ]);
          setLoading(false);
        }, 500);
        return;
      }

      setStep(3);
      setLoading(true);
      setMessages((prev) => [
        ...prev,
        {
          id: Math.random().toString(),
          sender: "bot",
          text: `Constructing ${parsedDays}-day curriculum for "${topic}". Stand by — Gemini compiling…`,
        },
      ]);

      try {
        const response = await api.post("/plans", { topic, total_days: parsedDays });
        const generatedPlan = response.data;
        setMessages((prev) => [
          ...prev,
          { id: Math.random().toString(), sender: "bot", text: "PLAN FORGED. Routing to curriculum…" },
        ]);
        setTimeout(() => router.push(`/plan/${generatedPlan.id}`), 1500);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          { id: Math.random().toString(), sender: "bot", text: "FAULT DETECTED. Restarting sequence — state the topic to study." },
        ]);
        setStep(1);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-paper text-ink flex flex-col blueprint">

        {/* ── Header ──────────────────────────────── */}
        <header className="relative z-20 border-b-2 border-ink bg-paper px-5 md:px-8 h-14 flex items-center gap-4 sticky top-0">
          <Link href="/dashboard" className="btn-outline p-2 flex items-center" title="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Wordmark size="sm" />
          <span className="mono-label-sm text-ink-500 hidden sm:inline ml-2 border-l border-ink pl-4">NEW STUDY PLAN / INTAKE</span>
          <ThemeToggle className="ml-auto !p-2" />
        </header>

        {/* ── Chat ─────────────────────────────────── */}
        <main className="relative z-10 flex-grow max-w-2xl w-full mx-auto px-4 py-6 flex flex-col overflow-y-auto">
          <div className="flex-grow space-y-px bg-ink border-2 border-ink">
            {messages.map((msg) => (
              <div key={msg.id} className="bg-paper px-4 py-3.5 fade-up">
                <p className={`mono-label-sm mb-1.5 ${msg.sender === "user" ? "text-hazard" : "text-ink-500"}`}>
                  {msg.sender === "user" ? ">> OPERATOR" : "// ASSISTANT"}
                </p>
                <p className={`text-sm leading-relaxed ${msg.sender === "user" ? "font-mono text-ink" : "text-ink-700"}`}>
                  {msg.text}
                </p>
              </div>
            ))}

            {loading && (
              <div className="bg-paper px-4 py-3.5 fade-up">
                <p className="mono-label-sm text-ink-500 mb-1.5">// ASSISTANT</p>
                <div className="flex items-center gap-2">
                  <div className="flex items-end gap-0.5 h-3">
                    {[0,1,2].map(i => <div key={i} className="w-1 h-full bg-ink telem-bar" style={{ animationDelay: `${i*0.12}s` }} />)}
                  </div>
                  <span className="mono-label-sm text-ink-400">PROCESSING<span className="blink">_</span></span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* ── Input ────────────────────────────────── */}
        <footer className="relative z-20 border-t-2 border-ink bg-paper-alt p-4 sticky bottom-0">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSend} className="flex items-stretch gap-px bg-ink border-2 border-ink">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={step === 3 || loading}
                placeholder={
                  step === 1 ? "TOPIC TO MASTER…" : step === 2 ? "DAYS (1–30)…" : "GENERATING…"
                }
                className="field-ind border-0 flex-grow px-4 py-3 text-sm disabled:opacity-50 uppercase placeholder:normal-case"
                autoFocus
              />
              <button
                type="submit"
                disabled={step === 3 || loading || !inputValue.trim()}
                className="btn-ind px-5 disabled:opacity-40 disabled:cursor-not-allowed flex items-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </footer>
      </div>
    </AuthGuard>
  );
}
