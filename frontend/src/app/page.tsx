"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import {
  ArrowRight, BookOpen, Calendar, Mic, PenTool,
  Headphones, Zap, Shield, TrendingUp,
} from "lucide-react";

/* ── Brand Logo Mark ─────────────────────────────────────── */
function LogoMark({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <rect x="9"  y="9"  width="9"  height="54" rx="4.5" fill="#F1F5F9"/>
      <rect x="9"  y="9"  width="46" height="9"  rx="4.5" fill="#F1F5F9"/>
      <rect x="9"  y="36" width="25" height="9"  rx="4.5" fill="#F1F5F9"/>
      <rect x="22" y="18" width="9"  height="27" rx="4.5" fill="#6366F1"/>
      <rect x="35" y="22" width="9"  height="19" rx="4.5" fill="#6366F1" opacity="0.58"/>
      <rect x="48" y="27" width="9"  height="9"  rx="4.5" fill="#6366F1" opacity="0.28"/>
    </svg>
  );
}

/* ── Data ───────────────────────────────────────────────── */
const MARQUEE_ITEMS = [
  "AI Study Plans", "ElevenLabs Voice AI", "Interactive Audio Lessons",
  "Gemini 2.5 Flash", "Voice Mock Interviews", "Instant Score Reports",
  "Day-by-Day Curriculum", "Article Refiner", "Real-time Feedback",
];

const STEPS = [
  {
    icon: Calendar,
    color: "#6366f1",
    heading: "AI builds your curriculum",
    body: "Tell PrepStudio your topic and timeline. Gemini 2.5 Flash assembles a hyper-structured day-by-day plan from first principles — every morning your next module is ready.",
  },
  {
    icon: Headphones,
    color: "#22D3EE",
    heading: "Nova teaches it aloud",
    body: "Click Audio Lesson. Your ElevenLabs AI tutor takes the article and teaches it — not reads it. Analogies, real-world examples, live Q&A. A full two-way voice conversation.",
  },
  {
    icon: Mic,
    color: "#22D3EE",
    heading: "Alex interviews you",
    body: "An AI interviewer asks technical questions based on your plan — by voice, one at a time. Gemini scores every answer and generates your complete performance report.",
  },
];

const ACCORDION_FEATURES = [
  { icon: Calendar, title: "AI Study Plans", sub: "Your curriculum in seconds", desc: "Tell us your topic and timeline. Gemini builds a hyper-personalized day-by-day plan from first principles.", img: "https://picsum.photos/seed/studycurriculum/800/600", accent: "#6366F1", grad: "from-indigo-950/70" },
  { icon: BookOpen, title: "Deep Readings", sub: "AI articles, cached forever", desc: "Premium AI-generated technical articles per topic, permanently cached. Deep-dive into concepts with structured content.", img: "https://picsum.photos/seed/deepread/800/600", accent: "#22D3EE", grad: "from-cyan-950/70" },
  { icon: Headphones, title: "Audio Lessons", sub: "Hear it. Ask it. Learn it.", desc: "ElevenLabs Conversational AI turns every article into an interactive spoken lesson. Interrupt, question, explore.", img: "https://picsum.photos/seed/voicelesson/800/600", accent: "#22D3EE", grad: "from-cyan-950/60" },
  { icon: Mic, title: "Voice Interviews", sub: "Speak. Get scored. Level up.", desc: "AI interviewer Alex asks questions verbally. Gemini scores every answer and builds your personalised report.", img: "https://picsum.photos/seed/interviewvoice/800/600", accent: "#F59E0B", grad: "from-amber-950/60" },
];

const PHILOSOPHY =
  "Every expert was once a beginner who refused to stay one. PrepStudio compresses years of learning into focused AI-guided sessions built precisely for the moment you have to prove what you know.";

/* ── Component ──────────────────────────────────────────── */
export default function LandingPage() {
  const { user, loading } = useAuthStore();

  const heroRef      = useRef<HTMLElement>(null);
  const spotRef      = useRef<HTMLDivElement>(null);
  const ctaBtnRef    = useRef<HTMLDivElement>(null);
  const bentoRef     = useRef<HTMLDivElement>(null);
  const stackRef     = useRef<HTMLDivElement>(null);
  const scrubRef     = useRef<HTMLParagraphElement>(null);
  const heroCardRef  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    const cleanupFns: Array<() => void> = [];

    const init = async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;
      gsap.registerPlugin(ScrollTrigger);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* Hero stagger */
      gsap.from(".hero-anim", {
        y: reduced ? 0 : 64,
        opacity: 0,
        duration: reduced ? 0.01 : 1.15,
        stagger: reduced ? 0 : 0.11,
        ease: "power4.out",
        clearProps: "all",
      });
      gsap.fromTo(".hero-progress-fill", { width: "0%" }, {
        width: "64%",
        duration: reduced ? 0.01 : 1.5,
        ease: "power2.out",
        delay: reduced ? 0 : 0.9,
      });

      /* Bento cards scale-in */
      gsap.from(".bento-card", {
        scale: reduced ? 1 : 0.88,
        opacity: 0,
        duration: reduced ? 0.01 : 0.88,
        stagger: reduced ? 0 : 0.09,
        ease: "power3.out",
        clearProps: "all",
        scrollTrigger: { trigger: bentoRef.current, start: "top 80%" },
      });

      /* Card stacking entrance */
      gsap.utils.toArray<HTMLElement>(".stack-card").forEach((card, i) => {
        gsap.from(card, {
          y: reduced ? 0 : 120 + i * 24,
          opacity: 0,
          scale: reduced ? 1 : 0.91,
          duration: reduced ? 0.01 : 0.92,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: { trigger: stackRef.current, start: "top 78%", toggleActions: "play none none none" },
          delay: reduced ? 0 : i * 0.12,
        });
      });

      /* Scrubbing text reveal */
      if (scrubRef.current) {
        const words = scrubRef.current.querySelectorAll<HTMLElement>(".word");
        if (reduced) {
          gsap.set(words, { opacity: 1 });
        } else {
          gsap.fromTo(words, { opacity: 0.07 }, {
            opacity: 1,
            stagger: 0.045,
            ease: "none",
            scrollTrigger: { trigger: scrubRef.current, start: "top 65%", end: "bottom 30%", scrub: 1.8 },
          });
        }
      }

      /* Accordion images scale-in */
      gsap.utils.toArray<HTMLElement>(".accord-img").forEach((img) => {
        gsap.from(img, {
          scale: reduced ? 1 : 1.14,
          duration: reduced ? 0.01 : 1.2,
          ease: "power2.out",
          clearProps: "all",
          scrollTrigger: { trigger: img.closest(".accord-slice"), start: "top 85%" },
        });
      });

      if (reduced) return;

      /* Cursor spotlight */
      if (spotRef.current && heroRef.current) {
        const spot = spotRef.current;
        const hero = heroRef.current;
        const xSet = gsap.quickSetter(spot, "x", "px");
        const ySet = gsap.quickSetter(spot, "y", "px");
        const onMove = (e: MouseEvent) => {
          const r = hero.getBoundingClientRect();
          xSet(e.clientX - r.left); ySet(e.clientY - r.top);
          gsap.to(spot, { opacity: 1, duration: 0.4, overwrite: true });
        };
        const onLeave = () => gsap.to(spot, { opacity: 0, duration: 0.7, overwrite: true });
        hero.addEventListener("mousemove", onMove);
        hero.addEventListener("mouseleave", onLeave);
        cleanupFns.push(() => { hero.removeEventListener("mousemove", onMove); hero.removeEventListener("mouseleave", onLeave); });
      }

      /* Hero card 3-D tilt */
      if (heroCardRef.current) {
        const card = heroCardRef.current;
        const onMove = (e: MouseEvent) => {
          const r   = card.getBoundingClientRect();
          const rx  = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -7;
          const ry  = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  7;
          card.style.transition = "transform 0.1s ease-out";
          card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.025,1.025,1.025)`;
        };
        const onLeave = () => {
          card.style.transition = "transform 0.6s cubic-bezier(0.23,1,0.32,1)";
          card.style.transform  = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
        };
        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
        cleanupFns.push(() => { card.removeEventListener("mousemove", onMove); card.removeEventListener("mouseleave", onLeave); });
      }

      /* Magnetic CTA */
      if (ctaBtnRef.current) {
        const wrapper = ctaBtnRef.current;
        const inner   = wrapper.querySelector<HTMLElement>("a");
        if (inner) {
          const onMove  = (e: MouseEvent) => { const r = wrapper.getBoundingClientRect(); gsap.to(inner, { x: (e.clientX - r.left - r.width / 2) * 0.28, y: (e.clientY - r.top - r.height / 2) * 0.28, duration: 0.4, ease: "power2.out" }); };
          const onLeave = () => gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1,0.45)" });
          wrapper.addEventListener("mousemove", onMove);
          wrapper.addEventListener("mouseleave", onLeave);
          cleanupFns.push(() => { wrapper.removeEventListener("mousemove", onMove); wrapper.removeEventListener("mouseleave", onLeave); });
        }
      }
    };

    init();
    return () => { cancelled = true; cleanupFns.forEach(fn => fn()); };
  }, []);

  const philosophyWords = PHILOSOPHY.split(" ");

  return (
    <main
      className="overflow-x-hidden w-full max-w-full bg-[#06060E] text-white"
      style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Ambient orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-56 left-[18%] w-[860px] h-[860px] rounded-full bg-indigo-700/[7%] blur-[160px]" />
        <div className="absolute top-[38%] -right-56 w-[680px] h-[680px] rounded-full bg-[#22D3EE]/[3%] blur-[150px]" />
        <div className="absolute bottom-0 left-[28%] w-[600px] h-[600px] rounded-full bg-indigo-600/[4%] blur-[130px]" />
      </div>

      {/* ── NAVIGATION ────────────────────────────────────── */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[740px]">
        <nav className="flex items-center justify-between px-5 py-3 rounded-2xl border border-white/[7%] bg-black/55 backdrop-blur-2xl shadow-2xl shadow-black/60">
          <div className="flex items-center gap-2.5">
            <LogoMark size={32} />
            <div className="flex items-baseline gap-[1px] text-[17px] tracking-tight">
              <span className="font-black text-[#F1F5F9]">prep</span>
              <span className="font-light text-[#F1F5F9]/38">studio</span>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm text-white/40 font-medium">
            <a href="#features" className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#how"      className="hover:text-white transition-colors duration-200">How it works</a>
          </div>
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-4 w-4 border-2 border-indigo-400 border-t-transparent animate-spin rounded-full" />
            ) : user ? (
              <Link href="/dashboard" className="bg-white text-black px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors cursor-pointer">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login"  className="text-white/40 hover:text-white text-sm font-medium px-3 py-1.5 transition-colors cursor-pointer">Log in</Link>
                <Link href="/signup" className="bg-white text-black px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors cursor-pointer">Start free</Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── HERO (ATTENTION) ──────────────────────────────── */}
      <section ref={heroRef} className="relative z-10 min-h-screen flex items-center pt-40 pb-28 px-6 xl:px-20">

        {/* Cursor spotlight */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div ref={spotRef} className="absolute w-[600px] h-[600px] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0"
               style={{ background: "radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)" }} />
        </div>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[58%_42%] gap-16 items-center">

          {/* Left: copy */}
          <div>
            {/* Eyebrow pill */}
            <div className="hero-anim flex items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 px-4 py-1.5 rounded-full cursor-default">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-indigo-300 text-[11px] font-semibold tracking-wider">ElevenLabs Hackathon 2025</span>
              </div>
            </div>

            {/* H1 — 2 lines max, ultra-wide container */}
            <h1
              className="hero-anim w-full max-w-5xl font-black tracking-tighter leading-[0.87] mb-7 text-[clamp(3.8rem,7vw,7.5rem)]"
            >
              Study smarter.<br />
              Speak sharper.
            </h1>

            <p className="hero-anim text-white/38 text-[1.1rem] md:text-xl max-w-[440px] leading-relaxed mb-12 font-light">
              From blank topic to confident voice — AI study plans, interactive audio lessons, and voice mock interviews in one platform.
            </p>

            <div className="hero-anim flex flex-col sm:flex-row gap-4">
              <div ref={ctaBtnRef}>
                <Link
                  href={user ? "/dashboard" : "/signup"}
                  className="inline-flex items-center justify-center gap-2.5 bg-white text-black px-8 py-4 rounded-2xl font-bold text-[15px] hover:bg-white/92 transition-colors shadow-xl shadow-white/[7%] group active:scale-[0.97] cursor-pointer"
                >
                  Start Learning Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <a
                href="#how"
                className="inline-flex items-center justify-center gap-2 text-white/50 px-8 py-4 rounded-2xl font-semibold text-[15px] border border-white/[9%] hover:border-white/22 hover:text-white transition-all cursor-pointer"
              >
                See how it works
              </a>
            </div>
          </div>

          {/* Right: floating mock UI */}
          <div className="hero-anim relative flex justify-center lg:justify-end">
            <div ref={heroCardRef} className="relative w-full max-w-[370px]" style={{ willChange: "transform" }}>
              <div className="rounded-3xl border border-white/[9%] bg-white/[2%] backdrop-blur-2xl p-6 shadow-2xl ring-1 ring-white/[3.5%]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[10px] text-white/30 font-medium mb-0.5 uppercase tracking-wider">System Design</p>
                    <p className="text-sm font-bold text-white">Day 3 of 14</p>
                  </div>
                  <span className="bg-indigo-500/15 border border-indigo-500/25 text-indigo-300 text-[10px] font-semibold px-3 py-1 rounded-full">In Progress</span>
                </div>
                <div className="space-y-2 mb-5">
                  {[
                    { name: "CAP Theorem",        status: "done"     },
                    { name: "Consistent Hashing",  status: "active"   },
                    { name: "Load Balancing",       status: "upcoming" },
                  ].map(({ name, status }) => (
                    <div key={name} className={`flex items-center gap-3 px-4 py-3 rounded-xl ${status === "active" ? "bg-indigo-500/15 border border-indigo-500/25" : status === "done" ? "bg-white/[4%]" : "bg-white/[2%]"}`}>
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${status === "done" ? "bg-[#22D3EE]" : status === "active" ? "bg-indigo-400" : "bg-white/15"}`} />
                      <span className={`text-sm flex-1 ${status === "active" ? "text-white font-semibold" : status === "done" ? "text-white/60" : "text-white/25"}`}>{name}</span>
                      {status === "done"   && <span className="text-[10px] text-[#22D3EE] font-semibold">Done</span>}
                      {status === "active" && <span className="text-[10px] text-indigo-300 font-semibold">Now</span>}
                    </div>
                  ))}
                </div>
                <div className="bg-white/[4%] rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] text-white/30">Interview Readiness</span>
                    <span className="text-[10px] font-black text-[#22D3EE]">64%</span>
                  </div>
                  <div className="w-full bg-white/[8%] rounded-full h-1.5">
                    <div className="hero-progress-fill h-1.5 rounded-full bg-gradient-to-r from-indigo-500 to-[#22D3EE]" style={{ width: 0 }} />
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 bg-[#6366F1] text-white text-[10px] font-black px-3.5 py-2 rounded-2xl shadow-xl shadow-indigo-500/30 border border-indigo-400/20">Gemini AI</div>
              <div className="absolute -bottom-4 -left-4 bg-black/80 border border-[#22D3EE]/20 backdrop-blur-xl text-[#22D3EE]/80 text-[10px] font-medium px-3.5 py-2 rounded-2xl">ElevenLabs Voice</div>
            </div>
            <div className="absolute inset-0 bg-violet-600/[9%] rounded-full blur-[90px] -z-10 scale-90 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── MARQUEE ───────────────────────────────────────── */}
      <div className="relative z-10 overflow-hidden border-y border-white/[4%] py-5 bg-black/15">
        <div className="animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span key={i} className="inline-flex items-center gap-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/18 pr-5 flex-shrink-0">
              {item}<span className="text-white/10">·</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── BENTO GRID (INTEREST) ─────────────────────────── */}
      <section id="features" className="relative z-10 py-44 px-6 xl:px-20">
        <div ref={bentoRef} className="w-full max-w-6xl mx-auto">
          <div className="mb-16">
            <h2
              className="font-black tracking-tighter text-white leading-[0.88] max-w-xl"
              style={{ fontSize: "clamp(2.4rem, 4.2vw, 4rem)" }}
            >
              Four tools.<br />
              <span className="text-white/22">One complete system.</span>
            </h2>
          </div>

          {/* 3-col × 2-row dense grid → A(4) + B(1) + C(1) = 6/6 cells */}
          <div className="grid grid-cols-3 grid-flow-dense gap-4" style={{ gridTemplateRows: "repeat(2, 228px)" }}>

            {/* A: AI Study Plans — col×2 row×2 */}
            <div className="bento-card col-span-2 row-span-2 group relative rounded-3xl border border-white/[6%] overflow-hidden cursor-default">
              <img src="https://picsum.photos/seed/studyplan2025/800/500" alt=""
                   className="absolute inset-0 w-full h-full object-cover opacity-[16%] group-hover:opacity-[26%] group-hover:scale-105 transition-all duration-700"
                   style={{ filter: "grayscale(0.3) contrast(1.2) hue-rotate(225deg)" }} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/45 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center mb-4">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">AI Study Plans</h3>
                <p className="text-white/42 text-sm leading-relaxed max-w-sm">
                  Your topic. Your timeline. Gemini builds a hyper-personalized day-by-day curriculum from first principles — every morning your next module is ready.
                </p>
              </div>
            </div>

            {/* B: Deep Readings — col×1 row×1 */}
            <div className="bento-card col-span-1 row-span-1 group relative rounded-3xl border border-white/[6%] bg-gradient-to-br from-cyan-950/45 to-transparent overflow-hidden cursor-default p-6 flex flex-col justify-between hover:border-cyan-500/22 transition-colors duration-300">
              <BookOpen className="h-6 w-6 text-cyan-400" />
              <div>
                <h3 className="text-base font-bold text-white mb-1 tracking-tight">Deep Readings</h3>
                <p className="text-white/35 text-xs leading-relaxed">AI-generated articles, cached to your profile forever.</p>
              </div>
            </div>

            {/* C: Voice Interviews — col×1 row×1 */}
            <div className="bento-card col-span-1 row-span-1 group relative rounded-3xl border border-white/[6%] bg-gradient-to-br from-cyan-950/30 to-transparent overflow-hidden cursor-default p-6 flex flex-col justify-between hover:border-cyan-400/18 transition-colors duration-300">
              <Mic className="h-6 w-6 text-[#22D3EE]" />
              <div>
                <h3 className="text-base font-bold text-white mb-1 tracking-tight">Voice Interviews</h3>
                <p className="text-white/35 text-xs leading-relaxed">Speak your answers. Get scored instantly.</p>
              </div>
            </div>
          </div>

          {/* Article Refiner — full-width row */}
          <div className="bento-card group relative rounded-3xl border border-white/[6%] bg-gradient-to-r from-amber-950/30 to-transparent overflow-hidden cursor-default p-8 flex items-center gap-10 hover:border-amber-500/18 transition-colors duration-300 mt-4">
            <PenTool className="h-8 w-8 text-amber-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <h3 className="text-xl font-black text-white mb-1 tracking-tight">Article Refiner</h3>
              <p className="text-white/40 text-sm leading-relaxed">Paste rough study notes. Gemini rewrites them into polished blog posts and viral Twitter threads in one click.</p>
            </div>
            <span className="hidden lg:block font-black font-mono flex-shrink-0 select-none" style={{ fontSize: "4.5rem", color: "rgba(245,158,11,0.06)", lineHeight: 1 }}>.md</span>
          </div>
        </div>
      </section>

      {/* ── CARD STACKING — HOW IT WORKS (DESIRE) ─────────── */}
      <section id="how" ref={stackRef} className="relative z-10 py-44 px-6 xl:px-20">
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2
              className="font-black tracking-tighter text-white"
              style={{ fontSize: "clamp(2.4rem, 4.2vw, 4rem)" }}
            >
              How it works
            </h2>
            <p className="text-white/32 text-base mt-4 max-w-sm mx-auto font-light">Three steps. Blank slate to confident voice.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map(({ icon: Icon, color, heading, body }, i) => (
              <div
                key={heading}
                className="stack-card rounded-3xl border border-white/[6%] bg-white/[2%] p-9 backdrop-blur-sm hover:scale-[1.02] transition-transform duration-500 cursor-default"
                style={{ boxShadow: `0 8px 40px ${color}10` }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-7 border border-white/[6%]"
                     style={{ background: `${color}18` }}>
                  <Icon className="h-5 w-5" style={{ color }} />
                </div>
                <p className="font-black font-mono mb-3 select-none"
                   style={{ fontSize: "3.5rem", lineHeight: 1, color: "rgba(255,255,255,0.04)" }}>
                  0{i + 1}
                </p>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">{heading}</h3>
                <p className="text-white/40 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HORIZONTAL ACCORDION — EVERY TOOL EXPLORED ────── */}
      <section className="relative z-10 py-44 px-6 xl:px-20 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-16">
            <h2
              className="font-black tracking-tighter text-white"
              style={{ fontSize: "clamp(2.4rem, 4.2vw, 4rem)" }}
            >
              Every tool, explored.
            </h2>
          </div>
          <div className="flex gap-1.5 rounded-3xl overflow-hidden border border-white/[7%]" style={{ height: "460px" }}>
            {ACCORDION_FEATURES.map(({ icon: Icon, title, sub, desc, img, accent, grad }) => (
              <div
                key={title}
                className={`accord-slice relative group flex-1 hover:flex-[3.8] transition-all duration-700 ease-in-out overflow-hidden bg-gradient-to-b ${grad} to-transparent cursor-pointer`}
                style={{ minWidth: "52px" }}
              >
                <img src={img} alt=""
                     className="accord-img absolute inset-0 w-full h-full object-cover opacity-[13%] group-hover:opacity-[23%] scale-110 group-hover:scale-100 transition-all duration-700"
                     style={{ filter: "grayscale(0.4) contrast(1.18)" }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/22 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                  <span className="text-white/28 text-[11px] font-bold uppercase tracking-widest"
                        style={{ writingMode: "vertical-rl" }}>{title}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150 pointer-events-none">
                  <Icon className="h-7 w-7 mb-4" style={{ color: `${accent}cc` }} />
                  <h3 className="text-2xl font-black text-white mb-1.5 tracking-tight">{title}</h3>
                  <p className="text-white/50 text-sm mb-2 font-medium">{sub}</p>
                  <p className="text-white/28 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SCRUBBING TEXT REVEAL (DESIRE) ───────────────── */}
      <section className="relative z-10 py-44 px-6 xl:px-20">
        <div className="w-full max-w-4xl mx-auto">
          <p
            ref={scrubRef}
            className="font-black tracking-tighter leading-[1.1]"
            style={{ fontSize: "clamp(1.85rem, 3.8vw, 3.6rem)" }}
          >
            {philosophyWords.map((word, i) => (
              <span key={i} className="word inline-block mr-[0.26em] mb-1 opacity-[0.07]">{word}</span>
            ))}
          </p>
        </div>
      </section>

      {/* ── CTA (ACTION) ─────────────────────────────────── */}
      <section className="relative z-10 py-52 px-6 xl:px-20">
        <div className="w-full max-w-5xl mx-auto text-center">
          <h2
            className="font-black tracking-tighter text-white leading-[0.87] mb-10"
            style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
          >
            Ready to<br />
            <span className="text-white/18">build mastery?</span>
          </h2>
          <p className="text-white/30 text-lg max-w-md mx-auto mb-14 font-light leading-relaxed">
            Join learners compressing years of study into weeks of focused, AI-guided practice.
          </p>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-3 bg-white text-black px-12 py-5 rounded-2xl font-black text-lg hover:bg-white/92 transition-all shadow-2xl shadow-white/[7%] group cursor-pointer"
          >
            Start for Free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
        <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
          <div className="w-[800px] h-[320px] bg-indigo-700/[9%] rounded-full blur-[160px]" />
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[4%] py-12 px-6 xl:px-20">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <LogoMark size={24} />
            <span className="font-black text-sm text-white tracking-tight">PrepStudio</span>
          </div>
          <div className="flex items-center gap-8 text-xs text-white/18 font-medium">
            <a href="#features" className="hover:text-white/40 transition-colors cursor-pointer">Features</a>
            <a href="#how"      className="hover:text-white/40 transition-colors cursor-pointer">How It Works</a>
            <Link href="/signup" className="hover:text-white/40 transition-colors cursor-pointer">Get Started</Link>
          </div>
          <p className="text-xs text-white/12 font-medium">&copy; {new Date().getFullYear()} PrepStudio</p>
        </div>
      </footer>
    </main>
  );
}
