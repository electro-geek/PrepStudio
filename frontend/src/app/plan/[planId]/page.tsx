"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../components/auth/AuthGuard";
import { Wordmark } from "../../../components/BrandLogo";
import { ThemeToggle } from "../../../components/ThemeToggle";
import api from "../../../lib/api";
import {
  ArrowLeft, Mic, ChevronRight, Lock,
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
      <div className="min-h-screen flex items-center justify-center bg-paper blueprint">
        <div className="panel px-8 py-7 flex flex-col items-center gap-4">
          <div className="flex items-end gap-1 h-8">
            {[0,1,2,3,4].map(i => <div key={i} className="w-1.5 h-full bg-ink telem-bar" style={{ animationDelay: `${i*0.12}s` }} />)}
          </div>
          <p className="mono-label text-ink-500">[ LOADING CURRICULUM ]</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6 text-center blueprint">
        <div className="panel max-w-md px-8 py-8 space-y-5">
          <div className="hazard-stripes-red h-3 -mx-8 -mt-8 mb-2" />
          <p className="mono-label text-hazard">[ FAULT — PLAN NOT FOUND ]</p>
          <h2 className="macro text-2xl">CURRICULUM UNAVAILABLE</h2>
          <p className="text-ink-700 text-sm">{error || "Could not retrieve the study plan."}</p>
          <Link href="/dashboard" className="btn-ind px-6 py-3 text-xs inline-block">RETURN TO DASHBOARD</Link>
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
      <div className="min-h-screen bg-paper text-ink flex flex-col blueprint">

        {/* ── Header ───────────────────────────────── */}
        <header className="relative z-30 border-b-2 border-ink bg-paper px-5 md:px-8 h-14 flex items-center justify-between sticky top-0">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/dashboard" className="btn-outline p-2 flex items-center shrink-0" title="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 border-l border-ink pl-4">
              <h1 className="macro text-base leading-tight truncate">{plan.topic}</h1>
              <p className="mono-label-sm text-ink-500 mt-0.5">{plan.total_days}D TRACK · {completedTopics}/{totalTopics} LECTURES</p>
            </div>
          </div>

          <div className="shrink-0 ml-4 flex items-center gap-2">
            <ThemeToggle />
            {isInterviewUnlocked ? (
              <Link href={`/plan/${plan.id}/interview`} className="btn-hazard px-4 py-2.5 text-[11px] flex items-center gap-2">
                <Mic className="h-3.5 w-3.5" /> AI INTERVIEW
              </Link>
            ) : (
              <div
                className="border-2 border-ink-400 px-4 py-2.5 mono-label-sm text-ink-400 flex items-center gap-2 cursor-help"
                title={`Complete 80% to unlock the AI Interview. Currently at ${percentComplete}%.`}
              >
                <Lock className="h-3.5 w-3.5" /> INTERVIEW [{percentComplete}%]
              </div>
            )}
          </div>
        </header>

        <div className="relative z-10 flex-grow flex flex-col md:flex-row max-w-[1400px] w-full mx-auto md:border-x-2 md:border-ink">
          {/* ── Sidebar ──────────────────────────────── */}
          <aside className="w-full md:w-[320px] border-b-2 md:border-b-0 md:border-r-2 border-ink shrink-0 bg-paper-alt">
            {/* Progress */}
            <div className="border-b-2 border-ink p-5">
              <div className="flex items-center justify-between mono-label-sm mb-3">
                <span className="text-ink-500">PLAN PROGRESS</span>
                <span className="text-hazard">{percentComplete}%</span>
              </div>
              <div className="h-3 border border-ink halftone mb-2.5">
                <div className="h-full bg-ink transition-all duration-500" style={{ width: `${percentComplete}%` }} />
              </div>
              <p className="mono-label-sm text-ink-400 leading-snug">
                {totalTopics - completedTopics > 0
                  ? `${totalTopics - completedTopics} LECTURES TO UNLOCK INTERVIEW`
                  : "PLAN COMPLETE — INTERVIEW UNLOCKED"}
              </p>
            </div>

            {/* Day list */}
            <div className="p-4">
              <p className="mono-label text-ink-500 mb-3 px-1">[ CURRICULUM INDEX ]</p>
              <div className="space-y-px bg-ink border border-ink overflow-y-auto max-h-[calc(100vh-320px)]">
                {plan.days?.map((day: any, index: number) => {
                  const isSelected = index === selectedDayIndex;
                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDayIndex(index)}
                      className={`w-full flex items-center justify-between p-3.5 text-left transition-colors ${
                        isSelected ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-paper-dark"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className={`mono-label-sm block mb-0.5 ${isSelected ? "text-hazard" : "text-ink-400"}`}>
                          DAY {String(day.day_number).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-semibold block truncate">{day.title}</span>
                      </div>
                      <span className={`w-2.5 h-2.5 shrink-0 ${day.is_complete ? (isSelected ? "bg-paper" : "bg-ink") : "border border-current"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────── */}
          <main className="flex-grow bg-paper">
            {currentDay ? (
              <div className="fade-up">
                {/* Day header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 md:px-8 py-8 border-b-2 border-ink">
                  <div>
                    <span className="mono-label text-hazard block mb-2">
                      DAY {String(currentDay.day_number).padStart(2, "0")} / ACTIVE MODULE
                    </span>
                    <h2 className="macro text-[clamp(1.6rem,3.5vw,2.6rem)]">{currentDay.title}</h2>
                  </div>
                  <button
                    onClick={() => handleToggleDayComplete(currentDay.id)}
                    className={`shrink-0 px-5 py-3 mono-label transition-colors border-2 ${
                      currentDay.is_complete
                        ? "bg-ink text-paper border-ink hover:bg-paper hover:text-ink"
                        : "bg-paper text-ink border-ink hover:bg-ink hover:text-paper"
                    }`}
                  >
                    {currentDay.is_complete ? "✓ MODULE COMPLETE" : "MARK COMPLETE"}
                  </button>
                </div>

                {/* Topics */}
                <div className="p-6 md:p-8">
                  <p className="mono-label text-ink-500 mb-4">[ TODAY'S LECTURES ]</p>
                  <div className="hairline-grid grid-cols-1">
                    {currentDay.topics?.map((topic: any, idx: number) => (
                      <Link
                        key={topic.id}
                        href={`/plan/${plan.id}/day/${currentDay.id}/topic/${topic.id}`}
                        className="bg-paper hover:bg-paper-alt px-5 py-5 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className={`w-9 h-9 flex items-center justify-center shrink-0 border-2 border-ink mono-label-sm ${
                            topic.is_complete ? "bg-ink text-paper" : "bg-paper text-ink"
                          }`}>
                            {topic.is_complete ? "✓" : String(idx + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-display font-extrabold text-sm text-ink group-hover:text-hazard transition-colors truncate uppercase tracking-tight">
                              {topic.title}
                            </h4>
                            <p className="mono-label-sm text-ink-400 mt-0.5">
                              {topic.is_complete ? "LOGGED" : "OPEN LECTURE →"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-ink-400 group-hover:text-hazard transition-colors shrink-0 ml-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center mono-label text-ink-400 py-24">[ SELECT A DAY FROM THE INDEX ]</div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
