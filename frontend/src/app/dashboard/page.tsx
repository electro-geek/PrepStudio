"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../components/auth/AuthGuard";
import { useAuthStore } from "../../store/authStore";
import api from "../../lib/api";
import {
  Plus, LogOut, BookOpen, GraduationCap, Calendar,
  CheckCircle2, ChevronRight, Sparkles, TrendingUp
} from "lucide-react";

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
    let totalTopics = 0;
    let completedTopics = 0;
    plan.days?.forEach((day: any) => {
      day.topics?.forEach((topic: any) => {
        totalTopics++;
        if (topic.is_complete) completedTopics++;
      });
    });
    const percent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
    return { percent, isDone: percent === 100 && totalTopics > 0, totalTopics, completedTopics };
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#080c14] text-slate-100 flex flex-col grid-bg">
        {/* Ambient glow */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-60 -left-60 w-[600px] h-[600px] bg-indigo-600/8 rounded-full blur-[120px]" />
          <div className="absolute -bottom-60 -right-60 w-[600px] h-[600px] bg-blue-600/8 rounded-full blur-[120px]" />
        </div>

        {/* ── Header ───────────────────────────────────────── */}
        <header className="relative z-30 border-b border-white/5 bg-black/30 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between sticky top-0">
          <div className="flex items-center space-x-2.5">
            <div className="bg-gradient-to-tr from-indigo-500 to-blue-500 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <GraduationCap className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">PrepStudio</span>
          </div>

          <div className="flex items-center space-x-3">
            <span className="text-slate-500 text-sm hidden md:inline">
              <span className="text-slate-300 font-medium">{user?.displayName || user?.email?.split("@")[0] || "Learner"}</span>
            </span>
            <Link
              href="/new"
              className="btn-glow px-4 py-2 rounded-xl text-sm font-semibold text-white flex items-center space-x-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>New Plan</span>
            </Link>
            <button
              onClick={() => { logout(); router.replace("/"); }}
              className="border border-white/10 hover:bg-white/5 p-2 rounded-xl text-slate-500 hover:text-white transition"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        {/* ── Main ─────────────────────────────────────────── */}
        <main className="relative z-10 flex-grow max-w-6xl w-full mx-auto px-6 py-10">
          {/* Page title */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <p className="text-indigo-400 text-xs font-bold uppercase tracking-widest mb-1.5">Your Workspace</p>
              <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Study Plans</h1>
              <p className="text-slate-500 text-sm mt-1">Track your progress and continue where you left off.</p>
            </div>
            {plans.length > 0 && (
              <Link
                href="/new"
                className="btn-glow px-5 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center space-x-2 self-start md:self-auto"
              >
                <Sparkles className="h-4 w-4" />
                <span>Forge New Plan</span>
              </Link>
            )}
          </div>

          {/* Loading skeletons */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="glass rounded-2xl p-6 h-56 flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="h-3 shimmer rounded-full w-1/4" />
                    <div className="h-6 shimmer rounded-lg w-3/4" />
                    <div className="h-3 shimmer rounded-full w-1/2" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 shimmer rounded-full w-full" />
                    <div className="h-10 shimmer rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          ) : plans.length === 0 ? (
            /* Empty state */
            <div className="flex flex-col items-center justify-center py-24 text-center max-w-md mx-auto">
              <div className="relative mb-8">
                <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-2xl scale-150" />
                <div className="relative bg-indigo-500/10 border border-indigo-500/20 p-6 rounded-3xl">
                  <BookOpen className="h-10 w-10 text-indigo-400" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white mb-3">Create your first plan</h2>
              <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                Tell PrepStudio what you want to master and your timeline. 
                Gemini will build a complete day-by-day curriculum just for you.
              </p>
              <Link
                href="/new"
                className="btn-glow px-7 py-3.5 rounded-2xl font-bold text-white flex items-center space-x-2"
              >
                <Sparkles className="h-4 w-4" />
                <span>Forge My First Plan</span>
              </Link>
            </div>
          ) : (
            /* Plans grid */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {plans.map((plan) => {
                const { percent, isDone, totalTopics, completedTopics } = getPlanStats(plan);
                return (
                  <div
                    key={plan.id}
                    className="glass rounded-2xl p-6 flex flex-col justify-between border border-white/5 hover:border-indigo-500/30 transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Top accent bar */}
                    <div
                      className="absolute top-0 left-0 right-0 h-[2px] transition-opacity duration-300"
                      style={{
                        background: isDone
                          ? "linear-gradient(90deg, #10b981, #34d399)"
                          : "linear-gradient(90deg, #6366f1, #3b82f6, #06b6d4)",
                        opacity: 0.8,
                      }}
                    />

                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <span className="text-slate-500 text-[11px] font-bold uppercase tracking-widest flex items-center space-x-1">
                          <Calendar className="h-3 w-3" />
                          <span>{plan.total_days}d Plan</span>
                        </span>
                        {isDone ? (
                          <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Complete</span>
                          </span>
                        ) : (
                          <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md flex items-center space-x-1">
                            <TrendingUp className="h-3 w-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </div>

                      <h3 className="font-black text-lg text-white mb-1.5 leading-snug tracking-tight group-hover:text-indigo-300 transition-colors duration-200">
                        {plan.topic}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {completedTopics} / {totalTopics} lectures complete
                      </p>
                    </div>

                    <div className="mt-5 space-y-4">
                      {/* Progress bar */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[11px] font-semibold text-slate-500">
                          <span>Progress</span>
                          <span className="text-slate-300">{percent}%</span>
                        </div>
                        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className="h-full progress-bar rounded-full transition-all duration-700"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
                      </div>

                      <Link
                        href={`/plan/${plan.id}`}
                        className="group/btn flex items-center justify-center space-x-2 w-full py-3 rounded-xl bg-white/5 border border-white/8 hover:bg-indigo-600/20 hover:border-indigo-500/40 text-slate-300 hover:text-white text-sm font-semibold transition-all duration-200"
                      >
                        <span>{isDone ? "Review Plan" : "Continue Studying"}</span>
                        <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
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
