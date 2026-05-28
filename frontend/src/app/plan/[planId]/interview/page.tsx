"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "@/components/auth/AuthGuard";
import api from "@/lib/api";
import { useElevenLabsConversation } from "@/hooks/useElevenLabsConversation";
import {
  ArrowLeft, Mic, MicOff, Volume2, Sparkles, AlertCircle,
  RefreshCw, ChevronRight, Trophy, ListChecks, Star,
  MessageSquare, CheckCircle2, XCircle,
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

function ScoreRing({ score }: { score: number }) {
  const grade =
    score >= 90 ? "A" : score >= 80 ? "B" : score >= 70 ? "C" : score >= 60 ? "D" : "F";
  const color =
    score >= 80 ? "text-emerald-400" : score >= 60 ? "text-amber-400" : "text-red-400";
  const ring =
    score >= 80 ? "ring-emerald-500/30" : score >= 60 ? "ring-amber-500/30" : "ring-red-500/30";
  return (
    <div className={`inline-flex flex-col items-center justify-center bg-slate-950 border border-slate-800 h-36 w-36 rounded-full ring-4 ${ring}`}>
      <span className={`text-5xl font-extrabold ${color}`}>{score}</span>
      <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mt-1">
        Grade {grade}
      </span>
    </div>
  );
}

function WaveformBars({ active, color = "indigo" }: { active: boolean; color?: string }) {
  const heights = [35, 60, 80, 55, 90, 70, 45, 75, 60, 40, 85, 65];
  return (
    <div className="flex items-center space-x-0.5 h-10">
      {heights.map((h, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all duration-150 ${
            active ? `bg-${color}-500` : "bg-slate-700"
          }`}
          style={{
            height: active ? `${(Math.abs(Math.sin((i + Date.now() / 300) * 0.9)) * h + 15)}%` : "15%",
          }}
        />
      ))}
    </div>
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
        const res = await api.post(`/interviews/${interviewId}/evaluate-transcript`, {
          transcript,
        });
        setEvaluation(res.data);
        setPageState("finished");
      } catch (e: any) {
        setError(e?.response?.data?.detail || "Failed to evaluate interview. Try again.");
        setPageState("active");
      }
    },
  });

  // Track rough question count from AI messages
  useEffect(() => {
    const aiMessages = liveTranscript.filter((m) => m.source === "ai");
    setQuestionCount(Math.min(aiMessages.length, 8));
  }, [liveTranscript]);

  // Auto-scroll transcript
  useEffect(() => {
    if (transcriptScrollRef.current) {
      transcriptScrollRef.current.scrollTop = transcriptScrollRef.current.scrollHeight;
    }
  }, [liveTranscript]);

  const handleStart = async () => {
    setPageState("starting");
    setError("");
    try {
      const res = await api.post(`/plans/${planId}/voice-interview-session`, {
        question_count: selectedQuestionCount,
      });
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
        const res = await api.post(`/interviews/${interviewId}/evaluate-transcript`, {
          transcript: buildTranscript(),
        });
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

  // ── IDLE ──────────────────────────────────────────────────────────────────
  if (pageState === "idle" || pageState === "starting") {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center space-x-4 sticky top-0 z-30">
            <Link href={`/plan/${planId}`} className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-extrabold text-sm text-white leading-tight">AI Voice Interview</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mt-0.5">PrepStudio · Powered by ElevenLabs</p>
            </div>
          </header>

          <main className="flex-grow flex items-center justify-center px-6 py-16">
            <div className="max-w-lg w-full text-center space-y-8">
              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start space-x-2 text-xs text-red-400 text-left">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Icon */}
              <div className="relative mx-auto w-fit">
                <div className="absolute inset-0 rounded-full bg-indigo-500/20 blur-2xl scale-150" />
                <div className="relative bg-slate-900 border border-slate-800 p-8 rounded-full">
                  <Mic className="h-14 w-14 text-indigo-400" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-extrabold text-white tracking-tight">
                  Ready for your interview?
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto">
                  Alex, your AI interviewer, will start with a brief intro then ask
                  8 technical questions — all by voice. Speak naturally. A full
                  performance report is generated when you finish.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
                {[
                  { icon: <Mic className="h-4 w-4 text-indigo-400 mx-auto mb-1" />, label: "Voice only" },
                  { icon: <MessageSquare className="h-4 w-4 text-violet-400 mx-auto mb-1" />, label: `${selectedQuestionCount} questions` },
                  { icon: <Star className="h-4 w-4 text-amber-400 mx-auto mb-1" />, label: "Full report" },
                ].map((item, i) => (
                  <div key={i} className="bg-slate-900/60 border border-slate-800 p-3 rounded-xl text-center">
                    {item.icon}
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                {/* Question count selector */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Number of questions
                  </p>
                  <div className="flex gap-2">
                    {[2, 4, 8].map((n) => (
                      <button
                        key={n}
                        onClick={() => setSelectedQuestionCount(n)}
                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition ${
                          selectedQuestionCount === n
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                        }`}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  Ensure microphone access is allowed before starting
                </p>
                <button
                  onClick={handleStart}
                  disabled={pageState === "starting"}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white py-4 rounded-2xl font-bold text-base transition shadow-lg shadow-indigo-600/20 flex items-center justify-center space-x-3"
                >
                  {pageState === "starting" ? (
                    <><RefreshCw className="h-5 w-5 animate-spin" /><span>Preparing your interview...</span></>
                  ) : (
                    <><Mic className="h-5 w-5" /><span>Start Voice Interview — {selectedQuestionCount} Questions</span></>
                  )}
                </button>
              </div>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  // ── ACTIVE ────────────────────────────────────────────────────────────────
  if (pageState === "active") {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="font-extrabold text-sm text-white leading-tight">Live Interview — Alex</h1>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mt-0.5">ElevenLabs Conversational AI</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <span className="text-slate-400 text-xs font-semibold bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
                ~Q{questionCount}/8
              </span>
              <button
                onClick={handleEndEarly}
                className="text-xs font-semibold text-red-400 border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg transition"
              >
                End Interview
              </button>
            </div>
          </header>

          <main className="flex-grow max-w-4xl w-full mx-auto px-6 py-8 flex flex-col gap-6">
            {(error || convError) && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start space-x-2 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error || convError}</span>
              </div>
            )}

            {/* AI Visualizer */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-8 flex flex-col items-center space-y-6">
              <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <Volume2 className={`h-4 w-4 ${isSpeaking ? "text-indigo-400" : "text-slate-600"}`} />
                <span>{isSpeaking ? "Alex is speaking" : "Alex is listening..."}</span>
              </div>

              {/* Animated avatar */}
              <div className="relative">
                <div className={`absolute inset-0 rounded-full transition-all duration-500 ${isSpeaking ? "bg-indigo-500/20 blur-xl scale-125" : "bg-transparent"}`} />
                <div className={`relative flex items-center justify-center w-24 h-24 rounded-full border-2 transition-all duration-300 ${isSpeaking ? "border-indigo-500/60 bg-indigo-600/10" : "border-slate-800 bg-slate-900"}`}>
                  <span className="text-3xl font-black text-white">A</span>
                </div>
                {isSpeaking && (
                  <div className="absolute -inset-2 rounded-full border border-indigo-500/20 animate-ping" />
                )}
              </div>

              {/* Waveform */}
              <div className="flex items-center space-x-0.5 h-10 w-full max-w-xs justify-center">
                {[...Array(20)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 rounded-full transition-all duration-150 ${isSpeaking ? "bg-indigo-500" : "bg-slate-700"}`}
                    style={{
                      height: isSpeaking
                        ? `${20 + Math.abs(Math.sin((i + Date.now() / 250) * 0.9)) * 80}%`
                        : "15%",
                    }}
                  />
                ))}
              </div>

              <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                {status === "connecting" ? "Connecting to Alex..." : "Your mic is always open — speak when ready"}
              </p>
            </div>

            {/* Live Transcript */}
            <div className="bg-slate-900/30 border border-slate-800 rounded-2xl overflow-hidden flex flex-col" style={{ maxHeight: "340px" }}>
              <div className="px-5 py-3 border-b border-slate-800 flex items-center space-x-2 text-xs text-slate-500 font-semibold uppercase tracking-wider shrink-0">
                <MessageSquare className="h-3.5 w-3.5" />
                <span>Live Transcript</span>
              </div>
              <div ref={transcriptScrollRef} className="p-5 space-y-3 overflow-y-auto flex-grow">
                {liveTranscript.length === 0 ? (
                  <p className="text-slate-600 text-xs italic">Conversation will appear here...</p>
                ) : (
                  liveTranscript.map((entry, i) => (
                    <div key={i} className={`flex ${entry.source === "user" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        entry.source === "ai"
                          ? "bg-slate-800/80 text-slate-200 rounded-tl-sm"
                          : "bg-indigo-600/20 text-indigo-200 rounded-tr-sm border border-indigo-500/20"
                      }`}>
                        <p className={`text-[10px] font-bold uppercase tracking-wider mb-1 ${entry.source === "ai" ? "text-slate-500" : "text-indigo-500"}`}>
                          {entry.source === "ai" ? "Alex" : "You"}
                        </p>
                        <p>{entry.message}</p>
                      </div>
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

  // ── EVALUATING ────────────────────────────────────────────────────────────
  if (pageState === "evaluating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="flex flex-col items-center space-y-5 max-w-sm text-center px-6">
          <div className="relative">
            <div className="absolute inset-0 bg-indigo-500/20 blur-2xl scale-150 rounded-full" />
            <div className="relative bg-slate-900 border border-slate-800 p-6 rounded-full">
              <Sparkles className="h-10 w-10 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <h3 className="font-extrabold text-xl text-white">Analysing your performance...</h3>
          <p className="text-slate-400 text-xs leading-relaxed">
            Gemini is reviewing your full interview transcript, scoring each answer, and building your personalised report.
          </p>
          <div className="flex space-x-1.5 mt-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── FINISHED ──────────────────────────────────────────────────────────────
  if (pageState === "finished" && evaluation) {
    return (
      <AuthGuard>
        <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
          <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center space-x-4">
              <Link href={`/plan/${planId}`} className="text-slate-400 hover:text-white transition">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="font-extrabold text-sm text-white leading-tight">Interview Report</h1>
                <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mt-0.5">PrepStudio · Powered by Gemini</p>
              </div>
            </div>
          </header>

          <main className="max-w-4xl w-full mx-auto px-6 py-10 space-y-8">
            {/* Hero score card */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl relative overflow-hidden shadow-2xl text-center">
              <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-indigo-500/10 rounded-full blur-[60px] pointer-events-none" />
              <div className="bg-indigo-500/10 text-indigo-400 p-4 rounded-full w-fit mx-auto mb-5">
                <Trophy className="h-10 w-10" />
              </div>
              <h2 className="text-3xl font-extrabold text-white tracking-tight mb-1">Interview Complete!</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto mb-8 leading-relaxed">
                {evaluation.summary}
              </p>

              <div className="flex justify-center mb-8">
                <ScoreRing score={evaluation.overall_score} />
              </div>

              {/* Strengths & Improvements */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-left border-t border-slate-800 pt-8">
                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl">
                  <h3 className="font-bold text-sm text-emerald-400 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                    <CheckCircle2 className="h-4 w-4" /><span>Strengths</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {evaluation.strengths.map((s, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
                        <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-slate-950/40 border border-slate-900 p-5 rounded-2xl">
                  <h3 className="font-bold text-sm text-amber-400 uppercase tracking-wider mb-4 flex items-center space-x-1.5">
                    <Sparkles className="h-4 w-4" /><span>Areas to Improve</span>
                  </h3>
                  <ul className="space-y-2.5">
                    {evaluation.improvements.map((s, i) => (
                      <li key={i} className="flex items-start space-x-2 text-xs text-slate-300 leading-relaxed">
                        <span className="text-amber-500 mt-0.5 shrink-0">→</span>
                        <span>{s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Per-question breakdown */}
            <div className="space-y-4">
              <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider flex items-center space-x-2">
                <ListChecks className="h-4 w-4 text-indigo-400" />
                <span>Question-by-Question Breakdown</span>
              </h3>
              {evaluation.question_feedback.map((qf, i) => {
                const pct = qf.score;
                const scoreColor = pct >= 80 ? "text-emerald-400" : pct >= 60 ? "text-amber-400" : "text-red-400";
                const barColor = pct >= 80 ? "bg-emerald-500" : pct >= 60 ? "bg-amber-500" : "bg-red-500";
                return (
                  <div key={i} className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3 min-w-0">
                        <span className="bg-indigo-600/15 text-indigo-400 text-[10px] font-extrabold px-2 py-1 rounded shrink-0 mt-0.5">
                          Q{i + 1}
                        </span>
                        <p className="text-sm font-semibold text-slate-200 leading-snug">{qf.question}</p>
                      </div>
                      <span className={`text-xl font-extrabold shrink-0 ${scoreColor}`}>{pct}</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5">
                      <div className={`h-1.5 rounded-full ${barColor} transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{qf.assessment}</p>
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href={`/plan/${planId}`}
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white px-6 py-4 rounded-xl font-bold transition text-center flex items-center justify-center space-x-2"
              >
                <span>Return to Study Plan</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
              <button
                onClick={handleRetake}
                className="flex-1 border border-slate-800 hover:bg-slate-800/80 text-slate-300 px-6 py-4 rounded-xl font-semibold transition"
              >
                Retake Interview
              </button>
            </div>
          </main>
        </div>
      </AuthGuard>
    );
  }

  return null;
}
