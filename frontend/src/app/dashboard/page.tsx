"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/auth/AuthGuard";
import { useAuthStore } from "../../store/authStore";
import { Wordmark } from "../../components/BrandLogo";
import { ThemePicker } from "../../components/ThemeToggle";
import api from "../../lib/api";
import { Plus, LogOut, ChevronRight, Mic } from "lucide-react";

/* ── Skeleton cell ──────────────────────────────────────── */
function SkeletonCell() {
  return (
    <div className="card px-6 py-7 h-56 flex flex-col justify-between">
      <div className="space-y-3">
        <div className="h-2.5 rounded bg-panel ind-pulse w-1/3" />
        <div className="h-6 rounded bg-panel ind-pulse w-3/4" />
      </div>
      <div className="space-y-3">
        <div className="h-3 rounded bg-panel ind-pulse w-full" />
        <div className="h-10 rounded bg-panel ind-pulse" />
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
      <div className="min-h-screen flex flex-col text-foreground">

        {/* ── Header ────────────────────────────────────── */}
        <header className="nav-glass px-5 md:px-8 h-14 flex items-center justify-between">
          <Wordmark size="md" />
          <div className="flex items-center gap-2.5">
            <span className="section-label hidden md:inline">
              op / {user?.displayName || user?.email?.split("@")[0] || "learner"}
            </span>
            <Link href="/new" className="btn !py-2 text-sm">
              <Plus className="h-3.5 w-3.5" /> New plan
            </Link>
            <ThemePicker />
            <button
              onClick={() => { logout(); router.replace("/"); }}
              className="btn-ghost !p-2.5"
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ── Page header ───────────────────────────────── */}
        <div className="border-b border-border">
          <div className="max-w-[1400px] w-full mx-auto px-5 md:px-8 py-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="section-label text-primary mb-3">Operator workspace</p>
              <h1 className="font-display font-extrabold tracking-tight text-[clamp(2.2rem,5vw,3.6rem)]">Study plans</h1>
            </div>
            <span className="section-label">
              {loading ? "Loading…" : `${plans.length} active unit${plans.length === 1 ? "" : "s"}`}
            </span>
          </div>
        </div>

        {/* ── Main ──────────────────────────────────────── */}
        <main className="flex-grow max-w-[1400px] w-full mx-auto w-full">

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-5 md:m-8">
              {[1, 2, 3].map((i) => <SkeletonCell key={i} />)}
            </div>
          ) : plans.length === 0 ? (

            /* Empty state */
            <div className="flex flex-col items-center justify-center py-28 px-6 text-center">
              <div className="badge mb-7">No units on record</div>
              <h2 className="font-display font-extrabold tracking-tight text-3xl mb-4 leading-tight">Create your<br />first plan</h2>
              <p className="text-muted text-sm mb-9 leading-relaxed max-w-sm">
                Declare what you want to master and your timeline. Gemini builds a
                complete day-by-day curriculum to specification.
              </p>
              <Link href="/new" className="btn px-8 py-3.5 text-sm">
                <Plus className="h-4 w-4" /> Forge first plan
              </Link>
            </div>

          ) : (
            /* Plans grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 m-5 md:m-8">
              {plans.map((plan, i) => {
                const { pct, isDone, total, done } = getPlanStats(plan);
                return (
                  <div key={plan.id} className="group card card-hover px-6 py-6 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between mb-5">
                        <span className="font-mono text-[11px] text-muted">
                          unit №{String(i + 1).padStart(2, "0")} / {plan.total_days}d
                        </span>
                        <span className={isDone ? "badge-primary" : "badge-secondary"}>
                          {isDone ? "Complete" : "Active"}
                        </span>
                      </div>

                      <h3 className="font-display font-bold text-xl leading-tight mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {plan.topic}
                      </h3>
                      <p className="font-mono text-[11px] text-muted">
                        {done} / {total} topics logged
                      </p>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between section-label">
                          <span>Progress</span>
                          <span className="text-primary">{pct}%</span>
                        </div>
                        <div className="h-2.5 rounded-full bg-panel overflow-hidden">
                          <div className={`h-full rounded-full transition-all duration-500 ${isDone ? "bg-secondary" : "bg-primary"}`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Link
                          href={`/plan/${plan.id}`}
                          className="btn flex-1 !py-2.5 text-sm"
                        >
                          {isDone ? "Review" : "Continue"}
                          <ChevronRight className="h-3.5 w-3.5" />
                        </Link>
                        <Link
                          href={`/plan/${plan.id}/interview`}
                          title="Voice Interview"
                          className="btn-ghost !p-2.5 w-11"
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
