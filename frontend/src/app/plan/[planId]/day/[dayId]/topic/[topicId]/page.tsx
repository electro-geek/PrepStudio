"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../../../../../components/auth/AuthGuard";
import api from "../../../../../../../lib/api";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, PenTool, AlertCircle, RefreshCw, Headphones, StopCircle, Mic,
} from "lucide-react";
import { useElevenLabsConversation } from "@/hooks/useElevenLabsConversation";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function TopicView() {
  const { planId, dayId, topicId } = useParams();

  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
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
    setLoading(true);
    const generatingTimer = setTimeout(() => setIsGenerating(true), 2000);
    try {
      const res = await api.get(`/topics/${topicId}`);
      setTopic(res.data);
    } catch (e: any) {
      setError("Failed to fetch lecture contents.");
    } finally {
      clearTimeout(generatingTimer);
      setLoading(false);
      setIsGenerating(false);
    }
  };

  useEffect(() => { if (topicId) fetchTopic(); }, [topicId]);
  useEffect(() => { return () => { if (isLessonActive) endSession(); }; }, []);

  const handleToggleComplete = async () => {
    if (!topic || completing) return;
    setCompleting(true);
    try {
      const res = await api.patch(`/topics/${topicId}/complete`);
      setTopic((prev: any) => ({ ...prev, is_complete: res.data.is_complete }));
    } catch {} finally {
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
      setLessonError(e?.response?.data?.detail || "Failed to start audio lesson. Check your ElevenLabs API key.");
    } finally {
      setLessonLoading(false);
    }
  };

  const handleEndLesson = async () => { await endSession(); };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper blueprint px-6">
        <div className="panel px-8 py-7 flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="flex items-end gap-1 h-8">
            {[0,1,2,3,4].map(i => <div key={i} className="w-1.5 h-full bg-ink telem-bar" style={{ animationDelay: `${i*0.12}s` }} />)}
          </div>
          {isGenerating ? (
            <>
              <p className="mono-label text-hazard">[ GENERATING LECTURE ]</p>
              <p className="text-ink-700 text-xs leading-relaxed">
                First visit — Gemini is composing a premium technical guide. 5–15 seconds, executed once.
              </p>
            </>
          ) : (
            <p className="mono-label text-ink-500">[ LOADING LECTURE ]</p>
          )}
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-6 text-center blueprint">
        <div className="panel max-w-md px-8 py-8 space-y-5">
          <div className="hazard-stripes-red h-3 -mx-8 -mt-8 mb-2" />
          <p className="mono-label text-hazard">[ FAULT — CONTENT UNAVAILABLE ]</p>
          <h2 className="macro text-2xl">LECTURE UNAVAILABLE</h2>
          <p className="text-ink-700 text-sm">{error || "Could not retrieve the topic details."}</p>
          <Link href={`/plan/${planId}`} className="btn-ind px-6 py-3 text-xs inline-block">RETURN TO PLAN</Link>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-paper text-ink flex flex-col blueprint">
        {/* Header */}
        <header className="border-b-2 border-ink bg-paper px-5 md:px-8 h-14 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-4 min-w-0">
            <Link href={`/plan/${planId}`} className="btn-outline p-2 flex items-center shrink-0" title="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 border-l border-ink pl-4">
              <h1 className="macro text-sm leading-tight truncate">{topic.title}</h1>
              <p className="mono-label-sm text-ink-500 mt-0.5">STUDY MODULE</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemeToggle className="!p-2" />
            {!isLessonActive ? (
              <button onClick={handleStartLesson} disabled={lessonLoading}
                      className="btn-ind px-3.5 py-2 text-[11px] flex items-center gap-1.5 disabled:opacity-50">
                {lessonLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Headphones className="h-3.5 w-3.5" />}
                <span className="hidden sm:inline">{lessonLoading ? "STARTING…" : "AUDIO LESSON"}</span>
              </button>
            ) : (
              <button onClick={handleEndLesson} className="btn-hazard px-3.5 py-2 text-[11px] flex items-center gap-1.5">
                <StopCircle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">END LESSON</span>
              </button>
            )}

            <button onClick={handleToggleComplete} disabled={completing}
                    className={`px-3.5 py-2 mono-label-sm border-2 transition-colors flex items-center gap-1.5 ${
                      topic.is_complete ? "bg-ink text-paper border-ink hover:bg-paper hover:text-ink" : "bg-paper text-ink border-ink hover:bg-ink hover:text-paper"
                    }`}>
              {topic.is_complete ? "✓ FINISHED" : "MARK DONE"}
            </button>

            <Link href={`/plan/${planId}/day/${dayId}/topic/${topicId}/article`}
                  className="btn-ind px-3.5 py-2 text-[11px] flex items-center gap-1.5">
              <PenTool className="h-3.5 w-3.5" /> <span className="hidden md:inline">ARTICLE</span>
            </Link>
          </div>
        </header>

        {/* Lesson error banner */}
        {lessonError && (
          <div className="bg-hazard text-paper px-6 py-3 flex items-center gap-2 mono-label-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="normal-case tracking-normal font-sans">{lessonError}</span>
            <button onClick={() => setLessonError("")} className="ml-auto">✕</button>
          </div>
        )}

        {/* Article Body */}
        <main className={`max-w-3xl w-full mx-auto px-5 md:px-8 py-10 flex-grow ${isLessonActive ? "pb-32" : ""}`}>
          <article className="panel p-6 md:p-10">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="macro text-3xl border-b-2 border-ink pb-3 mb-6" {...props} />,
                h2: ({ node, ...props }) => <h2 className="macro text-2xl mt-9 mb-4 border-l-4 border-hazard pl-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="font-display font-bold uppercase tracking-tight text-lg text-ink mt-6 mb-3" {...props} />,
                p: ({ node, ...props }) => <p className="text-ink-700 text-[15px] leading-relaxed mb-4" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-none pl-0 space-y-2 mb-4 [&>li]:before:content-['—'] [&>li]:before:text-hazard [&>li]:before:mr-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 text-ink-700 space-y-2 mb-4 marker:font-mono marker:text-hazard" {...props} />,
                li: ({ node, ...props }) => <li className="text-ink-700 text-sm leading-relaxed" {...props} />,
                code: ({ node, inline, className, children, ...props }: any) => {
                  if (inline) {
                    return <code className="bg-paper-dark px-1.5 py-0.5 text-[13px] text-hazard border border-ink font-mono" {...props}>{children}</code>;
                  }
                  return (
                    <div className="my-6 border-2 border-ink">
                      <div className="term-surface term-text px-4 py-2 flex items-center justify-between mono-label-sm">
                        <span>// CODE IMPLEMENTATION</span><span className="text-hazard">●●●</span>
                      </div>
                      <pre className="term-surface term-text p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                        <code {...props}>{children}</code>
                      </pre>
                    </div>
                  );
                },
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-4 border-ink bg-paper-alt p-4 my-4 text-ink-700 text-sm" {...props} />
                ),
              }}
            >
              {topic.content || "Loading article content..."}
            </ReactMarkdown>
          </article>

          {topic.article_ideas && topic.article_ideas.length > 0 && (
            <section className="panel mt-8">
              <div className="border-b-2 border-ink px-6 py-4 flex items-center justify-between">
                <h3 className="macro text-lg">SUGGESTED ARTICLE PROJECTS</h3>
                <span className="mono-label-sm text-ink-500">[ {topic.article_ideas.length} ]</span>
              </div>
              <p className="text-ink-700 text-xs leading-relaxed px-6 py-4 border-b border-ink">
                Translate understanding into community authority. Gemini prepared these blog proposals matching your topic depth.
              </p>
              <div className="hairline-grid grid-cols-1 md:grid-cols-3">
                {topic.article_ideas.map((idea: string, idx: number) => (
                  <div key={idx} className="bg-paper px-4 py-4 flex items-start gap-3">
                    <span className="mono-label-sm bg-ink text-paper px-1.5 py-1 shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                    <p className="text-sm font-semibold text-ink leading-tight">{idea}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex items-center justify-between border-t-2 border-ink mt-8 pt-6">
            <Link href={`/plan/${planId}`} className="mono-label text-ink-500 hover:text-hazard transition-colors flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> BACK TO TRACK
            </Link>
            <Link href={`/plan/${planId}/day/${dayId}/topic/${topicId}/article`}
                  className="btn-ind px-5 py-3 text-xs flex items-center gap-2">
              <PenTool className="h-4 w-4" /> ARTICLE EDITOR
            </Link>
          </div>
        </main>

        {/* Floating Audio Lesson Player */}
        {isLessonActive && (
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t-2 border-ink bg-paper-alt px-5 md:px-8 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 flex items-center justify-center border-2 border-ink ${isSpeaking ? "bg-hazard text-paper" : "bg-paper text-ink"}`}>
                  <Headphones className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="mono-label text-ink truncate">NOVA / AI TUTOR</p>
                  <p className="mono-label-sm text-ink-500 truncate">{topic.title}</p>
                </div>
              </div>

              {/* Telemetry waveform */}
              <div className="hidden sm:flex items-end gap-0.5 h-8 flex-1 max-w-[220px] justify-center">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className={`w-1 ${isSpeaking ? "bg-ink telem-bar" : "bg-ink-300 h-1.5"}`}
                       style={isSpeaking ? { height: "100%", animationDelay: `${i * 45}ms` } : undefined} />
                ))}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="mono-label-sm text-ink-500 hidden md:flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-hazard" /> ASK ANYTIME
                </span>
                <span className="mono-label-sm text-ink-500">
                  {lessonStatus === "connecting" ? "CONNECTING…" : isSpeaking ? "TEACHING" : "LISTENING"}
                </span>
                <button onClick={handleEndLesson} className="btn-hazard px-3 py-2 text-[11px] flex items-center gap-1.5">
                  <StopCircle className="h-3.5 w-3.5" /> END
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
