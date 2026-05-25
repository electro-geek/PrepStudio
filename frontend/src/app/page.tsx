"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { useAuthStore } from "../store/authStore";
import { ArrowRight, BookOpen, Calendar, Mic, PenTool, Zap, Shield, TrendingUp } from "lucide-react";

/* ── Data ──────────────────────────────────────────────────── */

const MARQUEE_ITEMS = [
  "AI Study Plans",
  "Vocal Interviews",
  "Deep Readings",
  "Article Refiner",
  "Gemini 2.5 Flash",
  "Personalized Learning",
  "Instant Feedback",
  "Day-by-Day Curriculum",
];

const ACCORDION_FEATURES = [
  {
    icon: Calendar,
    title: "AI Study Plans",
    subtitle: "Your curriculum, built in seconds",
    desc: "Tell us your topic and timeline. Gemini builds a hyper-personalized day-by-day plan from first principles. Every morning, your next module is ready.",
    img: "https://picsum.photos/seed/curriculum/800/600",
    accent: "#7c3aed",
    gradFrom: "from-violet-950/70",
  },
  {
    icon: BookOpen,
    title: "Deep Readings",
    subtitle: "AI-generated articles, cached forever",
    desc: "Premium AI-generated technical articles per topic, permanently cached to your profile. Deep-dive into concepts with structured, referenced content.",
    img: "https://picsum.photos/seed/books/800/600",
    accent: "#2563eb",
    gradFrom: "from-blue-950/70",
  },
  {
    icon: Mic,
    title: "Vocal Interviews",
    subtitle: "Speak. Get scored. Level up.",
    desc: "Eight AI-generated interview questions per topic. Speak your answers aloud. Receive detailed performance feedback and a scored report instantly.",
    img: "https://picsum.photos/seed/speak/800/600",
    accent: "#0d9488",
    gradFrom: "from-teal-950/70",
  },
  {
    icon: PenTool,
    title: "Article Refiner",
    subtitle: "Notes become polished content",
    desc: "Paste rough study notes. Gemini rewrites them into polished blog posts and viral Twitter threads — your learning becomes your portfolio.",
    img: "https://picsum.photos/seed/write/800/600",
    accent: "#059669",
    gradFrom: "from-emerald-950/70",
  },
];

const STACK_CARDS = [
  {
    icon: Zap,
    step: "01",
    heading: "Curriculum in seconds",
    body: "Describe your topic and deadline. The AI plans your entire journey from first principles to mastery — day by day.",
    border: "border-violet-500/20",
    bg: "bg-[#0d0818]",
    glow: "shadow-violet-500/10",
    iconColor: "text-violet-400",
  },
  {
    icon: Shield,
    step: "02",
    heading: "Learn, then prove it",
    body: "Work through tailored AI readings each day. Then face the voice AI interviewer to test real retention and get scored.",
    border: "border-blue-500/20",
    bg: "bg-[#080d18]",
    glow: "shadow-blue-500/10",
    iconColor: "text-blue-400",
  },
  {
    icon: TrendingUp,
    step: "03",
    heading: "Publish what you built",
    body: "Convert your study notes into polished articles and threads. Your learning becomes a portfolio others can discover.",
    border: "border-teal-500/20",
    bg: "bg-[#06100e]",
    glow: "shadow-teal-500/10",
    iconColor: "text-teal-400",
  },
];

const PHILOSOPHY =
  "Every expert was once a beginner. PrepStudio compresses years of learning into focused, AI-guided sessions built precisely for you.";

/* ── Component ─────────────────────────────────────────────── */

export default function LandingPage() {
  const { user, loading } = useAuthStore();

  const scrubRef    = useRef<HTMLParagraphElement>(null);
  const stackRef    = useRef<HTMLDivElement>(null);
  const bentoRef    = useRef<HTMLDivElement>(null);
  const heroCardRef = useRef<HTMLDivElement>(null);
  const ctaBtnRef   = useRef<HTMLDivElement>(null);
  const spotRef     = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let ctx: { revert: () => void } | null = null;
    let cancelled = false;
    const cleanupFns: Array<() => void> = [];

    const init = async () => {
      const { gsap }          = await import("gsap");
      const { ScrollTrigger } = await import("gsap/ScrollTrigger");
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      ctx = gsap.context(() => {
        /* Hero stagger entrance */
        gsap.from(".hero-anim", {
          y: reduced ? 0 : 52,
          opacity: 0,
          duration: reduced ? 0.01 : 1.1,
          stagger: reduced ? 0 : 0.13,
          ease: "power4.out",
          clearProps: "all",
        });

        /* Progress bar entrance — animates from 0 to 64% */
        gsap.fromTo(".hero-progress-fill",
          { width: "0%" },
          {
            width: "64%",
            duration: reduced ? 0.01 : 1.4,
            ease: "power2.out",
            delay: reduced ? 0 : 0.95,
          }
        );

        /* Bento cards entrance */
        gsap.from(".bento-card", {
          y: reduced ? 0 : 64,
          opacity: 0,
          duration: reduced ? 0.01 : 0.85,
          stagger: reduced ? 0 : 0.09,
          ease: "power3.out",
          clearProps: "all",
          scrollTrigger: {
            trigger: bentoRef.current,
            start: "top 80%",
          },
        });

        /* Card stacking entrance */
        const stackCards = gsap.utils.toArray<HTMLElement>(".stack-card");
        stackCards.forEach((card, i) => {
          gsap.from(card, {
            y: reduced ? 0 : 100 + i * 30,
            opacity: 0,
            scale: reduced ? 1 : 0.91,
            duration: reduced ? 0.01 : 0.9,
            delay: reduced ? 0 : i * 0.13,
            ease: "power3.out",
            clearProps: "all",
            scrollTrigger: {
              trigger: stackRef.current,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          });
        });

        /* Scrubbing word reveal */
        if (scrubRef.current) {
          const words = scrubRef.current.querySelectorAll<HTMLElement>(".word");
          if (reduced) {
            gsap.set(words, { opacity: 1 });
          } else {
            gsap.fromTo(words, { opacity: 0.07 }, {
              opacity: 1,
              stagger: 0.045,
              ease: "none",
              scrollTrigger: {
                trigger: scrubRef.current,
                start: "top 65%",
                end: "bottom 30%",
                scrub: 1.8,
              },
            });
          }
        }

        /* Accordion image scale-in */
        gsap.utils.toArray<HTMLElement>(".accord-img").forEach((img) => {
          gsap.from(img, {
            scale: reduced ? 1 : 1.12,
            duration: reduced ? 0.01 : 1.2,
            ease: "power2.out",
            clearProps: "all",
            scrollTrigger: {
              trigger: img.closest(".accord-slice"),
              start: "top 85%",
            },
          });
        });
      });

      if (reduced) return;

      /* ── Cursor spotlight ──────────────────────────────────── */
      if (spotRef.current) {
        const spot = spotRef.current;
        const hero = document.querySelector<HTMLElement>(".hero-section");
        if (hero) {
          const xSet = gsap.quickSetter(spot, "x", "px");
          const ySet = gsap.quickSetter(spot, "y", "px");
          const onMove = (e: MouseEvent) => {
            const r = hero.getBoundingClientRect();
            xSet(e.clientX - r.left);
            ySet(e.clientY - r.top);
            gsap.to(spot, { opacity: 1, duration: 0.4, overwrite: true });
          };
          const onLeave = () =>
            gsap.to(spot, { opacity: 0, duration: 0.7, overwrite: true });
          hero.addEventListener("mousemove", onMove);
          hero.addEventListener("mouseleave", onLeave);
          cleanupFns.push(() => {
            hero.removeEventListener("mousemove", onMove);
            hero.removeEventListener("mouseleave", onLeave);
          });
        }
      }

      /* ── Hero card 3D tilt ─────────────────────────────────── */
      if (heroCardRef.current) {
        const card = heroCardRef.current;
        const onMove = (e: MouseEvent) => {
          const r = card.getBoundingClientRect();
          const rx = ((e.clientY - r.top  - r.height / 2) / (r.height / 2)) * -7;
          const ry = ((e.clientX - r.left - r.width  / 2) / (r.width  / 2)) *  7;
          card.style.transition = "transform 0.1s ease-out";
          card.style.transform  = `perspective(900px) rotateX(${rx}deg) rotateY(${ry}deg) scale3d(1.025,1.025,1.025)`;
        };
        const onLeave = () => {
          card.style.transition = "transform 0.6s cubic-bezier(0.23, 1, 0.32, 1)";
          card.style.transform  = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)";
        };
        card.addEventListener("mousemove", onMove);
        card.addEventListener("mouseleave", onLeave);
        cleanupFns.push(() => {
          card.removeEventListener("mousemove", onMove);
          card.removeEventListener("mouseleave", onLeave);
        });
      }

      /* ── Magnetic CTA button ───────────────────────────────── */
      if (ctaBtnRef.current) {
        const wrapper = ctaBtnRef.current;
        const inner   = wrapper.querySelector<HTMLElement>("a");
        if (inner) {
          const onMove = (e: MouseEvent) => {
            const r  = wrapper.getBoundingClientRect();
            const dx = (e.clientX - r.left - r.width  / 2) * 0.3;
            const dy = (e.clientY - r.top  - r.height / 2) * 0.3;
            gsap.to(inner, { x: dx, y: dy, duration: 0.4, ease: "power2.out" });
          };
          const onLeave = () =>
            gsap.to(inner, { x: 0, y: 0, duration: 0.7, ease: "elastic.out(1, 0.45)" });
          wrapper.addEventListener("mousemove", onMove);
          wrapper.addEventListener("mouseleave", onLeave);
          cleanupFns.push(() => {
            wrapper.removeEventListener("mousemove", onMove);
            wrapper.removeEventListener("mouseleave", onLeave);
          });
        }
      }
    };

    init();
    return () => {
      cancelled = true;
      ctx?.revert();
      cleanupFns.forEach((fn) => fn());
    };
  }, []);

  const philosophyWords = PHILOSOPHY.split(" ");

  return (
    <main
      className="overflow-x-hidden w-full max-w-full bg-[#050810] text-white"
      style={{ fontFamily: "'Outfit', 'Plus Jakarta Sans', sans-serif" }}
    >
      {/* Ambient background orbs */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-64 left-[20%] w-[900px] h-[900px] rounded-full bg-indigo-700/[7%] blur-[160px]" />
        <div className="absolute top-[40%] -right-64 w-[700px] h-[700px] rounded-full bg-violet-700/[5%] blur-[140px]" />
        <div className="absolute bottom-0 left-[30%] w-[600px] h-[600px] rounded-full bg-blue-700/[4%] blur-[130px]" />
      </div>

      {/* ── Navigation (floating glass pill) ─────────────────── */}
      <header className="fixed top-5 left-1/2 -translate-x-1/2 z-50 w-[92vw] max-w-[720px]">
        <nav className="flex items-center justify-between px-5 py-3 rounded-2xl border border-white/[8%] bg-black/50 backdrop-blur-2xl shadow-2xl shadow-black/50">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 shadow-lg shadow-indigo-500/30 flex-shrink-0" />
            <span className="font-black text-[15px] tracking-tight">PrepStudio</span>
          </div>

          <div className="hidden md:flex items-center gap-7 text-sm text-white/45 font-medium">
            <a href="#features"  className="hover:text-white transition-colors duration-200">Features</a>
            <a href="#how"       className="hover:text-white transition-colors duration-200">How It Works</a>
          </div>

          <div className="flex items-center gap-2">
            {loading ? (
              <div className="h-4 w-4 border-2 border-indigo-400 border-t-transparent animate-spin rounded-full" />
            ) : user ? (
              <Link
                href="/dashboard"
                className="bg-white text-black px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white/45 hover:text-white text-sm font-medium px-3 py-1.5 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-white text-black px-4 py-1.5 rounded-xl text-sm font-bold hover:bg-white/90 transition-colors"
                >
                  Start free
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="hero-section relative z-10 min-h-screen flex items-center pt-36 pb-28 px-6 xl:px-20">
        {/* Cursor spotlight — follows mouse, fades out on leave */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            ref={spotRef}
            className="absolute w-[560px] h-[560px] rounded-full -translate-x-1/2 -translate-y-1/2 opacity-0"
            style={{ background: "radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)" }}
          />
        </div>

        <div className="w-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[56%_44%] gap-16 lg:gap-8 items-center">

          {/* Left: text */}
          <div>
            <h1 className="hero-anim text-white leading-[0.87] tracking-tighter font-black mb-8 max-w-2xl"
                style={{ fontSize: "clamp(3.2rem, 6.5vw, 6.2rem)" }}>
              Master any skill<br />
              with{" "}
              <span
                className="inline-block overflow-hidden"
                style={{
                  width: "clamp(72px, 5.5vw, 108px)",
                  height: "clamp(28px, 2.15vw, 42px)",
                  borderRadius: "9px",
                  verticalAlign: "0.04em",
                  display: "inline-block",
                }}
              >
                <img
                  src="https://picsum.photos/seed/smartlearn/240/80"
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: "saturate(0.55) contrast(1.35) brightness(0.82)" }}
                />
              </span>{" "}
              AI.
            </h1>

            <p className="hero-anim text-white/40 text-[1.1rem] md:text-xl max-w-[420px] leading-relaxed mb-10 font-light">
              From a blank topic to published expertise — PrepStudio builds your curriculum, teaches you daily, runs AI mock interviews, and refines your notes.
            </p>

            <div className="hero-anim flex flex-col sm:flex-row gap-4">
              <div ref={ctaBtnRef} className="inline-block">
                <Link
                  href={user ? "/dashboard" : "/signup"}
                  className="inline-flex items-center justify-center gap-2.5 bg-white text-black px-7 py-4 rounded-2xl font-bold text-[15px] hover:bg-white/92 transition-colors shadow-xl shadow-white/[8%] group active:scale-[0.97]"
                >
                  Start Learning Free
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
              <a
                href="#features"
                className="inline-flex items-center justify-center gap-2 text-white/55 px-7 py-4 rounded-2xl font-semibold text-[15px] border border-white/[10%] hover:border-white/25 hover:text-white transition-all"
              >
                See Features
              </a>
            </div>
          </div>

          {/* Right: floating mock UI */}
          <div className="hero-anim relative flex justify-center lg:justify-end">
            <div ref={heroCardRef} className="relative w-full max-w-[370px]" style={{ willChange: "transform" }}>
              <div className="rounded-3xl border border-white/[10%] bg-white/[2%] backdrop-blur-2xl p-6 shadow-2xl ring-1 ring-white/[4%]">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <p className="text-[11px] text-white/35 font-medium mb-0.5 uppercase tracking-wider">System Design</p>
                    <p className="text-sm font-bold text-white">Day 3 of 14</p>
                  </div>
                  <span className="bg-violet-500/15 border border-violet-500/25 text-violet-300 text-[11px] font-semibold px-3 py-1 rounded-full">
                    In Progress
                  </span>
                </div>

                <div className="space-y-2 mb-5">
                  {[
                    { name: "CAP Theorem",         status: "done" },
                    { name: "Consistent Hashing",  status: "active" },
                    { name: "Load Balancing",       status: "upcoming" },
                  ].map(({ name, status }) => (
                    <div
                      key={name}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl ${
                        status === "active"
                          ? "bg-violet-500/15 border border-violet-500/25"
                          : status === "done"
                          ? "bg-white/[4%]"
                          : "bg-white/[2%]"
                      }`}
                    >
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        status === "done" ? "bg-emerald-400" : status === "active" ? "bg-violet-400" : "bg-white/15"
                      }`} />
                      <span className={`text-sm flex-1 ${
                        status === "active" ? "text-white font-semibold" : status === "done" ? "text-white/65" : "text-white/30"
                      }`}>{name}</span>
                      {status === "done"   && <span className="text-[11px] text-emerald-400 font-semibold">Done</span>}
                      {status === "active" && <span className="text-[11px] text-violet-300 font-semibold">Now</span>}
                    </div>
                  ))}
                </div>

                <div className="bg-white/[4%] rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] text-white/35">Interview Readiness</span>
                    <span className="text-[11px] font-black text-violet-300">64%</span>
                  </div>
                  <div className="w-full bg-white/[8%] rounded-full h-1.5">
                    <div className="hero-progress-fill h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500" style={{ width: 0 }} />
                  </div>
                </div>
              </div>

              <div className="absolute -top-5 -right-4 bg-gradient-to-br from-indigo-600 to-violet-700 text-white text-[11px] font-black px-3.5 py-2 rounded-2xl shadow-xl shadow-indigo-500/25 border border-indigo-400/20">
                Gemini AI
              </div>
              <div className="absolute -bottom-4 -left-4 bg-black/75 border border-white/[10%] backdrop-blur-xl text-white/70 text-[11px] font-medium px-3.5 py-2 rounded-2xl">
                2.5 Flash
              </div>
            </div>

            <div className="absolute inset-0 bg-violet-600/[10%] rounded-full blur-[90px] -z-10 scale-90 pointer-events-none" />
          </div>
        </div>
      </section>

      {/* ── Infinite Marquee ─────────────────────────────────── */}
      <div className="relative z-10 overflow-hidden border-y border-white/[5%] py-5">
        <div className="animate-marquee">
          {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-5 text-[11px] font-bold uppercase tracking-[0.22em] text-white/20 pr-5 flex-shrink-0"
            >
              {item}
              <span className="text-white/10">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Bento Grid (Interest) ─────────────────────────────── */}
      <section id="features" className="relative z-10 py-40 px-6 xl:px-20">
        <div ref={bentoRef} className="w-full max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-[2.6rem] md:text-5xl font-black tracking-tighter text-white leading-[0.9] max-w-lg">
              Four tools.<br />
              <span className="text-white/25">One complete system.</span>
            </h2>
          </div>

          {/* 3 cols × 3 rows = 9 cells, zero gaps */}
          <div
            className="grid grid-cols-3 grid-flow-dense gap-4"
            style={{ gridTemplateRows: "repeat(3, 220px)" }}
          >
            {/* Card 1 – Study Plans: col-span-2 row-span-2 = 4 cells */}
            <div className="bento-card col-span-2 row-span-2 group relative rounded-3xl border border-white/[7%] overflow-hidden cursor-default">
              <img
                src="https://picsum.photos/seed/curriculum/800/500"
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-[18%] group-hover:opacity-[28%] group-hover:scale-105 transition-all duration-700"
                style={{ filter: "grayscale(0.35) contrast(1.15)" }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent" />
              <div className="relative z-10 h-full flex flex-col justify-end p-8">
                <Calendar className="h-8 w-8 text-violet-400 mb-4" />
                <h3 className="text-2xl font-black text-white mb-2 tracking-tight">AI Study Plans</h3>
                <p className="text-white/50 text-sm leading-relaxed max-w-sm">
                  Tell us your topic and timeline. Gemini builds a hyper-personalized day-by-day curriculum. Every morning, your next module is ready.
                </p>
              </div>
            </div>

            {/* Card 2 – Deep Readings: col-span-1 row-span-1 = 1 cell */}
            <div className="bento-card col-span-1 row-span-1 group relative rounded-3xl border border-white/[7%] bg-gradient-to-br from-blue-950/60 to-transparent overflow-hidden cursor-default p-6 flex flex-col justify-between hover:border-blue-500/25 transition-colors duration-300">
              <BookOpen className="h-6 w-6 text-blue-400" />
              <div>
                <h3 className="text-base font-bold text-white mb-1 tracking-tight">Deep Readings</h3>
                <p className="text-white/40 text-xs leading-relaxed">AI-generated articles, cached to your profile forever.</p>
              </div>
            </div>

            {/* Card 3 – Vocal Interviews: col-span-1 row-span-1 = 1 cell */}
            <div className="bento-card col-span-1 row-span-1 group relative rounded-3xl border border-white/[7%] bg-gradient-to-br from-teal-950/60 to-transparent overflow-hidden cursor-default p-6 flex flex-col justify-between hover:border-teal-500/25 transition-colors duration-300">
              <Mic className="h-6 w-6 text-teal-400" />
              <div>
                <h3 className="text-base font-bold text-white mb-1 tracking-tight">Vocal Interviews</h3>
                <p className="text-white/40 text-xs leading-relaxed">Speak your answers. Get scored instantly.</p>
              </div>
            </div>

            {/* Card 4 – Article Refiner: col-span-3 row-span-1 = 3 cells */}
            <div className="bento-card col-span-3 row-span-1 group relative rounded-3xl border border-white/[7%] bg-gradient-to-br from-emerald-950/40 to-transparent overflow-hidden cursor-default p-8 flex items-center gap-10 hover:border-emerald-500/20 transition-colors duration-300">
              <PenTool className="h-8 w-8 text-emerald-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-black text-white mb-1 tracking-tight">Article Refiner</h3>
                <p className="text-white/45 text-sm leading-relaxed">
                  Paste rough study notes. Gemini rewrites them into polished blog posts and viral Twitter threads in one click.
                </p>
              </div>
              <span
                className="hidden lg:block font-black font-mono flex-shrink-0 select-none"
                style={{ fontSize: "4.5rem", color: "rgba(16,185,129,0.06)", lineHeight: 1 }}
              >
                .md
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Scrubbing Text Reveal (Desire) ───────────────────── */}
      <section className="relative z-10 py-40 px-6 xl:px-20">
        <div className="w-full max-w-4xl mx-auto">
          <p
            ref={scrubRef}
            className="font-black tracking-tighter leading-[1.1]"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3.8rem)" }}
          >
            {philosophyWords.map((word, i) => (
              <span key={i} className="word inline-block mr-[0.28em] mb-1 opacity-[0.07]">
                {word}
              </span>
            ))}
          </p>
        </div>
      </section>

      {/* ── Card Stacking Section (How It Works) ─────────────── */}
      <section ref={stackRef} id="how" className="relative z-10 py-40 px-6 xl:px-20">
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-16 text-center">
            <h2 className="text-[2.6rem] md:text-5xl font-black tracking-tighter text-white">
              How it works
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STACK_CARDS.map(({ icon: Icon, step, heading, body, border, bg, glow, iconColor }) => (
              <div
                key={heading}
                className={`stack-card rounded-3xl border ${border} ${bg} p-9 backdrop-blur-sm shadow-2xl ${glow} hover:scale-[1.02] transition-transform duration-500 cursor-default`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/[6%] flex items-center justify-center mb-7">
                  <Icon className={`h-5 w-5 ${iconColor}`} />
                </div>
                <p
                  className="font-black font-mono mb-3 select-none"
                  style={{ fontSize: "3.5rem", lineHeight: 1, color: "rgba(255,255,255,0.04)" }}
                >
                  {step}
                </p>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">{heading}</h3>
                <p className="text-white/45 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Horizontal Accordion (Feature Deep-Dive) ─────────── */}
      <section className="relative z-10 py-40 px-6 xl:px-20 overflow-hidden">
        <div className="w-full max-w-6xl mx-auto">
          <div className="mb-16">
            <h2 className="text-[2.6rem] md:text-5xl font-black tracking-tighter text-white">
              Every tool, explored.
            </h2>
          </div>

          <div className="flex gap-1.5 rounded-3xl overflow-hidden border border-white/[8%]" style={{ height: "460px" }}>
            {ACCORDION_FEATURES.map(({ icon: Icon, title, subtitle, desc, img, accent, gradFrom }) => (
              <div
                key={title}
                className={`accord-slice relative group flex-1 hover:flex-[3.8] transition-all duration-700 ease-in-out overflow-hidden bg-gradient-to-b ${gradFrom} to-transparent cursor-pointer`}
                style={{ minWidth: "52px" }}
              >
                <img
                  src={img}
                  alt=""
                  className="accord-img absolute inset-0 w-full h-full object-cover opacity-[14%] group-hover:opacity-[24%] scale-110 group-hover:scale-100 transition-all duration-700"
                  style={{ filter: "grayscale(0.45) contrast(1.15)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/25 to-transparent" />

                {/* Collapsed: vertical label */}
                <div className="absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity duration-300 pointer-events-none">
                  <span
                    className="text-white/30 text-[11px] font-bold uppercase tracking-widest"
                    style={{ writingMode: "vertical-rl", textOrientation: "mixed" }}
                  >
                    {title}
                  </span>
                </div>

                {/* Expanded: full content */}
                <div className="absolute bottom-0 left-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-150 pointer-events-none">
                  <Icon className="h-7 w-7 mb-4" style={{ color: `${accent}cc` }} />
                  <h3 className="text-2xl font-black text-white mb-2 tracking-tight">{title}</h3>
                  <p className="text-white/55 text-sm mb-2 font-medium">{subtitle}</p>
                  <p className="text-white/30 text-xs leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section (Action) ──────────────────────────────── */}
      <section className="relative z-10 py-52 px-6 xl:px-20">
        <div className="w-full max-w-5xl mx-auto text-center">
          <h2
            className="font-black tracking-tighter text-white leading-[0.88] mb-10"
            style={{ fontSize: "clamp(3rem, 8vw, 7.5rem)" }}
          >
            Ready to
            <br />
            <span className="text-white/20">build mastery?</span>
          </h2>
          <p className="text-white/35 text-lg max-w-md mx-auto mb-14 font-light leading-relaxed">
            Join learners already compressing years of study into weeks of focused, AI-guided practice.
          </p>
          <Link
            href={user ? "/dashboard" : "/signup"}
            className="inline-flex items-center gap-3 bg-white text-black px-11 py-5 rounded-2xl font-black text-lg hover:bg-white/92 transition-all shadow-2xl shadow-white/[8%] group"
          >
            Start for Free
            <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>

        <div className="absolute inset-0 flex items-center justify-center -z-10 pointer-events-none">
          <div className="w-[700px] h-[300px] bg-indigo-700/[10%] rounded-full blur-[140px]" />
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="relative z-10 border-t border-white/[5%] py-12 px-6 xl:px-20">
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 flex-shrink-0" />
            <span className="font-black text-sm text-white tracking-tight">PrepStudio</span>
          </div>

          <div className="flex items-center gap-8 text-xs text-white/20 font-medium">
            <a href="#features" className="hover:text-white/45 transition-colors">Features</a>
            <a href="#how"      className="hover:text-white/45 transition-colors">How It Works</a>
            <Link href="/signup" className="hover:text-white/45 transition-colors">Get Started</Link>
          </div>

          <p className="text-xs text-white/15 font-medium">
            &copy; {new Date().getFullYear()} PrepStudio
          </p>
        </div>
      </footer>
    </main>
  );
}
