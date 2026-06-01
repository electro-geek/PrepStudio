"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../components/auth/AuthGuard";
import api from "../../../lib/api";
import {
  ArrowLeft, Mic, ChevronRight, CheckCircle2, Circle,
  AlertCircle, HelpCircle, Lock, Sparkles
} from "lucide-react";

export default function PlanView() {
  const { planId } = useParams();
  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  const fetchPlan = async () => {
    try {
      const res = await api.get(`/plans/${planId}`);
      setPlan(res.data);
    } catch (e: any) {
      setError("Failed to fetch plan details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (planId) fetchPlan(); }, [planId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06060E]">
        <div className="flex flex-col items-center space-y-4">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-2 border-indigo-500/20 animate-pulse absolute inset-0" />
            <div className="h-14 w-14 rounded-full border-t-2 border-indigo-500 animate-spin" />
          </div>
          <p className="text-slate-500 text-sm animate-pulse">Loading curriculum...</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06060E] px-6 text-center">
        <div className="max-w-md space-y-5">
          <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl w-fit mx-auto">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <h2 className="text-xl font-black text-white">Plan Not Found</h2>
          <p className="text-slate-400 text-sm">{error || "Could not retrieve the study plan."}</p>
          <Link href="/dashboard" className="btn-glow px-6 py-2.5 rounded-xl font-semibold text-white inline-block">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  let totalTopics = 0;
  let completedTopics = 0;
  plan.days?.forEach((day: any) => {
    day.topics?.forEach((topic: any) => {
      totalTopics++;
      if (topic.is_complete) completedTopics++;
    });
  });

  const percentComplete = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;
  const isInterviewUnlocked = percentComplete >= 80;
  const currentDay = plan.days?.[selectedDayIndex];

  const handleToggleDayComplete = async (dayId: string) => {
    try {
      await api.patch(`/days/${dayId}/complete`);
      fetchPlan();
    } catch (e) {
      console.error("Failed to toggle day:", e);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#06060E] text-[#F1F5F9] flex flex-col grid-bg">
        {/* Ambient glows */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden">
          <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-indigo-600/6 rounded-full blur-[120px]" />
          <div className="absolute -bottom-40 -right-40 w-[500px] h-[500px] bg-blue-600/6 rounded-full blur-[120px]" />
        </div>

        {/* ── Header ───────────────────────────────── */}
        <header className="relative z-30 border-b border-white/5 bg-black/30 backdrop-blur-xl px-6 py-3.5 flex items-center justify-between sticky top-0">
          <div className="flex items-center space-x-4 min-w-0">
            <Link href="/dashboard" className="text-slate-500 hover:text-white transition shrink-0 group">
              <ArrowLeft className="h-5 w-5 group-hover:-translate-x-0.5 transition-transform" />
            </Link>
            <div className="min-w-0">
              <h1 className="font-black text-base text-white leading-tight truncate">{plan.topic}</h1>
              <p className="text-slate-600 text-[11px] mt-0.5 font-medium">{plan.total_days}-Day Track · {completedTopics}/{totalTopics} lectures</p>
            </div>
          </div>

          <div className="shrink-0 ml-4">
            {isInterviewUnlocked ? (
              <Link
                href={`/plan/${plan.id}/interview`}
                className="flex items-center space-x-2 bg-[#22D3EE]/12 border border-[#22D3EE]/28 hover:bg-[#22D3EE]/20 hover:border-[#22D3EE]/45 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#22D3EE] transition-all duration-200 cursor-pointer"
              >
                <Mic className="h-4 w-4" />
                <span>AI Interview</span>
              </Link>
            ) : (
              <div
                className="flex items-center space-x-2 bg-white/3 border border-white/8 px-4 py-2.5 rounded-xl text-xs font-medium text-slate-500 cursor-help"
                title={`Complete 80% to unlock the AI Interview. Currently at ${percentComplete}%.`}
              >
                <Lock className="h-3.5 w-3.5" />
                <span>Interview ({percentComplete}%)</span>
                <HelpCircle className="h-3 w-3 opacity-60" />
              </div>
            )}
          </div>
        </header>

        <div className="relative z-10 flex-grow flex flex-col md:flex-row max-w-7xl w-full mx-auto">
          {/* ── Sidebar ──────────────────────────────── */}
          <aside className="w-full md:w-[300px] md:border-r border-white/5 p-5 flex flex-col space-y-5 bg-black/10 shrink-0">
            {/* Progress */}
            <div className="glass rounded-2xl p-4 border border-white/5">
              <div className="flex items-center justify-between text-xs font-bold mb-3">
                <span className="text-slate-400 uppercase tracking-wider">Progress</span>
                <span className="text-white">{percentComplete}%</span>
              </div>
              <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full progress-bar rounded-full transition-all duration-700"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
              <p className="text-slate-600 text-[10px] leading-snug">
                {totalTopics - completedTopics > 0
                  ? `${totalTopics - completedTopics} lectures remaining to unlock AI Interview`
                  : "Plan complete — Interview is unlocked!"}
              </p>
            </div>

            {/* Day list */}
            <div>
              <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2.5 px-1">Curriculum</p>
              <div className="space-y-1 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                {plan.days?.map((day: any, index: number) => {
                  const isSelected = index === selectedDayIndex;
                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDayIndex(index)}
                      className={`w-full flex items-center justify-between p-3.5 rounded-xl text-left transition-all duration-150 ${
                        isSelected
                          ? "bg-indigo-500/12 border border-indigo-500/25 text-white"
                          : "border border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/3"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className="text-[9px] font-black uppercase tracking-widest block text-indigo-400/70 mb-0.5">
                          Day {day.day_number}
                        </span>
                        <span className="text-sm block truncate">{day.title}</span>
                      </div>
                      {day.is_complete ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="h-4 w-4 text-white/10 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────── */}
          <main className="flex-grow p-6 md:p-8 space-y-6">
            {currentDay ? (
              <div className="space-y-6 fade-up">
                {/* Day header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-white/5">
                  <div>
                    <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1.5">
                      Day {currentDay.day_number} · Active Module
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                      {currentDay.title}
                    </h2>
                  </div>
                  <button
                    onClick={() => handleToggleDayComplete(currentDay.id)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-200 shrink-0 border ${
                      currentDay.is_complete
                        ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/8"
                    }`}
                  >
                    {currentDay.is_complete ? "✓ Module Complete" : "Mark Complete"}
                  </button>
                </div>

                {/* Topics */}
                <div>
                  <p className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-4">Today's Lectures</p>
                  <div className="grid grid-cols-1 gap-3">
                    {currentDay.topics?.map((topic: any) => (
                      <Link
                        key={topic.id}
                        href={`/plan/${plan.id}/day/${currentDay.id}/topic/${topic.id}`}
                        className="glass border border-white/5 hover:border-indigo-500/30 p-5 rounded-2xl flex items-center justify-between transition-all duration-200 group"
                      >
                        <div className="flex items-center space-x-4 min-w-0">
                          <div
                            className={`p-2.5 rounded-xl shrink-0 transition-colors ${
                              topic.is_complete
                                ? "bg-emerald-500/12 text-emerald-400"
                                : "bg-white/5 text-slate-500 group-hover:bg-indigo-500/10 group-hover:text-indigo-400"
                            }`}
                          >
                            {topic.is_complete
                              ? <CheckCircle2 className="h-5 w-5" />
                              : <Circle className="h-5 w-5" />}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-slate-200 group-hover:text-white transition-colors truncate">
                              {topic.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-0.5">
                              {topic.is_complete ? "Completed" : "Click to read lecture"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-slate-600 py-20">
                Select a day from the sidebar to begin.
              </div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
