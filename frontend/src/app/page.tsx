"use client";

import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import { BookOpen, Mic, PenTool, Calendar, ArrowRight, Sparkles, Zap, Shield, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    icon: Calendar,
    title: "AI Study Plans",
    desc: "Tell us your topic and timeline. Gemini builds a hyper-personalized day-by-day curriculum instantly.",
    color: "from-violet-500/20 to-indigo-500/10",
    iconColor: "text-violet-400",
    border: "hover:border-violet-500/40",
    glow: "rgba(139,92,246,0.15)",
  },
  {
    icon: BookOpen,
    title: "Deep Readings",
    desc: "Premium AI-generated technical articles per topic, cached forever to your profile for instant access.",
    color: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-400",
    border: "hover:border-blue-500/40",
    glow: "rgba(59,130,246,0.15)",
  },
  {
    icon: Mic,
    title: "Vocal AI Interviews",
    desc: "Speak your answers to 8 AI-generated interview questions and receive a scored performance report.",
    color: "from-teal-500/20 to-emerald-500/10",
    iconColor: "text-teal-400",
    border: "hover:border-teal-500/40",
    glow: "rgba(20,184,166,0.15)",
  },
  {
    icon: PenTool,
    title: "Article Refiner",
    desc: "Paste rough study notes. Gemini rewrites them into polished blog posts and viral Twitter threads.",
    color: "from-emerald-500/20 to-lime-500/10",
    iconColor: "text-emerald-400",
    border: "hover:border-emerald-500/40",
    glow: "rgba(16,185,129,0.15)",
  },
];

const STATS = [
  { value: "Gemini", label: "AI Powered", icon: Zap },
  { value: "100%", label: "Dark Mode", icon: Shield },
  { value: "∞", label: "Topics", icon: TrendingUp },
];

export default function LandingPage() {
  const { user, loading } = useAuthStore();

  return (
    <div className="relative min-h-screen flex flex-col bg-[#080c14] text-white noise grid-bg overflow-x-hidden">
      {/* Ambient glow orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] bg-indigo-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[700px] h-[700px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-teal-600/5 rounded-full blur-[100px]" />
      </div>

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="relative z-20 border-b border-white/5 bg-black/20 backdrop-blur-xl px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="bg-gradient-to-tr from-indigo-500 to-blue-500 p-2 rounded-xl shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <span className="font-black text-xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            PrepStudio
          </span>
        </div>

        <nav className="hidden md:flex items-center space-x-8 text-sm text-slate-400 font-medium">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how" className="hover:text-white transition">How It Works</a>
        </nav>

        <div className="flex items-center space-x-3">
          {loading ? (
            <div className="h-5 w-5 border-2 border-indigo-500 border-t-transparent animate-spin rounded-full" />
          ) : user ? (
            <Link href="/dashboard" className="btn-glow px-5 py-2 rounded-xl text-sm font-semibold text-white flex items-center space-x-2">
              <span>Dashboard</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          ) : (
            <>
              <Link href="/login" className="text-slate-400 hover:text-white transition text-sm font-medium px-4 py-2 rounded-xl hover:bg-white/5">
                Log In
              </Link>
              <Link href="/signup" className="btn-glow px-5 py-2 rounded-xl text-sm font-semibold text-white">
                Get Started
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <main className="relative z-10 flex flex-col items-center text-center flex-grow px-6">
        <section className="max-w-5xl mx-auto pt-24 pb-20">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 px-4 py-1.5 rounded-full text-xs font-semibold mb-8 fade-up">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Powered by Google Gemini 2.5 Flash</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter mb-6 leading-none fade-up" style={{ animationDelay: '0.1s' }}>
            Learn Anything.<br />
            <span className="grad-text">Master Everything.</span>
          </h1>

          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-light fade-up" style={{ animationDelay: '0.2s' }}>
            PrepStudio uses AI to build a personalized study plan, generate deep-dive readings, 
            simulate real interviews, and turn your notes into published articles — all in one place.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-20 fade-up" style={{ animationDelay: '0.3s' }}>
            <Link
              href={user ? "/dashboard" : "/signup"}
              className="btn-glow px-8 py-4 rounded-2xl font-bold text-base text-white flex items-center justify-center space-x-3"
            >
              <span>Start Learning Free</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 rounded-2xl font-semibold text-base text-slate-300 border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white transition flex items-center justify-center"
            >
              See Features
            </a>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-3 gap-6 max-w-sm mx-auto mb-4">
            {STATS.map(({ value, label, icon: Icon }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-black text-white mb-0.5">{value}</div>
                <div className="text-xs text-slate-500 font-medium">{label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features Grid ─────────────────────────────────── */}
        <section id="features" className="w-full max-w-6xl mx-auto px-0 pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">
              Everything you need to <span className="grad-text">go from zero to expert</span>
            </h2>
            <p className="text-slate-500 text-base max-w-xl mx-auto">Four AI-powered tools that work together to transform how you study.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 text-left">
            {FEATURES.map(({ icon: Icon, title, desc, color, iconColor, border }) => (
              <div
                key={title}
                className={`relative group glass rounded-2xl p-6 border border-white/5 ${border} transition-all duration-300 overflow-hidden cursor-default`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className={`${iconColor} bg-white/5 p-3 rounded-xl w-fit mb-5 group-hover:scale-110 transition-transform duration-200`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-base text-white mb-2">{title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── How it works ──────────────────────────────────── */}
        <section id="how" className="w-full max-w-4xl mx-auto pb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-3">How It Works</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "01", title: "Tell us your goal", desc: "Enter any topic and how many days you have. Our AI handles the rest." },
              { step: "02", title: "Study with AI", desc: "Work through daily modules with AI-generated lectures tailored to your level." },
              { step: "03", title: "Prove your mastery", desc: "Pass the vocal AI interview and publish your refined notes as articles." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="glass rounded-2xl p-6 border border-white/5 text-left">
                <div className="text-5xl font-black text-white/5 mb-4 leading-none">{step}</div>
                <h3 className="font-bold text-white text-base mb-2">{title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ────────────────────────────────────── */}
        <section className="w-full max-w-3xl mx-auto pb-24">
          <div className="relative glass rounded-3xl p-10 border border-indigo-500/20 text-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-blue-600/5 to-teal-600/10" />
            <div className="relative z-10">
              <h2 className="text-3xl font-black text-white mb-3">Ready to forge your expertise?</h2>
              <p className="text-slate-400 mb-7 text-sm leading-relaxed max-w-md mx-auto">
                Join learners who are already mastering new skills with AI-powered personalized education.
              </p>
              <Link href={user ? "/dashboard" : "/signup"} className="btn-glow px-8 py-3.5 rounded-2xl font-bold text-white inline-flex items-center space-x-2">
                <Sparkles className="h-4 w-4" />
                <span>Start for Free</span>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/5 py-6 text-center text-xs text-slate-600">
        <p>© {new Date().getFullYear()} PrepStudio · Crafted with AI · All rights reserved.</p>
      </footer>
    </div>
  );
}
