"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/auth/AuthGuard";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
import {
  Plus, LogOut, BookOpen, Calendar,
  CheckCircle2, ChevronRight, Sparkles, TrendingUp, Mic,
} from "lucide-react";

/* ── Logo Mark ──────────────────────────────────────────── */
function LogoMark({ size = 26 }: { size?: number }) {
  const uid = React.useId().replace(/:/g, "");
  const gid = `dlg-${uid}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#4f46e5" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" rx="22" fill={`url(#${gid})`} />
      <rect x="0.5" y="0.5" width="99" height="99" rx="21.5" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path fillRule="evenodd" fill="white"
        d="M14 14 L14 86 L26 86 L26 50 Q66 50 66 32 Q66 14 26 14Z M26 22 Q58 22 58 32 Q58 42 26 42Z" />
      <rect x="72" y="26" width="6" height="12" rx="3" fill="white" fillOpacity="0.45" />
      <rect x="80" y="22" width="6" height="20" rx="3" fill="white" fillOpacity="0.70" />
      <rect x="88" y="18" width="6" height="28" rx="3" fill="white" fillOpacity="1" />
    </svg>
  );
}

/* ── Skeleton card ──────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/[5%] bg-white/[2%] p-6 h-60 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="h-2.5 shimmer rounded-full w-1/4" />
        <div className="h-6 shimmer rounded-lg w-3/4" />
        <div className="h-2.5 shimmer rounded-full w-1/2" />
      </div>
      <div className="space-y-3">
        <div className="h-2 shimmer rounded-full w-full" />
        <div className="h-10 shimmer rounded-xl" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, logout } = useAuthStore();
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await api.get("/plans");
        setPlans(res.data);
      } catch (e) {
        console.error("Failed to load study plans:", e);
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchPlans();
  }, [user]);

  const getPlanStats = (plan: any) => {
    let total = 0, done = 0;
    plan.days?.forEach((d: any) => d.topics?.forEach((t: any) => { total++; if (t.is_complete) done++; }));
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    return { pct, isDone: pct === 100 && total > 0, total, done };
  };

  return (
    <AuthGuard>
      <div
        className="min-h-screen text-slate-100 flex flex-col"
        style={{ background: "#050810", fontFamily: "'Outfit','Inter',sans-serif" }}
      >
        {/* Ambient orbs */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
          <div className="absolute -top-56 -left-56 w-[700px] h-[700px] bg-indigo-600/[6%] rounded-full blur-[140px]" />
          <div className="absolute -bottom-56 -right-56 w-[600px] h-[600px] bg-violet-600/[5%] rounded-full blur-[130px]" />
          {/* Grid pattern */}
          <div className="absolute inset-0 grid-bg opacity-100" />
        </div>

        {/* ── Header ────────────────────────────────────── */}
        <header className="relative z-30 border-b border-white/[5%] bg-black/40 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-2.5">
            <LogoMark size={26} />
            <span className="font-black text-[15px] text-white tracking-tight">PrepStudio</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-white/35 text-sm hidden md:inline font-medium">
              {user?.displayName || user?.email?.split("@")[0] || "Learner"}
            </span>
            <Link
              href="/new"
              className="btn-glow px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>New Plan</span>
            </Link>
            <button
              onClick={() => { logout(); router.replace("/"); }}
              className="border border-white/[8%] hover:bg-white/[5%] p-2 rounded-xl text-white/35 hover:text-white transition-colors cursor-pointer"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ── Main ──────────────────────────────────────── */}
        <main className="relative z-10 flex-grow max-w-6xl w-full mx-auto px-6 py-12">

          {/* Page header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-indigo-400/80 text-[10px] font-bold uppercase tracking-[0.22em] mb-2">Your Workspace</p>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Study Plans</h1>
              <p className="text-white/30 text-sm mt-1.5 font-light">Track progress and continue where you left off.</p>
            </div>
            {plans.length > 0 && (
              <Link
                href="/new"
                className="btn-glow px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center gap-2 self-start md:self-auto cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>New Plan</span>
              </Link>
            )}
          </div>

          {/* Loading */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
            </div>
          ) : plans.length === 0 ? (

            /* Empty state */
            <div className="flex flex-col items-center justify-center py-28 text-center max-w-sm mx-auto">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500/15 rounded-full blur-2xl scale-150" />
                <div className="relative bg-indigo-500/10 border border-indigo-500/20 p-7 rounded-3xl">
                  <BookOpen className="h-10 w-10 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-3 tracking-tight">Create your first plan</h2>
              <p className="text-white/32 text-sm mb-10 leading-relaxed font-light">
                Tell PrepStudio what you want to master and your timeline. Gemini builds a complete day-by-day curriculum just for you.
              </p>
              <Link
                href="/new"
                className="btn-glow px-8 py-3.5 rounded-2xl font-bold text-white flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="h-4 w-4" />
                <span>Forge My First Plan</span>
              </Link>
            </div>

          ) : (
            /* Plans grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const { pct, isDone, total, done } = getPlanStats(plan);
                return (
                  <div
                    key={plan.id}
                    className="group relative rounded-2xl border border-white/[5%] bg-white/[2%] p-6 flex flex-col justify-between hover:border-indigo-500/28 transition-all duration-300 overflow-hidden cursor-default"
                  >
                    {/* Top accent line */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px]"
                      style={{
                        background: isDone
                          ? "linear-gradient(90deg,#10b981,#34d399)"
                          : "linear-gradient(90deg,#6366f1,#7c3aed,#8b5cf6)",
                        opacity: 0.75,
                      }}
                    />

                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-white/25 text-[11px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                          <Calendar className="h-3 w-3" />
                          {plan.total_days}d Plan
                        </span>
                        {isDone ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" />Complete
                          </span>
                        ) : (
                          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />Active
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-lg text-white mb-1.5 leading-snug tracking-tight group-hover:text-indigo-300 transition-colors duration-200">
                        {plan.topic}
                      </h3>
                      <p className="text-[11px] text-white/22 font-medium">
                        {done} / {total} topics complete
                      </p>
                    </div>

                    <div className="mt-5 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-white/25">
                          <span>Progress</span>
                          <span className="text-white/50">{pct}%</span>
                        </div>
                        <div className="h-1.5 bg-white/[5%] rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${pct}%`,
                              background: isDone
                                ? "linear-gradient(90deg,#10b981,#34d399)"
                                : "linear-gradient(90deg,#6366f1,#7c3aed)",
                              boxShadow: `0 0 8px ${isDone ? "rgba(16,185,129,0.4)" : "rgba(99,102,241,0.4)"}`,
                            }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/plan/${plan.id}`}
                          className="flex-1 group/btn flex items-center justify-center gap-2 py-3 rounded-xl bg-white/[4%] border border-white/[7%] hover:bg-indigo-600/18 hover:border-indigo-500/35 text-white/50 hover:text-white text-sm font-semibold transition-all duration-200 cursor-pointer"
                        >
                          <span>{isDone ? "Review" : "Continue"}</span>
                          <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                        </Link>
                        <Link
                          href={`/plan/${plan.id}/interview`}
                          title="Voice Interview"
                          className="w-11 h-11 rounded-xl bg-white/[4%] border border-white/[7%] hover:bg-violet-600/18 hover:border-violet-500/35 text-white/35 hover:text-violet-300 transition-all duration-200 flex items-center justify-center flex-shrink-0 cursor-pointer"
                        >
                          <Mic className="h-4 w-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
