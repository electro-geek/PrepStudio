"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/auth/AuthGuard";
import api from "../../lib/api";
import { ArrowLeft, Send, User, Bot, Loader2 } from "lucide-react";

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
      text: "Hi there! I'm your AI learning assistant. What subject or skill would you like to master? (e.g. 'Django ORM', 'Machine Learning Basics', 'React with TypeScript')",
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
            text: `Excellent! "${userText}" is a fantastic choice. How many days do you have to study? Enter a number between 1 and 30.`,
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
            {
              id: Math.random().toString(),
              sender: "bot",
              text: "Please enter a valid number between 1 and 30.",
            },
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
          text: `Perfect! Constructing a ${parsedDays}-day curriculum for "${topic}". Stand by while Gemini works its magic...`,
        },
      ]);

      try {
        const response = await api.post("/plans", { topic, total_days: parsedDays });
        const generatedPlan = response.data;
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "bot",
            text: "Your study plan has been forged! Redirecting you to your new curriculum...",
          },
        ]);
        setTimeout(() => router.push(`/plan/${generatedPlan.id}`), 1500);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: Math.random().toString(),
            sender: "bot",
            text: "Something went wrong. Let's start over — what topic would you like to learn?",
          },
        ]);
        setStep(1);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#06060E] text-[#F1F5F9] flex flex-col grid-bg">
        {/* Ambient glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/8 rounded-full blur-[120px]" />
        </div>

        {/* ── Header ──────────────────────────────── */}
        <header className="relative z-20 border-b border-white/5 bg-black/30 backdrop-blur-xl px-6 py-3.5 flex items-center sticky top-0">
          <Link href="/dashboard" className="text-slate-500 hover:text-white mr-4 transition flex items-center space-x-1.5 group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
            <span className="text-sm font-medium hidden sm:inline">Back</span>
          </Link>
          <div className="flex items-center gap-2.5">
            <svg width="24" height="24" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="9"  y="9"  width="9"  height="54" rx="4.5" fill="#F1F5F9"/>
              <rect x="9"  y="9"  width="46" height="9"  rx="4.5" fill="#F1F5F9"/>
              <rect x="9"  y="36" width="25" height="9"  rx="4.5" fill="#F1F5F9"/>
              <rect x="22" y="18" width="9"  height="27" rx="4.5" fill="#6366F1"/>
              <rect x="35" y="22" width="9"  height="19" rx="4.5" fill="#6366F1" opacity="0.58"/>
              <rect x="48" y="27" width="9"  height="9"  rx="4.5" fill="#6366F1" opacity="0.28"/>
            </svg>
            <h1 className="font-black text-base text-[#F1F5F9] tracking-tight">New Study Plan</h1>
          </div>
        </header>

        {/* ── Chat ─────────────────────────────────── */}
        <main className="relative z-10 flex-grow max-w-2xl w-full mx-auto px-4 py-6 flex flex-col overflow-y-auto max-h-[calc(100vh-130px)]">
          <div className="flex-grow space-y-5 pb-4">
            {messages.map((msg, i) => (
              <div
                key={msg.id}
                className={`flex items-start space-x-3 fade-up ${msg.sender === "user" ? "flex-row-reverse space-x-reverse" : ""}`}
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                {/* Avatar */}
                <div
                  className={`p-2.5 rounded-2xl shrink-0 ${
                    msg.sender === "user"
                      ? "bg-white/5 border border-white/10 text-slate-300"
                      : "bg-[#6366F1] text-white shadow-lg shadow-indigo-500/20"
                  }`}
                >
                  {msg.sender === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </div>

                {/* Bubble */}
                <div
                  className={`rounded-2xl px-4 py-3 max-w-[82%] text-sm leading-relaxed ${
                    msg.sender === "user"
                      ? "glass border border-white/8 text-slate-200"
                      : "bg-indigo-500/8 border border-indigo-500/15 text-slate-100"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {loading && (
              <div className="flex items-start space-x-3 fade-up">
                <div className="bg-[#6366F1] text-white p-2.5 rounded-2xl shrink-0 shadow-lg shadow-indigo-500/20">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="bg-indigo-500/8 border border-indigo-500/15 rounded-2xl px-4 py-3 flex items-center space-x-2 text-slate-400 text-sm">
                  <Loader2 className="h-4 w-4 animate-spin text-indigo-400" />
                  <span>Thinking...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </main>

        {/* ── Input ────────────────────────────────── */}
        <footer className="relative z-20 border-t border-white/5 bg-black/20 backdrop-blur-xl p-4 sticky bottom-0">
          <div className="max-w-2xl mx-auto">
            <form onSubmit={handleSend} className="flex items-center space-x-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={step === 3 || loading}
                placeholder={
                  step === 1
                    ? "What do you want to learn? (e.g. Python, System Design...)"
                    : step === 2
                    ? "How many days? (1–30)"
                    : "Generating your plan..."
                }
                className="flex-grow bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition disabled:opacity-50"
                autoFocus
              />
              <button
                type="submit"
                disabled={step === 3 || loading || !inputValue.trim()}
                className="btn-glow p-3 rounded-xl text-white disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
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
