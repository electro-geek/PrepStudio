"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/auth/AuthGuard";
import { useAuthStore } from "../../store/authStore";
import { Wordmark } from "../../components/BrandLogo";
import { ThemeToggle } from "../../components/ThemeToggle";
import api from "../../lib/api";
import { Plus, LogOut, ChevronRight, Mic } from "lucide-react";

/* ── Skeleton cell ──────────────────────────────────────── */
function SkeletonCell() {
  return (
    <div className="bg-paper px-6 py-7 h-56 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="h-2.5 bg-paper-dark ind-pulse w-1/3" />
        <div className="h-6 bg-paper-dark ind-pulse w-3/4" />
      </div>
      <div className="space-y-3">
        <div className="h-3 bg-paper-dark ind-pulse w-full" />
        <div className="h-10 bg-paper-dark ind-pulse" />
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
      <div className="min-h-screen bg-paper text-ink flex flex-col blueprint">

        {/* ── Header ────────────────────────────────────── */}
        <header className="relative z-30 border-b-2 border-ink bg-paper px-5 md:px-8 h-14 flex items-center justify-between sticky top-0">
          <Wordmark size="md" />
          <div className="flex items-center gap-3">
            <span className="mono-label-sm text-ink-500 hidden md:inline">
              OP / {user?.displayName || user?.email?.split("@")[0] || "LEARNER"}
            </span>
            <Link href="/new" className="btn-ind px-4 py-2 text-[11px] flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5" /> NEW PLAN
            </Link>
            <ThemeToggle />
            <button
              onClick={() => { logout(); router.replace("/"); }}
              className="btn-outline p-2.5 flex items-center justify-center"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ── Page header ───────────────────────────────── */}
        <div className="border-b-2 border-ink bg-paper-alt">
          <div className="max-w-[1400px] w-full mx-auto px-5 md:px-8 py-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="mono-label text-hazard mb-3">[ OPERATOR WORKSPACE ]</p>
              <h1 className="macro text-[clamp(2.4rem,5vw,4rem)]">STUDY PLANS</h1>
            </div>
            <span className="mono-label-sm text-ink-500">
              {loading ? "LOADING…" : `${plans.length} ACTIVE UNIT${plans.length === 1 ? "" : "S"}`}
            </span>
          </div>
        </div>

        {/* ── Main ──────────────────────────────────────── */}
        <main className="relative z-10 flex-grow max-w-[1400px] w-full mx-auto">

          {loading ? (
            <div className="hairline-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 m-5 md:m-8">
              {[1, 2, 3].map(i => <SkeletonCell key={i} />)}
            </div>
          ) : plans.length === 0 ? (

            /* Empty state */
            <div className="flex flex-col items-center justify-center py-28 px-6 text-center">
              <div className="panel px-8 py-7 mb-8 hazard-stripes-red">
                <div className="bg-paper px-6 py-4 border-2 border-ink">
                  <p className="mono-label text-ink">[ NO UNITS ON RECORD ]</p>
                </div>
              </div>
              <h2 className="macro text-3xl mb-4">CREATE YOUR<br />FIRST PLAN</h2>
              <p className="text-ink-700 text-sm mb-9 leading-relaxed max-w-sm">
                Declare what you want to master and your timeline. Gemini builds a
                complete day-by-day curriculum to specification.
              </p>
              <Link href="/new" className="btn-hazard px-8 py-4 text-xs flex items-center gap-2">
                <Plus className="h-4 w-4" /> FORGE FIRST PLAN
              </Link>
            </div>

          ) : (
            /* Plans grid */
            <div className="hairline-grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 m-5 md:m-8">
              {plans.map((plan, i) => {
                const { pct, isDone, total, done } = getPlanStats(plan);
                return (
                  <div key={plan.id} className="group bg-paper px-6 py-6 flex flex-col justify-between hover:bg-paper-alt transition-colors">
                    <div>
                      <div className="flex items-start justify-between mb-5">
                        <span className="mono-label-sm text-ink-500">
                          UNIT №{String(i + 1).padStart(2, "0")} / {plan.total_days}D
                        </span>
                        <span className={`mono-label-sm px-2 py-1 ${isDone ? "bg-ink text-paper" : "bg-hazard text-paper"}`}>
                          {isDone ? "COMPLETE" : "ACTIVE"}
                        </span>
                      </div>

                      <h3 className="macro text-xl leading-tight mb-2 group-hover:text-hazard transition-colors line-clamp-2">
                        {plan.topic}
                      </h3>
                      <p className="mono-label-sm text-ink-400">
                        {done} / {total} TOPICS LOGGED
                      </p>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between mono-label-sm text-ink-500">
                          <span>PROGRESS</span>
                          <span className="text-ink">{pct}%</span>
                        </div>
                        <div className="h-3 border border-ink halftone">
                          <div className={`h-full transition-all duration-500 ${isDone ? "bg-ink" : "bg-hazard"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="flex gap-px bg-ink border border-ink">
                        <Link
                          href={`/plan/${plan.id}`}
                          className="flex-1 flex items-center justify-center gap-2 py-3 bg-paper hover:bg-ink hover:text-paper mono-label text-ink transition-colors"
                        >
                          {isDone ? "REVIEW" : "CONTINUE"}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/plan/${plan.id}/interview`}
                          title="Voice Interview"
                          className="w-12 flex items-center justify-center bg-paper hover:bg-hazard hover:text-paper text-ink transition-colors"
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
