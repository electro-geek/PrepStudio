"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../components/auth/AuthGuard";
import { Wordmark } from "../../../components/BrandLogo";
import { ThemePicker } from "../../../components/ThemeToggle";
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
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card px-8 py-7 flex flex-col items-center gap-4">
          <div className="flex items-end gap-1 h-8">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="w-1.5 h-full bg-primary telem-bar" style={{ animationDelay: `${i * 0.12}s` }} />)}
          </div>
          <p className="section-label">Loading curriculum</p>
        </div>
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="card overflow-hidden max-w-md w-full">
          <div className="h-1.5 bg-secondary" />
          <div className="px-8 py-8 space-y-5">
            <p className="section-label text-secondary">Fault — plan not found</p>
            <h2 className="font-display font-extrabold tracking-tight text-2xl">Curriculum unavailable</h2>
            <p className="text-muted text-sm">{error || "Could not retrieve the study plan."}</p>
            <Link href="/dashboard" className="btn px-6 py-3 text-sm inline-flex">Return to dashboard</Link>
          </div>
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
      <div className="min-h-screen text-foreground flex flex-col">

        {/* ── Header ───────────────────────────────── */}
        <header className="nav-glass px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link href="/dashboard" className="btn-ghost !p-2 shrink-0" title="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 border-l border-border pl-4">
              <h1 className="font-display font-bold text-base leading-tight truncate">{plan.topic}</h1>
              <p className="font-mono text-[11px] text-muted mt-0.5">{plan.total_days}d track · {completedTopics}/{totalTopics} lectures</p>
            </div>
          </div>

          <div className="shrink-0 ml-4 flex items-center gap-2">
            <ThemePicker />
            {isInterviewUnlocked ? (
              <Link href={`/plan/${plan.id}/interview`} className="btn !py-2.5 text-sm">
                <Mic className="h-3.5 w-3.5" /> AI interview
              </Link>
            ) : (
              <div
                className="badge !py-2.5 cursor-help"
                title={`Complete 80% to unlock the AI Interview. Currently at ${percentComplete}%.`}
              >
                <Lock className="h-3.5 w-3.5" /> Interview [{percentComplete}%]
              </div>
            )}
          </div>
        </header>

        <div className="flex-grow flex flex-col md:flex-row max-w-[1400px] w-full mx-auto">
          {/* ── Sidebar ──────────────────────────────── */}
          <aside className="w-full md:w-[320px] border-b md:border-b-0 md:border-r border-border shrink-0">
            {/* Progress */}
            <div className="border-b border-border p-5">
              <div className="flex items-center justify-between section-label mb-3">
                <span>Plan progress</span>
                <span className="text-primary">{percentComplete}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-panel overflow-hidden mb-2.5">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${percentComplete}%` }} />
              </div>
              <p className="font-mono text-[11px] text-muted leading-snug">
                {totalTopics - completedTopics > 0
                  ? `${totalTopics - completedTopics} lectures to unlock interview`
                  : "Plan complete — interview unlocked"}
              </p>
            </div>

            {/* Day list */}
            <div className="p-4">
              <p className="section-label mb-3 px-1">Curriculum index</p>
              <div className="card divide-y divide-border overflow-y-auto max-h-[calc(100vh-320px)]">
                {plan.days?.map((day: any, index: number) => {
                  const isSelected = index === selectedDayIndex;
                  return (
                    <button
                      key={day.id}
                      onClick={() => setSelectedDayIndex(index)}
                      className={`w-full flex items-center justify-between p-3.5 text-left transition-colors ${
                        isSelected ? "bg-[var(--primary-soft)]" : "hover:bg-panel"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <span className={`section-label block mb-0.5 ${isSelected ? "text-primary" : ""}`}>
                          Day {String(day.day_number).padStart(2, "0")}
                        </span>
                        <span className="text-sm font-semibold block truncate">{day.title}</span>
                      </div>
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${day.is_complete ? "bg-primary" : "border border-border"}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          </aside>

          {/* ── Main content ─────────────────────────── */}
          <main className="flex-grow">
            {currentDay ? (
              <div className="fade-up">
                {/* Day header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 md:px-8 py-8 border-b border-border">
                  <div>
                    <span className="section-label text-primary block mb-2">
                      Day {String(currentDay.day_number).padStart(2, "0")} / active module
                    </span>
                    <h2 className="font-display font-extrabold tracking-tight text-[clamp(1.6rem,3.5vw,2.6rem)]">{currentDay.title}</h2>
                  </div>
                  <button
                    onClick={() => handleToggleDayComplete(currentDay.id)}
                    className={`shrink-0 ${currentDay.is_complete ? "btn" : "btn-ghost"} px-5 py-3 text-sm`}
                  >
                    {currentDay.is_complete ? "✓ Module complete" : "Mark complete"}
                  </button>
                </div>

                {/* Topics */}
                <div className="p-6 md:p-8">
                  <p className="section-label mb-4">Today&apos;s lectures</p>
                  <div className="card divide-y divide-border overflow-hidden">
                    {currentDay.topics?.map((topic: any, idx: number) => (
                      <Link
                        key={topic.id}
                        href={`/plan/${plan.id}/day/${currentDay.id}/topic/${topic.id}`}
                        className="hover:bg-panel px-5 py-5 flex items-center justify-between transition-colors group"
                      >
                        <div className="flex items-center gap-4 min-w-0">
                          <span className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold ${
                            topic.is_complete ? "bg-primary text-primary-fg" : "border border-border text-muted"
                          }`}>
                            {topic.is_complete ? "✓" : String(idx + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <h4 className="font-display font-bold text-sm group-hover:text-primary transition-colors truncate">
                              {topic.title}
                            </h4>
                            <p className="font-mono text-[11px] text-muted mt-0.5">
                              {topic.is_complete ? "Logged" : "Open lecture →"}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors shrink-0 ml-4" />
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center section-label py-24">Select a day from the index</div>
            )}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}
