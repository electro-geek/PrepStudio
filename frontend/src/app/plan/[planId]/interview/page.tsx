"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { ThemePicker } from "@/components/ThemeToggle";
import api from "@/lib/api";
import { useElevenLabsConversation } from "@/hooks/useElevenLabsConversation";
import {
  ArrowLeft, Mic, Volume2, AlertCircle, RefreshCw, ChevronRight,
} from "lucide-react";

type PageState = "idle" | "starting" | "active" | "evaluating" | "finished";

interface QuestionFeedback {
  question: string;
  score: number;
  assessment: string;
}

interface EvaluationResult {
  overall_score: number;
  overall_grade: string;
  summary: string;
  strengths: string[];
  improvements: string[];
  question_feedback: QuestionFeedback[];
}

/* Score block — pass=primary, sub-threshold=secondary */
function ScoreBlock({ score }: { score: number }) {
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const pass = score >= 70;
  return (
    <div className={`inline-flex flex-col items-center justify-center h-40 w-40 rounded-lg border ${pass ? "border-primary bg-[var(--primary-soft)]" : "border-secondary bg-[rgb(var(--secondary)/0.1)]"}`}>
      <span className={`stat-num text-6xl leading-none ${pass ? "text-primary" : "text-secondary"}`}>{score}</span>
      <span className="section-label mt-2">Grade {grade}</span>
    </div>
  );
}

function HeaderBar({ planId, title, sub, back = true }: { planId: any; title: string; sub: string; back?: boolean }) {
  return (
    <header className="nav-glass px-5 md:px-8 h-14 flex items-center gap-4">
      {back && (
        <Link href={`/plan/${planId}`} className="btn-ghost !p-2" title="Back">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      )}
      <div className={back ? "border-l border-border pl-4" : ""}>
        <h1 className="font-display font-bold text-sm leading-tight">{title}</h1>
        <p className="section-label mt-0.5">{sub}</p>
      </div>
      <div className="ml-auto"><ThemePicker /></div>
    </header>
  );
}

export default function VoiceInterview() {
  const { planId } = useParams();
  const [pageState, setPageState] = useState<PageState>("idle");
  const [error, setError] = useState("");
  const [interviewId, setInterviewId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<string[]>([]);
  const [evaluation, setEvaluation] = useState<EvaluationResult | null>(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [selectedQuestionCount, setSelectedQuestionCount] = useState(8);
  const transcriptScrollRef = useRef<HTMLDivElement>(null);

  const { startWithSignedUrl, endSession, buildTranscript, liveTranscript, status, isSpeaking, error: convError } = useElevenLabsConversation({
    onInterviewComplete: async (transcript) => {
      setPageState("evaluating");
      try {
        const res = await api.post(`/interviews/${interviewId}/evaluate-transcript`, { transcript });
        setEvaluation(res.data);
        setPageState("finished");
      } catch (e: any) {
        setError(e?.response?.data?.detail || "Failed to evaluate interview. Try again.");
        setPageState("active");
      }
    },
  });

  useEffect(() => {
    const aiMessages = liveTranscript.filter((m) => m.source === "ai");
    setQuestionCount(Math.min(aiMessages.length, selectedQuestionCount));
  }, [liveTranscript, selectedQuestionCount]);

  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [liveTranscript]);

  const handleStart = async () => {
    setPageState("starting");
    setError("");
    try {
      const res = await api.post(`/plans/${planId}/voice-interview-session`, { question_count: selectedQuestionCount });
      setInterviewId(res.data.interview_id);
      setQuestions(res.data.questions);
      await startWithSignedUrl(res.data.signed_url);
      setPageState("active");
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to start interview. Check your ElevenLabs API key.");
      setPageState("idle");
    }
  };

  const handleEndEarly = async () => {
    await endSession();
    if (interviewId && liveTranscript.length > 0) {
      setPageState("evaluating");
      try {
        const res = await api.post(`/interviews/${interviewId}/evaluate-transcript`, { transcript: buildTranscript() });
        setEvaluation(res.data);
        setPageState("finished");
      } catch {
        setPageState("idle");
      }
    } else {
      setPageState("idle");
    }
  };

  const handleRetake = () => {
    setPageState("idle");
    setEvaluation(null);
    setInterviewId(null);
    setQuestions([]);
    setError("");
  };

  // ── IDLE / STARTING ──────────────────────────────────────────────────────
  if (pageState === "idle" || pageState === "starting") {
    return (
      <AuthGuard>
        <div className="min-h-screen text-foreground flex flex-col">
          <HeaderBar planId={planId} title="AI voice interview" sub="PrepStudio · powered by ElevenLabs" />

          <main className="flex-grow flex items-center justify-center px-5 py-12">
            <div className="card overflow-hidden max-w-lg w-full shadow-glow">
              <div className="h-1.5 bg-primary" />
              <div className="px-6 md:px-8 py-8 space-y-7">
                {error && (
                  <div className="viz-error rounded-lg px-4 py-3 flex items-start gap-2 text-xs text-left">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
                  </div>
                )}

                <div className="text-center">
                  <span className="section-label text-primary block mb-4">Evaluation terminal</span>
                  <h2 className="font-display font-extrabold tracking-tight text-3xl mb-4 leading-tight">Ready for your<br />interview?</h2>
                  <p className="text-muted text-sm leading-relaxed">
                    Interviewer agent ALEX opens with a brief intro, then asks {selectedQuestionCount} technical
                    questions — all by voice. Speak naturally. A full performance report is issued on completion.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {[
                    { k: "Mode", v: "Voice" },
                    { k: "Items", v: `${selectedQuestionCount} Q` },
                    { k: "Output", v: "Report" },
                  ].map(({ k, v }) => (
                    <div key={k} className="card px-3 py-3 text-center">
                      <p className="section-label mb-1">{k}</p>
                      <p className="font-display font-bold text-base">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="card bg-panel/50 p-4 space-y-3">
                  <p className="section-label">Number of questions</p>
                  <div className="flex gap-2">
                    {[2, 4, 8].map((n) => (
                      <button key={n} onClick={() => setSelectedQuestionCount(n)}
                              className={`flex-1 py-2.5 rounded-lg font-semibold text-sm transition-colors ${selectedQuestionCount === n ? "bg-primary text-primary-fg" : "bg-surface border border-border hover:bg-panel"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="section-label text-center">⚠ Ensure microphone access is allowed</p>

                <button onClick={handleStart} disabled={pageState === "starting"}
                        className="btn w-full py-4 text-base disabled:opacity-50">
                  {pageState === "starting"
                    ? <><RefreshCw className="h-5 w-5 animate-spin" /> Preparing…</>
                    : <><Mic className="h-5 w-5" /> Start — {selectedQuestionCount} questions</>}
                </button>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // ── ACTIVE ───────────────────────────────────────────────────────────────
  if (pageState === "active") {
    return (
      <AuthGuard>
        <div className="min-h-screen text-foreground flex flex-col">
          <header className="nav-glass px-5 md:px-8 h-14 flex items-center justify-between">
            <div>
              <h1 className="font-display font-bold text-sm leading-tight">Live interview / Alex</h1>
              <p className="section-label mt-0.5">ElevenLabs Conversational AI</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemePicker />
              <span className="badge">~Q{questionCount}/{selectedQuestionCount}</span>
              <button onClick={handleEndEarly} className="btn-secondary !py-2 text-sm">End interview</button>
            </div>
          </header>

          <main className="flex-grow max-w-3xl w-full mx-auto px-5 md:px-8 py-8 space-y-4">
            {(error || convError) && (
              <div className="viz-error rounded-lg px-4 py-3 flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error || convError}</span>
              </div>
            )}

            {/* Visualizer */}
            <div className="card p-8 flex flex-col items-center gap-6">
              <div className="flex items-center gap-2 section-label">
                <Volume2 className={`h-4 w-4 ${isSpeaking ? "text-primary" : "text-muted"}`} />
                <span>{isSpeaking ? "Alex speaking" : "Alex listening…"}</span>
              </div>

              {/* Avatar */}
              <div className={`relative flex items-center justify-center w-24 h-24 rounded-2xl ${isSpeaking ? "bg-primary text-primary-fg" : "bg-panel text-muted"}`}>
                <span className="stat-num text-4xl">A</span>
              </div>

              {/* Telemetry waveform */}
              <div className="flex items-end gap-1 h-10 w-full max-w-xs justify-center">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`w-1.5 rounded-full ${isSpeaking ? "bg-primary telem-bar" : "bg-border h-1.5"}`}
                       style={isSpeaking ? { height: "100%", animationDelay: `${i * 50}ms` } : undefined} />
                ))}
              </div>

              <p className="section-label">
                {status === "connecting" ? "Connecting to Alex…" : "Mic always open — speak when ready"}
              </p>
            </div>

            {/* Live transcript */}
            <div className="card flex flex-col overflow-hidden" style={{ maxHeight: "340px" }}>
              <div className="px-5 py-3 border-b border-border section-label shrink-0">Live transcript</div>
              <div ref={transcriptScrollRef} className="p-5 space-y-3 overflow-y-auto flex-grow">
                {liveTranscript.length === 0 ? (
                  <p className="section-label">Awaiting signal…</p>
                ) : (
                  liveTranscript.map((entry, i) => (
                    <div key={i} className={`border-l-2 pl-3 py-1 ${entry.source === "ai" ? "border-primary" : "border-secondary"}`}>
                      <p className={`section-label mb-1 ${entry.source === "ai" ? "text-primary" : "text-secondary"}`}>
                        {entry.source === "ai" ? "// Alex" : ">> You"}
                      </p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{entry.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // ── EVALUATING ───────────────────────────────────────────────────────────
  if (pageState === "evaluating") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card overflow-hidden px-8 py-8 flex flex-col items-center gap-5 max-w-sm text-center">
          <div className="flex items-end gap-1 h-10">
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="w-2 h-full bg-primary telem-bar" style={{ animationDelay: `${i * 0.1}s` }} />)}
          </div>
          <p className="section-label text-primary">Analysing performance</p>
          <p className="text-muted text-xs leading-relaxed">
            Gemini is reviewing your full transcript, scoring each answer, and building your report.
          </p>
        </div>
      </div>
    );
  }

  // ── FINISHED ─────────────────────────────────────────────────────────────
  if (pageState === "finished" && evaluation) {
    return (
      <AuthGuard>
        <div className="min-h-screen text-foreground flex flex-col">
          <HeaderBar planId={planId} title="Interview report" sub="PrepStudio · powered by Gemini" />

          <main className="max-w-3xl w-full mx-auto px-5 md:px-8 py-10 space-y-8">
            {/* Hero score */}
            <div className="card overflow-hidden">
              <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                <h2 className="font-display font-extrabold tracking-tight text-2xl">Interview complete</h2>
                <span className="section-label">Report / №01</span>
              </div>
              <div className="px-6 py-8 flex flex-col md:flex-row items-center gap-8">
                <ScoreBlock score={evaluation.overall_score} />
                <p className="text-foreground/90 text-sm leading-relaxed flex-1">{evaluation.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 border-t border-border divide-y md:divide-y-0 md:divide-x divide-border">
                <div className="p-5">
                  <h3 className="section-label text-primary mb-4">+ Strengths</h3>
                  <ul className="space-y-2.5">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                        <span className="text-primary font-mono shrink-0">+</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-5">
                  <h3 className="section-label text-secondary mb-4">→ Improve</h3>
                  <ul className="space-y-2.5">
                    {evaluation.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground/90 leading-relaxed">
                        <span className="text-secondary font-mono shrink-0">→</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Per-question */}
            <div>
              <p className="section-label mb-4">Question-by-question breakdown</p>
              <div className="card divide-y divide-border overflow-hidden">
                {evaluation.question_feedback.map((qf, i) => {
                  const pass = qf.score >= 70;
                  return (
                    <div key={i} className="px-5 py-5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="badge-primary shrink-0 mt-0.5">Q{i + 1}</span>
                          <p className="text-sm font-semibold leading-snug">{qf.question}</p>
                        </div>
                        <span className={`stat-num text-2xl shrink-0 ${pass ? "text-primary" : "text-secondary"}`}>{qf.score}</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-panel overflow-hidden">
                        <div className={`h-full rounded-full ${pass ? "bg-primary" : "bg-secondary"}`} style={{ width: `${qf.score}%` }} />
                      </div>
                      <p className="text-xs text-foreground/90 leading-relaxed">{qf.assessment}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/plan/${planId}`} className="btn flex-1 px-6 py-4 text-sm">
                Return to study plan <ChevronRight className="h-4 w-4" />
              </Link>
              <button onClick={handleRetake} className="btn-ghost flex-1 px-6 py-4 text-sm">Retake interview</button>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return null;
}
