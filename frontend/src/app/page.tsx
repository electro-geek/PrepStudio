"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import { Wordmark } from "../components/BrandLogo";
import { ThemePicker } from "../components/ThemeToggle";
import { ArrowRight } from "lucide-react";

/* ── Data ───────────────────────────────────────────────── */
const TICKER = [
  "AI STUDY PLANS", "ELEVENLABS VOICE AI", "AUDIO LESSONS",
  "GEMINI 2.5 FLASH", "VOICE MOCK INTERVIEWS", "SCORE REPORTS",
  "DAY-BY-DAY CURRICULUM", "ARTICLE REFINER", "REAL-TIME FEEDBACK",
  "SYSTEM DESIGN STUDIO", "DRAW-TO-EVALUATE CANVAS", "HLD / LLD SCORING",
];

const SYSTEMS = [
  {
    idx: "01",
    code: "sys / plan",
    title: "AI Study Plans",
    body: "Declare a topic and a timeline. Gemini 2.5 Flash assembles a hyper-structured day-by-day curriculum from first principles.",
  },
  {
    idx: "02",
    code: "sys / read",
    title: "Deep Readings",
    body: "Premium AI-generated technical articles per topic, permanently cached to your profile. Lazily generated, served instantly.",
  },
  {
    idx: "03",
    code: "sys / voice",
    title: "Audio Lessons",
    body: "ElevenLabs Conversational AI turns every article into a two-way spoken lesson. Interrupt, question, explore — live.",
  },
  {
    idx: "04",
    code: "sys / eval",
    title: "Voice Interviews",
    body: "Interviewer agent ALEX asks technical questions by voice, one at a time. Gemini scores every answer and issues a report.",
  },
  {
    idx: "05",
    code: "sys / design",
    title: "System Design Studio",
    body: "Tackle real product design challenges, easy to hard. Draw your architecture on an interactive canvas — Gemini scores your HLD and LLD, flags what's missing, and returns the ideal diagram.",
  },
];

const STEPS = [
  {
    n: "01",
    heading: "AI builds your curriculum",
    body: "Tell PrepStudio your topic and timeline. Gemini assembles a structured day-by-day plan — every morning your next module is ready.",
  },
  {
    n: "02",
    heading: "Nova teaches it aloud",
    body: "Click Audio Lesson. Your ElevenLabs tutor takes the article and teaches it — analogies, examples, live Q&A. A full voice conversation.",
  },
  {
    n: "03",
    heading: "Alex interviews you",
    body: "An AI interviewer asks technical questions based on your plan — by voice. Gemini scores every answer and generates your report.",
  },
];

const PHILOSOPHY =
  "Every expert was once a beginner who refused to stay one. PrepStudio compresses years of learning into focused AI-guided sessions built precisely for the moment you have to prove what you know.";

/* ── Component ──────────────────────────────────────────── */
export default function LandingPage() {
  const { user, loading } = useAuthStore();

  const bentoRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const scrubRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const { gsap } = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      gsap.from(".hero-anim", {
        y: reduced ? 0 : 40, opacity: 0,
        duration: reduced ? 0.01 : 0.8, stagger: reduced ? 0 : 0.08,
        ease: "power3.out", clearProps: "all",
      });
      gsap.fromTo(".gauge-fill", { width: "0%" }, {
        width: "64%", duration: reduced ? 0.01 : 1.3, ease: "power2.out", delay: reduced ? 0 : 0.6,
      });

      gsap.from(".sys-cell", {
        opacity: 0, y: reduced ? 0 : 24,
        duration: reduced ? 0.01 : 0.6, stagger: reduced ? 0 : 0.07, ease: "power2.out", clearProps: "all",
        scrollTrigger: { trigger: bentoRef.current, start: "top 82%" },
      });

      gsap.from(".step-cell", {
        opacity: 0, x: reduced ? 0 : -24,
        duration: reduced ? 0.01 : 0.6, stagger: reduced ? 0 : 0.1, ease: "power2.out", clearProps: "all",
        scrollTrigger: { trigger: stackRef.current, start: "top 80%" },
      });

      if (scrubRef.current && !reduced) {
        const words = scrubRef.current.querySelectorAll<HTMLElement>(".word");
        gsap.fromTo(words, { opacity: 0.12 }, {
          opacity: 1, stagger: 0.04, ease: "none",
          scrollTrigger: { trigger: scrubRef.current, start: "top 70%", end: "bottom 35%", scrub: 1.5 },
        });
      }
    };
    init();
    return () => { cancelled = true; };
  }, []);

  const philosophyWords = PHILOSOPHY.split(" ");

  return (
    <main className="overflow-x-hidden w-full max-w-full text-foreground font-sans">

      {/* ── NAV ───────────────────────────────────────────── */}
      <header className="nav-glass">
        <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-5 md:px-8 h-14">
          <Wordmark size="md" />
          <div className="hidden md:flex items-center gap-8 section-label">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how" className="hover:text-primary transition-colors">Process</a>
          </div>
          <div className="flex items-center gap-2.5">
            <ThemePicker />
            {loading ? (
              <div className="flex items-end gap-0.5 h-4">
                {[0, 1, 2].map((i) => <div key={i} className="w-1 h-full bg-primary telem-bar" style={{ animationDelay: `${i * 0.12}s` }} />)}
              </div>
            ) : user ? (
              <Link href="/dashboard" className="btn !py-2 text-sm">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="section-label hover:text-foreground transition-colors hidden sm:inline">Log in</Link>
                <Link href="/signup" className="btn !py-2 text-sm">Start free</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative grid-bg">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-8 px-5 md:px-8 py-14 md:py-20">

          {/* Left: copy */}
          <div className="flex flex-col justify-center">
            <div className="hero-anim flex items-center gap-3 mb-7">
              <span className="badge-secondary">REC ●</span>
              <span className="section-label">AI study &amp; voice interview system</span>
            </div>

            <h1 className="hero-anim font-display font-extrabold tracking-tight leading-[0.98] text-[clamp(3rem,8vw,7rem)] mb-5">
              Study smarter.<br />
              <span className="text-primary">Speak</span> sharper.
            </h1>

            <p className="hero-anim text-muted text-base md:text-lg max-w-[460px] leading-relaxed mb-8">
              From blank topic to confident voice. AI study plans, interactive
              audio lessons, and voice mock interviews — one apparatus.
            </p>

            <div className="hero-anim flex flex-col sm:flex-row gap-3">
              <Link href={user ? "/dashboard" : "/signup"} className="btn px-7 py-3.5 text-sm">
                Start learning free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="btn-ghost px-7 py-3.5 text-sm">See the process</a>
            </div>
          </div>

          {/* Right: specification card */}
          <div className="hero-anim flex items-center">
            <div className="card card-hover w-full overflow-hidden">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="font-mono text-xs text-muted">unit / d-03</span>
                <span className="badge-primary">In progress</span>
              </div>

              <div className="px-5 py-4 border-b border-border">
                <p className="section-label mb-1.5">Current track</p>
                <p className="font-display font-bold text-xl">System Design — Day 03/14</p>
              </div>

              <dl>
                {[
                  { name: "CAP Theorem", status: "Done", state: "done" },
                  { name: "Consistent Hashing", status: "Now", state: "now" },
                  { name: "Load Balancing", status: "Queued", state: "queue" },
                ].map(({ name, status, state }) => (
                  <div key={name} className={`flex items-center justify-between px-5 py-3.5 border-b border-border ${state === "now" ? "viz-current" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className={`h-2.5 w-2.5 rounded-full ${state === "queue" ? "border border-current opacity-50" : state === "now" ? "bg-current" : "bg-primary"}`} />
                      <span className={`text-sm font-medium ${state === "queue" ? "text-muted" : ""}`}>{name}</span>
                    </div>
                    <span className={`text-xs font-semibold ${state === "now" ? "" : "text-muted"}`}>{status}</span>
                  </div>
                ))}
              </dl>

              <div className="px-5 py-4 border-b border-border">
                <div className="flex items-center justify-between mb-2">
                  <span className="section-label">Interview readiness</span>
                  <span className="text-sm font-bold text-primary">64%</span>
                </div>
                <div className="h-2.5 rounded-full bg-panel overflow-hidden">
                  <div className="gauge-fill h-full bg-primary rounded-full" style={{ width: 0 }} />
                </div>
              </div>

              <div className="flex items-stretch font-mono text-[11px] text-muted">
                <span className="flex-1 px-5 py-2.5 border-r border-border">pwr / gemini ai</span>
                <span className="flex-1 px-5 py-2.5">vox / elevenlabs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DATA TICKER ───────────────────────────────────── */}
      <div className="bg-panel border-y border-border overflow-hidden">
        <div className="animate-marquee py-3">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 font-mono text-[11px] uppercase tracking-wider text-muted pr-4 flex-shrink-0">
              {item}<span className="text-primary">///</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── SYSTEMS GRID ──────────────────────────────────── */}
      <section id="features" className="max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <h2 className="font-display font-extrabold tracking-tight text-[clamp(2.2rem,5vw,4rem)] leading-[1.02]">
            Five systems.<br />One apparatus.
          </h2>
          <span className="section-label">Fig. A — subsystem index</span>
        </div>

        <div ref={bentoRef} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SYSTEMS.map(({ idx, code, title, body }) => (
            <div key={idx} className="sys-cell card card-hover group px-6 md:px-8 py-9">
              <div className="flex items-start justify-between mb-5">
                <span className="stat-num text-[clamp(2.6rem,5vw,4rem)] leading-none text-foreground group-hover:text-primary transition-colors">{idx}</span>
                <span className="font-mono text-[11px] text-muted mt-2">[ {code} ]</span>
              </div>
              <h3 className="font-display font-bold text-2xl mb-2.5">{title}</h3>
              <p className="text-muted text-sm leading-relaxed max-w-md">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROCESS ───────────────────────────────────────── */}
      <section id="how" className="border-y border-border bg-surface/40">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-16 md:py-24">
          <div className="flex items-end justify-between mb-10">
            <h2 className="font-display font-extrabold tracking-tight text-[clamp(2.2rem,5vw,4rem)] leading-[1.02]">
              Operating<br />procedure
            </h2>
            <span className="section-label hidden md:inline">03 steps</span>
          </div>

          <div ref={stackRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {STEPS.map(({ n, heading, body }) => (
              <div key={n} className="step-cell card px-6 md:px-8 py-9 flex flex-col">
                <span className="stat-num text-[clamp(3rem,7vw,5rem)] text-secondary leading-none mb-4">{n}</span>
                <div className="w-10 h-1 rounded-full bg-primary mb-5" />
                <h3 className="font-display font-bold text-lg mb-2.5">{heading}</h3>
                <p className="text-muted text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY SCRUB ──────────────────────────────── */}
      <section className="max-w-[1100px] mx-auto px-5 md:px-8 py-24 md:py-36">
        <span className="section-label text-primary block mb-8">Doctrine</span>
        <p ref={scrubRef} className="font-display font-extrabold tracking-tight text-[clamp(1.7rem,4vw,3.2rem)] leading-[1.12]">
          {philosophyWords.map((word, i) => (
            <span key={i} className="word inline-block mr-[0.22em]">{word}</span>
          ))}
        </p>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="max-w-[1400px] mx-auto px-5 md:px-8 pb-20">
        <div className="card grid-bg text-center px-6 py-20 md:py-28 overflow-hidden">
          <span className="section-label text-primary block mb-7">Terminal / ready</span>
          <h2 className="font-display font-extrabold tracking-tight leading-[0.95] text-[clamp(2.6rem,8vw,6.5rem)] mb-10">
            Ready to build<br /><span className="text-primary">mastery?</span>
          </h2>
          <Link href={user ? "/dashboard" : "/signup"} className="btn inline-flex px-10 py-4 text-base">
            Start for free
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Wordmark size="sm" />
          <div className="flex items-center gap-6 section-label">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#how" className="hover:text-primary transition-colors">Process</a>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
          <p className="font-mono text-[11px] text-muted">© {new Date().getFullYear()} PrepStudio</p>
        </div>
      </footer>
    </main>
  );
}
