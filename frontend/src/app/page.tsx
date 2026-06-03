"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import { LogoMark, Wordmark } from "../components/BrandLogo";
import { ThemeToggle } from "../components/ThemeToggle";
import { ArrowRight } from "lucide-react";

/* ── Data ───────────────────────────────────────────────── */
const TICKER = [
  "AI STUDY PLANS", "ELEVENLABS VOICE AI", "AUDIO LESSONS",
  "GEMINI 2.5 FLASH", "VOICE MOCK INTERVIEWS", "SCORE REPORTS",
  "DAY-BY-DAY CURRICULUM", "ARTICLE REFINER", "REAL-TIME FEEDBACK",
];

const SYSTEMS = [
  {
    idx: "01",
    code: "SYS / PLAN",
    title: "AI STUDY PLANS",
    body: "Declare a topic and a timeline. Gemini 2.5 Flash assembles a hyper-structured day-by-day curriculum from first principles.",
  },
  {
    idx: "02",
    code: "SYS / READ",
    title: "DEEP READINGS",
    body: "Premium AI-generated technical articles per topic, permanently cached to your profile. Lazily generated, served instantly.",
  },
  {
    idx: "03",
    code: "SYS / VOICE",
    title: "AUDIO LESSONS",
    body: "ElevenLabs Conversational AI turns every article into a two-way spoken lesson. Interrupt, question, explore — live.",
  },
  {
    idx: "04",
    code: "SYS / EVAL",
    title: "VOICE INTERVIEWS",
    body: "Interviewer agent ALEX asks technical questions by voice, one at a time. Gemini scores every answer and issues a report.",
  },
];

const STEPS = [
  {
    n: "01",
    heading: "AI BUILDS YOUR CURRICULUM",
    body: "Tell PrepStudio your topic and timeline. Gemini assembles a structured day-by-day plan — every morning your next module is ready.",
  },
  {
    n: "02",
    heading: "NOVA TEACHES IT ALOUD",
    body: "Click Audio Lesson. Your ElevenLabs tutor takes the article and teaches it — analogies, examples, live Q&A. A full voice conversation.",
  },
  {
    n: "03",
    heading: "ALEX INTERVIEWS YOU",
    body: "An AI interviewer asks technical questions based on your plan — by voice. Gemini scores every answer and generates your report.",
  },
];

const PHILOSOPHY =
  "Every expert was once a beginner who refused to stay one. PrepStudio compresses years of learning into focused AI-guided sessions built precisely for the moment you have to prove what you know.";

/* ── Component ──────────────────────────────────────────── */
export default function LandingPage() {
  const { user, loading } = useAuthStore();

  const bentoRef  = useRef<HTMLDivElement>(null);
  const stackRef  = useRef<HTMLDivElement>(null);
  const scrubRef  = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    let cancelled = false;
    const init = async () => {
      const { gsap }          = await import("gsap");
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
    <main className="overflow-x-hidden w-full max-w-full bg-paper text-ink font-sans">

      {/* ── NAV ───────────────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-paper border-b-2 border-ink">
        <nav className="max-w-[1400px] mx-auto flex items-center justify-between px-5 md:px-8 h-14">
          <Wordmark size="md" />
          <div className="hidden md:flex items-center gap-8 mono-label text-ink-500">
            <a href="#features" className="hover:text-hazard transition-colors">[ FEATURES ]</a>
            <a href="#how"      className="hover:text-hazard transition-colors">[ PROCESS ]</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle className="!p-2" />
            {loading ? (
              <div className="flex items-end gap-0.5 h-4">
                {[0,1,2].map(i => <div key={i} className="w-1 h-full bg-ink telem-bar" style={{ animationDelay: `${i*0.12}s` }} />)}
              </div>
            ) : user ? (
              <Link href="/dashboard" className="btn-ind px-4 py-2 text-[11px]">DASHBOARD</Link>
            ) : (
              <>
                <Link href="/login"  className="mono-label text-ink-500 hover:text-ink transition-colors hidden sm:inline">LOG IN</Link>
                <Link href="/signup" className="btn-ind px-4 py-2 text-[11px]">START FREE</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative pt-14 border-b-2 border-ink blueprint">
        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">

          {/* Left: copy */}
          <div className="border-ink lg:border-r-2 px-5 md:px-8 py-14 md:py-20 flex flex-col justify-center">
            <div className="hero-anim flex items-center gap-3 mb-8 mono-label-sm text-ink-500">
              <span className="bg-hazard text-paper px-2 py-1">REC ●</span>
              <span>ELEVENLABS HACKATHON №09</span>
              <span className="text-ink-300">/ REV 2.6</span>
            </div>

            <h1 className="hero-anim macro text-[clamp(3.2rem,8.5vw,8rem)] mb-2">
              STUDY<br />
              SMARTER.<br />
              <span className="text-hazard">SPEAK</span><br />
              SHARPER.
            </h1>

            <div className="hero-anim w-full h-[2px] bg-ink my-7" />

            <p className="hero-anim text-ink-700 text-base md:text-lg max-w-[460px] leading-relaxed mb-9">
              From blank topic to confident voice. AI study plans, interactive
              audio lessons, and voice mock interviews — one apparatus.
            </p>

            <div className="hero-anim flex flex-col sm:flex-row gap-3">
              <Link href={user ? "/dashboard" : "/signup"}
                    className="btn-ind inline-flex items-center justify-center gap-2.5 px-7 py-4 text-xs">
                START LEARNING FREE
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#how" className="btn-outline inline-flex items-center justify-center px-7 py-4 text-xs">
                SEE THE PROCESS
              </a>
            </div>
          </div>

          {/* Right: specification sheet */}
          <div className="hero-anim px-5 md:px-8 py-14 md:py-20 flex items-center bg-paper-alt">
            <div className="panel w-full">
              <div className="flex items-center justify-between border-b-2 border-ink px-5 py-3">
                <span className="mono-label-sm text-ink">UNIT / D-03</span>
                <span className="mono-label-sm text-paper bg-ink px-2 py-1">IN PROGRESS</span>
              </div>

              <div className="px-5 py-4 border-b border-ink">
                <p className="mono-label-sm text-ink-500 mb-1">CURRENT TRACK</p>
                <p className="macro text-2xl">SYSTEM DESIGN — DAY 03/14</p>
              </div>

              <dl className="hairline-grid grid-cols-1">
                {[
                  { name: "CAP THEOREM",        status: "DONE",  on: true  },
                  { name: "CONSISTENT HASHING", status: "NOW",   on: true,  active: true },
                  { name: "LOAD BALANCING",     status: "QUEUE", on: false },
                ].map(({ name, status, active }) => (
                  <div key={name} className={`flex items-center justify-between px-5 py-3.5 bg-paper ${active ? "bg-paper-dark" : ""}`}>
                    <div className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 ${status === "QUEUE" ? "border border-ink" : status === "NOW" ? "bg-hazard" : "bg-ink"}`} />
                      <span className={`mono-label ${status === "QUEUE" ? "text-ink-400" : "text-ink"}`}>{name}</span>
                    </div>
                    <span className={`mono-label-sm ${status === "NOW" ? "text-hazard" : "text-ink-500"}`}>{status}</span>
                  </div>
                ))}
              </dl>

              <div className="px-5 py-4 border-t-2 border-ink">
                <div className="flex items-center justify-between mb-2">
                  <span className="mono-label-sm text-ink-500">INTERVIEW READINESS</span>
                  <span className="mono-label text-hazard">64%</span>
                </div>
                <div className="h-3 border border-ink halftone">
                  <div className="gauge-fill h-full bg-ink" style={{ width: 0 }} />
                </div>
              </div>

              <div className="flex items-stretch border-t-2 border-ink">
                <span className="flex-1 mono-label-sm text-ink-500 px-5 py-2.5 border-r border-ink">PWR / GEMINI AI</span>
                <span className="flex-1 mono-label-sm text-ink-500 px-5 py-2.5">VOX / ELEVENLABS</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── DATA TICKER ───────────────────────────────────── */}
      <div className="bg-ink overflow-hidden border-b-2 border-ink">
        <div className="animate-marquee py-3">
          {[...TICKER, ...TICKER].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-4 mono-label-sm text-paper pr-4 flex-shrink-0">
              {item}<span className="text-hazard">///</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── SYSTEMS GRID ──────────────────────────────────── */}
      <section id="features" className="border-b-2 border-ink">
        <div className="max-w-[1400px] mx-auto">
          <div className="px-5 md:px-8 py-14 border-b-2 border-ink flex flex-col md:flex-row md:items-end justify-between gap-4">
            <h2 className="macro text-[clamp(2.4rem,5vw,4.5rem)]">
              FOUR SYSTEMS.<br />ONE APPARATUS.
            </h2>
            <span className="mono-label text-ink-500">[ FIG. A — SUBSYSTEM INDEX ]</span>
          </div>

          <div ref={bentoRef} className="hairline-grid grid-cols-1 md:grid-cols-2">
            {SYSTEMS.map(({ idx, code, title, body }) => (
              <div key={idx} className="sys-cell bg-paper px-5 md:px-8 py-10 group hover:bg-paper-alt transition-colors">
                <div className="flex items-start justify-between mb-6">
                  <span className="macro text-[clamp(3rem,6vw,5rem)] text-ink leading-none group-hover:text-hazard transition-colors">{idx}</span>
                  <span className="mono-label-sm text-ink-500 mt-2">[ {code} ]</span>
                </div>
                <h3 className="macro text-2xl mb-3">{title}</h3>
                <p className="text-ink-700 text-sm leading-relaxed max-w-md">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROCESS / HOW IT WORKS ────────────────────────── */}
      <section id="how" className="border-b-2 border-ink bg-paper-alt">
        <div className="max-w-[1400px] mx-auto">
          <div className="px-5 md:px-8 py-14 border-b-2 border-ink flex items-end justify-between">
            <h2 className="macro text-[clamp(2.4rem,5vw,4.5rem)]">OPERATING<br />PROCEDURE</h2>
            <span className="mono-label text-ink-500 hidden md:inline">[ 03 STEPS ]</span>
          </div>

          <div ref={stackRef} className="hairline-grid grid-cols-1 md:grid-cols-3">
            {STEPS.map(({ n, heading, body }) => (
              <div key={n} className="step-cell bg-paper px-5 md:px-8 py-10 flex flex-col">
                <span className="macro text-[clamp(4rem,9vw,7rem)] text-hazard leading-none mb-4">{n}</span>
                <div className="w-full h-[2px] bg-ink mb-5" />
                <h3 className="macro text-xl mb-3">{heading}</h3>
                <p className="text-ink-700 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY SCRUB ──────────────────────────────── */}
      <section className="border-b-2 border-ink">
        <div className="max-w-[1100px] mx-auto px-5 md:px-8 py-24 md:py-36">
          <span className="mono-label text-hazard block mb-8">[ DOCTRINE ]</span>
          <p ref={scrubRef} className="macro text-[clamp(1.7rem,4vw,3.4rem)] leading-[1.05]">
            {philosophyWords.map((word, i) => (
              <span key={i} className="word inline-block mr-[0.22em]">{word}</span>
            ))}
          </p>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="border-b-2 border-ink bg-ink text-paper">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-24 md:py-32 text-center">
          <span className="mono-label-sm text-paper/60 block mb-8">[ TERMINAL / READY ]</span>
          <h2 className="font-display font-black uppercase tracking-tightest leading-[0.88] text-[clamp(3rem,9vw,8rem)] mb-10">
            READY TO BUILD<br /><span className="text-hazard">MASTERY?</span>
          </h2>
          <Link href={user ? "/dashboard" : "/signup"}
                className="btn-hazard inline-flex items-center gap-3 px-10 py-5 text-sm">
            START FOR FREE
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────── */}
      <footer className="bg-paper">
        <div className="max-w-[1400px] mx-auto px-5 md:px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <Wordmark size="sm" />
          <div className="flex items-center gap-6 mono-label-sm text-ink-500">
            <a href="#features" className="hover:text-hazard transition-colors">FEATURES</a>
            <a href="#how" className="hover:text-hazard transition-colors">PROCESS</a>
            <Link href="/privacy" className="hover:text-hazard transition-colors">PRIVACY</Link>
            <Link href="/terms" className="hover:text-hazard transition-colors">TERMS</Link>
          </div>
          <p className="mono-label-sm text-ink-400">© {new Date().getFullYear()} PREPSTUDIO ®</p>
        </div>
      </footer>
    </main>
  );
}
