"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../../../../../components/auth/AuthGuard";
import api from "../../../../../../../lib/api";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, CheckCircle2, Circle, PenTool, Sparkles,
  AlertCircle, RefreshCw, Headphones, StopCircle, Mic,
} from "lucide-react";
import { useElevenLabsConversation } from "@/hooks/useElevenLabsConversation";

export default function TopicView() {
  const { planId, dayId, topicId } = useParams();

  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [lessonLoading, setLessonLoading] = useState(false);

  const {
    startWithSignedUrl,
    endSession,
    status: lessonStatus,
    isSpeaking,
    error: lessonError,
    setError: setLessonError,
  } = useElevenLabsConversation();

  const isLessonActive = lessonStatus === "connected" || lessonStatus === "connecting";

  const fetchTopic = async () => {
    try {
      const res = await api.get(`/topics/${topicId}`);
      setTopic(res.data);
    } catch (e: any) {
      setError("Failed to fetch lecture contents.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (topicId) fetchTopic();
  }, [topicId]);

  useEffect(() => {
    return () => {
      if (isLessonActive) endSession();
    };
  }, []);

  const handleToggleComplete = async () => {
    if (!topic || completing) return;
    setCompleting(true);
    try {
      const res = await api.patch(`/topics/${topicId}/complete`);
      setTopic((prev: any) => ({ ...prev, is_complete: res.data.is_complete }));
    } catch {
    } finally {
      setCompleting(false);
    }
  };

  const handleStartLesson = async () => {
    setLessonLoading(true);
    setLessonError("");
    try {
      const res = await api.post(`/topics/${topicId}/lesson-session`);
      await startWithSignedUrl(res.data.signed_url);
    } catch (e: any) {
      setLessonError(
        e?.response?.data?.detail || "Failed to start audio lesson. Check your ElevenLabs API key."
      );
    } finally {
      setLessonLoading(false);
    }
  };

  const handleEndLesson = async () => {
    await endSession();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white">
        <div className="flex flex-col items-center space-y-4 max-w-sm text-center px-6">
          <RefreshCw className="h-10 w-10 text-indigo-500 animate-spin" />
          <h3 className="font-bold text-lg text-white">Forging Topic Material...</h3>
          <p className="text-slate-400 text-xs leading-relaxed animate-pulse">
            Please be patient. Gemini is composing a premium technical guide.
          </p>
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F172A] text-white px-6 text-center">
        <div className="max-w-md space-y-4">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto" />
          <h2 className="text-xl font-bold">Lecture Content Unavailable</h2>
          <p className="text-slate-400 text-sm">{error || "Could not retrieve the topic details."}</p>
          <Link href={`/plan/${planId}`} className="bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-xl font-semibold transition inline-block">
            Return to Study Plan
          </Link>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <Link href={`/plan/${planId}`} className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-extrabold text-sm text-white leading-tight">{topic.title}</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mt-0.5">Study Module</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Audio Lesson Button */}
            {!isLessonActive ? (
              <button
                onClick={handleStartLesson}
                disabled={lessonLoading}
                className="bg-violet-600 hover:bg-violet-500 disabled:bg-violet-600/40 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-lg shadow-violet-600/20"
              >
                {lessonLoading ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Headphones className="h-3.5 w-3.5" />
                )}
                <span>{lessonLoading ? "Starting..." : "Audio Lesson"}</span>
              </button>
            ) : (
              <button
                onClick={handleEndLesson}
                className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5"
              >
                <StopCircle className="h-3.5 w-3.5" />
                <span>End Lesson</span>
              </button>
            )}

            <button
              onClick={handleToggleComplete}
              disabled={completing}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 border ${
                topic.is_complete
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                  : "bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800"
              }`}
            >
              {topic.is_complete ? (
                <><CheckCircle2 className="h-4 w-4" /><span>Finished</span></>
              ) : (
                <><Circle className="h-4 w-4" /><span>Mark Finished</span></>
              )}
            </button>

            <Link
              href={`/plan/${planId}/day/${dayId}/topic/${topicId}/article`}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 shadow-lg shadow-indigo-600/10"
            >
              <PenTool className="h-3.5 w-3.5" />
              <span>Write Article</span>
            </Link>
          </div>
        </header>

        {/* Lesson error banner */}
        {lessonError && (
          <div className="bg-red-500/10 border-b border-red-500/20 px-6 py-3 flex items-center space-x-2 text-xs text-red-400">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{lessonError}</span>
            <button onClick={() => setLessonError("")} className="ml-auto text-red-400/60 hover:text-red-400">✕</button>
          </div>
        )}

        {/* Article Body */}
        <main className={`max-w-4xl w-full mx-auto px-6 py-10 flex-grow space-y-10 ${isLessonActive ? "pb-40" : ""}`}>
          <article className="prose prose-invert max-w-none bg-slate-900/30 border border-slate-850 p-6 md:p-10 rounded-2xl backdrop-blur-sm shadow-xl">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="text-3xl font-extrabold text-white border-b border-slate-800 pb-3 mb-6" {...props} />,
                h2: ({ node, ...props }) => <h2 className="text-2xl font-bold text-slate-100 mt-8 mb-4 border-l-4 border-indigo-500 pl-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="text-xl font-semibold text-slate-200 mt-6 mb-3" {...props} />,
                p: ({ node, ...props }) => <p className="text-slate-300 text-base leading-relaxed mb-4" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-disc pl-6 text-slate-300 space-y-2 mb-4" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 text-slate-300 space-y-2 mb-4" {...props} />,
                li: ({ node, ...props }) => <li className="text-slate-300 text-sm leading-relaxed" {...props} />,
                code: ({ node, inline, className, children, ...props }: any) => {
                  if (inline) {
                    return <code className="bg-slate-950/80 px-1.5 py-0.5 rounded text-xs text-indigo-300 border border-slate-800 font-mono" {...props}>{children}</code>;
                  }
                  return (
                    <div className="my-6 rounded-xl overflow-hidden border border-slate-800">
                      <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-xs text-slate-500">
                        <span>Code Implementation</span>
                      </div>
                      <pre className="bg-slate-950 p-4 overflow-x-auto text-sm text-indigo-200 font-mono leading-relaxed">
                        <code {...props}>{children}</code>
                      </pre>
                    </div>
                  );
                },
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-indigo-600 bg-indigo-500/5 p-4 rounded-r-xl my-4 text-slate-400 italic text-sm" {...props} />
                ),
              }}
            >
              {topic.content || "Loading article content..."}
            </ReactMarkdown>
          </article>

          {topic.article_ideas && topic.article_ideas.length > 0 && (
            <section className="bg-indigo-600/5 border border-indigo-500/10 p-6 md:p-8 rounded-2xl relative overflow-hidden">
              <div className="absolute top-[-30px] right-[-30px] w-24 h-24 bg-indigo-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center space-x-2 text-indigo-400 mb-4">
                <Sparkles className="h-5 w-5" />
                <h3 className="font-bold text-lg text-white">Suggested Article Projects</h3>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed mb-6">
                Translate your understanding into community authority. Gemini prepared these custom blog proposals matching your topic depth.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topic.article_ideas.map((idea: string, idx: number) => (
                  <div key={idx} className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex items-start space-x-3 hover:border-indigo-500/30 transition">
                    <span className="bg-indigo-600/15 text-indigo-400 text-xs font-extrabold px-2 py-1 rounded">0{idx + 1}</span>
                    <p className="text-sm font-semibold text-slate-200 leading-tight">"{idea}"</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <Link href={`/plan/${planId}`} className="text-slate-400 hover:text-white transition flex items-center space-x-1.5 text-sm font-semibold">
              <ArrowLeft className="h-4 w-4" />
              <span>Back to study track</span>
            </Link>
            <Link href={`/plan/${planId}/day/${dayId}/topic/${topicId}/article`} className="bg-slate-900 border border-slate-800 hover:bg-slate-800 text-white px-5 py-3 rounded-xl text-sm font-semibold transition flex items-center space-x-1.5">
              <PenTool className="h-4 w-4 text-indigo-400" />
              <span>Launch Article Editor</span>
            </Link>
          </div>
        </main>

        {/* Floating Audio Lesson Player */}
        {isLessonActive && (
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-violet-500/20 bg-slate-950/95 backdrop-blur-xl px-6 py-4">
            <div className="max-w-4xl mx-auto flex items-center justify-between gap-6">
              {/* Left: info */}
              <div className="flex items-center space-x-4 min-w-0">
                <div className={`p-2.5 rounded-full ${isSpeaking ? "bg-violet-600/20 ring-2 ring-violet-500/40" : "bg-slate-800"} transition-all`}>
                  <Headphones className={`h-5 w-5 ${isSpeaking ? "text-violet-400" : "text-slate-400"}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">Nova — AI Tutor</p>
                  <p className="text-[11px] text-slate-400 truncate">{topic.title}</p>
                </div>
              </div>

              {/* Centre: waveform */}
              <div className="flex items-center space-x-0.5 h-8">
                {[...Array(24)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-0.5 rounded-full transition-all duration-100 ${
                      isSpeaking ? "bg-violet-400" : "bg-slate-700"
                    }`}
                    style={{
                      height: isSpeaking
                        ? `${20 + Math.abs(Math.sin((i + Date.now() / 200) * 0.8)) * 80}%`
                        : "20%",
                      animationDelay: `${i * 40}ms`,
                    }}
                  />
                ))}
              </div>

              {/* Right: status + mic hint + end */}
              <div className="flex items-center space-x-3 shrink-0">
                <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                  <Mic className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Ask questions anytime</span>
                </div>

                {lessonStatus === "connecting" && (
                  <span className="text-[11px] text-violet-400 animate-pulse font-semibold uppercase tracking-wider">
                    Connecting...
                  </span>
                )}
                {lessonStatus === "connected" && (
                  <span className={`text-[11px] font-semibold uppercase tracking-wider ${isSpeaking ? "text-violet-400" : "text-slate-500"}`}>
                    {isSpeaking ? "Nova is teaching" : "Listening..."}
                  </span>
                )}

                <button
                  onClick={handleEndLesson}
                  className="flex items-center space-x-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                >
                  <StopCircle className="h-3.5 w-3.5" />
                  <span>End</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
