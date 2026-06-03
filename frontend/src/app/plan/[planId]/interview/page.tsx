"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import { Wordmark } from "@/components/BrandLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
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

/* Square score block — pass=ink, sub-threshold=hazard */
function ScoreBlock({ score }: { score: number }) {
  const grade = score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const pass = score >= 70;
  return (
    <div className={`inline-flex flex-col items-center justify-center h-40 w-40 border-2 border-ink ${pass ? "bg-paper" : "hazard-stripes-red"}`}>
      <div className={`flex flex-col items-center justify-center w-full h-full ${pass ? "" : "bg-paper m-1.5"}`}>
        <span className={`font-display font-black text-6xl leading-none ${pass ? "text-ink" : "text-hazard"}`}>{score}</span>
        <span className="mono-label-sm text-ink-500 mt-2">GRADE {grade}</span>
      </div>
    </div>
  );
}

function HeaderBar({ planId, title, sub, back = true }: { planId: any; title: string; sub: string; back?: boolean }) {
  return (
    <header className="border-b-2 border-ink bg-paper px-5 md:px-8 h-14 flex items-center gap-4 sticky top-0 z-30">
      {back && (
        <Link href={`/plan/${planId}`} className="btn-outline p-2 flex items-center" title="Back">
          <ArrowLeft className="h-4 w-4" />
        </Link>
      )}
      <div className={back ? "border-l border-ink pl-4" : ""}>
        <h1 className="macro text-sm leading-tight">{title}</h1>
        <p className="mono-label-sm text-ink-500 mt-0.5">{sub}</p>
      </div>
      <ThemeToggle className="ml-auto !p-2" />
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
        <div className="min-h-screen bg-paper text-ink flex flex-col blueprint">
          <HeaderBar planId={planId} title="AI VOICE INTERVIEW" sub="PREPSTUDIO · POWERED BY ELEVENLABS" />

          <main className="flex-grow flex items-center justify-center px-5 py-12">
            <div className="panel max-w-lg w-full">
              <div className="hazard-stripes h-3" />
              <div className="px-6 md:px-8 py-8 space-y-7">
                {error && (
                  <div className="bg-hazard text-paper px-4 py-3 flex items-start gap-2 text-xs text-left">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
                  </div>
                )}

                <div className="text-center">
                  <span className="mono-label text-hazard block mb-4">[ EVALUATION TERMINAL ]</span>
                  <h2 className="macro text-3xl mb-4">READY FOR YOUR<br />INTERVIEW?</h2>
                  <p className="text-ink-700 text-sm leading-relaxed">
                    Interviewer agent ALEX opens with a brief intro, then asks {selectedQuestionCount} technical
                    questions — all by voice. Speak naturally. A full performance report is issued on completion.
                  </p>
                </div>

                <div className="hairline-grid grid-cols-3">
                  {[
                    { k: "MODE", v: "VOICE" },
                    { k: "ITEMS", v: `${selectedQuestionCount} Q` },
                    { k: "OUTPUT", v: "REPORT" },
                  ].map(({ k, v }) => (
                    <div key={k} className="bg-paper px-3 py-3 text-center">
                      <p className="mono-label-sm text-ink-400 mb-1">{k}</p>
                      <p className="macro text-base">{v}</p>
                    </div>
                  ))}
                </div>

                <div className="panel-alt p-4 space-y-3">
                  <p className="mono-label text-ink-500">NUMBER OF QUESTIONS</p>
                  <div className="flex gap-px bg-ink border border-ink">
                    {[2, 4, 8].map((n) => (
                      <button key={n} onClick={() => setSelectedQuestionCount(n)}
                              className={`flex-1 py-2.5 mono-label transition-colors ${selectedQuestionCount === n ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-paper-dark"}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="mono-label-sm text-ink-400 text-center">⚠ ENSURE MICROPHONE ACCESS IS ALLOWED</p>

                <button onClick={handleStart} disabled={pageState === "starting"}
                        className="btn-hazard w-full py-4 text-sm flex items-center justify-center gap-3 disabled:opacity-50">
                  {pageState === "starting"
                    ? <><RefreshCw className="h-5 w-5 animate-spin" /> PREPARING…</>
                    : <><Mic className="h-5 w-5" /> START — {selectedQuestionCount} QUESTIONS</>}
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
        <div className="min-h-screen bg-paper text-ink flex flex-col blueprint">
          <header className="border-b-2 border-ink bg-paper px-5 md:px-8 h-14 flex items-center justify-between sticky top-0 z-30">
            <div>
              <h1 className="macro text-sm leading-tight">LIVE INTERVIEW / ALEX</h1>
              <p className="mono-label-sm text-ink-500 mt-0.5">ELEVENLABS CONVERSATIONAL AI</p>
            </div>
            <div className="flex items-center gap-2">
              <ThemeToggle className="!p-2" />
              <span className="mono-label-sm border-2 border-ink px-3 py-2 text-ink">~Q{questionCount}/{selectedQuestionCount}</span>
              <button onClick={handleEndEarly} className="btn-hazard px-3 py-2 text-[11px]">END INTERVIEW</button>
            </div>
          </header>

          <main className="flex-grow max-w-3xl w-full mx-auto px-5 md:px-8 py-8 flex flex-col gap-px bg-ink border-x-0 md:border-x-2 border-ink">
            {(error || convError) && (
              <div className="bg-hazard text-paper px-4 py-3 flex items-start gap-2 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error || convError}</span>
              </div>
            )}

            {/* Visualizer */}
            <div className="bg-paper p-8 flex flex-col items-center gap-6">
              <div className="flex items-center gap-2 mono-label text-ink-500">
                <Volume2 className={`h-4 w-4 ${isSpeaking ? "text-hazard" : "text-ink-400"}`} />
                <span>{isSpeaking ? "ALEX SPEAKING" : "ALEX LISTENING…"}</span>
              </div>

              {/* Square avatar */}
              <div className={`relative flex items-center justify-center w-24 h-24 border-2 border-ink ${isSpeaking ? "bg-ink text-paper" : "bg-paper text-ink"}`}>
                <span className="font-display font-black text-4xl">A</span>
              </div>

              {/* Telemetry waveform */}
              <div className="flex items-end gap-1 h-10 w-full max-w-xs justify-center">
                {[...Array(20)].map((_, i) => (
                  <div key={i} className={`w-1.5 ${isSpeaking ? "bg-ink telem-bar" : "bg-ink-300 h-1.5"}`}
                       style={isSpeaking ? { height: "100%", animationDelay: `${i * 50}ms` } : undefined} />
                ))}
              </div>

              <p className="mono-label-sm text-ink-400">
                {status === "connecting" ? "CONNECTING TO ALEX…" : "MIC ALWAYS OPEN — SPEAK WHEN READY"}
              </p>
            </div>

            {/* Live transcript */}
            <div className="bg-paper flex flex-col" style={{ maxHeight: "340px" }}>
              <div className="px-5 py-3 border-b-2 border-ink mono-label text-ink-500 shrink-0">[ LIVE TRANSCRIPT ]</div>
              <div ref={transcriptScrollRef} className="p-5 space-y-3 overflow-y-auto flex-grow">
                {liveTranscript.length === 0 ? (
                  <p className="mono-label-sm text-ink-400">AWAITING SIGNAL…</p>
                ) : (
                  liveTranscript.map((entry, i) => (
                    <div key={i} className={`border-l-4 pl-3 py-1 ${entry.source === "ai" ? "border-ink" : "border-hazard"}`}>
                      <p className={`mono-label-sm mb-1 ${entry.source === "ai" ? "text-ink-500" : "text-hazard"}`}>
                        {entry.source === "ai" ? "// ALEX" : ">> YOU"}
                      </p>
                      <p className="text-sm text-ink-700 leading-relaxed">{entry.message}</p>
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
      <div className="min-h-screen flex items-center justify-center bg-paper blueprint px-6">
        <div className="panel px-8 py-8 flex flex-col items-center gap-5 max-w-sm text-center">
          <div className="hazard-stripes-red h-3 w-full -mt-8 -mx-8 mb-2" />
          <div className="flex items-end gap-1 h-10">
            {[0,1,2,3,4,5].map(i => <div key={i} className="w-2 h-full bg-ink telem-bar" style={{ animationDelay: `${i*0.1}s` }} />)}
          </div>
          <p className="mono-label text-hazard">[ ANALYSING PERFORMANCE ]</p>
          <p className="text-ink-700 text-xs leading-relaxed">
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
        <div className="min-h-screen bg-paper text-ink flex flex-col blueprint">
          <HeaderBar planId={planId} title="INTERVIEW REPORT" sub="PREPSTUDIO · POWERED BY GEMINI" />

          <main className="max-w-3xl w-full mx-auto px-5 md:px-8 py-10 space-y-8">
            {/* Hero score */}
            <div className="panel">
              <div className="border-b-2 border-ink px-6 py-4 flex items-center justify-between">
                <h2 className="macro text-2xl">INTERVIEW COMPLETE</h2>
                <span className="mono-label-sm text-ink-500">[ REPORT / №01 ]</span>
              </div>
              <div className="px-6 py-8 flex flex-col md:flex-row items-center gap-8">
                <ScoreBlock score={evaluation.overall_score} />
                <p className="text-ink-700 text-sm leading-relaxed flex-1">{evaluation.summary}</p>
              </div>

              <div className="hairline-grid grid-cols-1 md:grid-cols-2 border-t-2 border-ink">
                <div className="bg-paper p-5">
                  <h3 className="mono-label text-ink mb-4">[ + STRENGTHS ]</h3>
                  <ul className="space-y-2.5">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-ink-700 leading-relaxed">
                        <span className="text-ink font-mono shrink-0">+</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="bg-paper p-5">
                  <h3 className="mono-label text-hazard mb-4">[ → IMPROVE ]</h3>
                  <ul className="space-y-2.5">
                    {evaluation.improvements.map((s, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-ink-700 leading-relaxed">
                        <span className="text-hazard font-mono shrink-0">→</span><span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Per-question */}
            <div>
              <p className="mono-label text-ink-500 mb-4">[ QUESTION-BY-QUESTION BREAKDOWN ]</p>
              <div className="hairline-grid grid-cols-1">
                {evaluation.question_feedback.map((qf, i) => {
                  const pass = qf.score >= 70;
                  return (
                    <div key={i} className="bg-paper px-5 py-5 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 min-w-0">
                          <span className="mono-label-sm bg-ink text-paper px-1.5 py-1 shrink-0 mt-0.5">Q{i + 1}</span>
                          <p className="text-sm font-semibold text-ink leading-snug">{qf.question}</p>
                        </div>
                        <span className={`font-display font-black text-2xl shrink-0 ${pass ? "text-ink" : "text-hazard"}`}>{qf.score}</span>
                      </div>
                      <div className="h-2.5 border border-ink halftone">
                        <div className={`h-full ${pass ? "bg-ink" : "bg-hazard"}`} style={{ width: `${qf.score}%` }} />
                      </div>
                      <p className="text-xs text-ink-700 leading-relaxed">{qf.assessment}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3">
              <Link href={`/plan/${planId}`} className="btn-ind flex-1 px-6 py-4 text-xs flex items-center justify-center gap-2">
                RETURN TO STUDY PLAN <ChevronRight className="h-4 w-4" />
              </Link>
              <button onClick={handleRetake} className="btn-outline flex-1 px-6 py-4 text-xs">RETAKE INTERVIEW</button>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return null;
}
