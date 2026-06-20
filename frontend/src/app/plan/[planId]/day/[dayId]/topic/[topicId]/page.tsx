"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../../../../../components/auth/AuthGuard";
import api from "../../../../../../../lib/api";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, PenTool, AlertCircle, RefreshCw, Headphones, StopCircle, Mic, Sparkles,
} from "lucide-react";
import { useElevenLabsConversation } from "@/hooks/useElevenLabsConversation";
import { ThemePicker } from "@/components/ThemeToggle";
import WaitlistModal from "@/components/WaitlistModal";

export default function TopicView() {
  const { planId, dayId, topicId } = useParams();

  const [topic, setTopic] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [lessonLoading, setLessonLoading] = useState(false);
  const [waitlistOpen, setWaitlistOpen] = useState(false);

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
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="card px-8 py-7 flex flex-col items-center gap-4 max-w-sm text-center">
          <div className="flex items-end gap-1 h-8">
            {[0, 1, 2, 3, 4].map((i) => <div key={i} className="w-1.5 h-full bg-primary telem-bar" style={{ animationDelay: `${i * 0.12}s` }} />)}
          </div>
          {isGenerating ? (
            <>
              <p className="section-label text-primary">Generating lecture</p>
              <p className="text-muted text-xs leading-relaxed">
                First visit — Gemini is composing a premium technical guide. 5–15 seconds, executed once.
              </p>
            </>
          ) : (
            <p className="section-label">Loading lecture</p>
          )}
        </div>
      </div>
    );
  }

  if (error || !topic) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="card overflow-hidden max-w-md w-full">
          <div className="h-1.5 bg-secondary" />
          <div className="px-8 py-8 space-y-5">
            <p className="section-label text-secondary">Fault — content unavailable</p>
            <h2 className="font-display font-extrabold tracking-tight text-2xl">Lecture unavailable</h2>
            <p className="text-muted text-sm">{error || "Could not retrieve the topic details."}</p>
            <Link href={`/plan/${planId}`} className="btn px-6 py-3 text-sm inline-flex">Return to plan</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen text-foreground flex flex-col">
        {/* Header */}
        <header className="nav-glass px-5 md:px-8 h-14 flex items-center justify-between">
          <div className="flex items-center gap-4 min-w-0">
            <Link href={`/plan/${planId}`} className="btn-ghost !p-2 shrink-0" title="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 border-l border-border pl-4">
              <h1 className="font-display font-bold text-sm leading-tight truncate">{topic.title}</h1>
              <p className="section-label mt-0.5">Study module</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <ThemePicker />
            {!isLessonActive ? (
              <button onClick={() => setWaitlistOpen(true)}
                      className="btn !py-2 text-sm">
                <Headphones className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Audio lesson</span>
                <Sparkles className="h-3 w-3 text-primary-fg/80" />
              </button>
            ) : (
              <button onClick={handleEndLesson} className="btn-secondary !py-2 text-sm">
                <StopCircle className="h-3.5 w-3.5" /> <span className="hidden sm:inline">End lesson</span>
              </button>
            )}

            <button onClick={handleToggleComplete} disabled={completing}
                    className={`${topic.is_complete ? "btn" : "btn-ghost"} !py-2 text-sm`}>
              {topic.is_complete ? "✓ Finished" : "Mark done"}
            </button>

            <Link href={`/plan/${planId}/day/${dayId}/topic/${topicId}/article`}
                  className="btn-ghost !py-2 text-sm">
              <PenTool className="h-3.5 w-3.5" /> <span className="hidden md:inline">Article</span>
            </Link>
          </div>
        </header>

        {/* Lesson error banner */}
        {lessonError && (
          <div className="viz-error px-6 py-3 flex items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{lessonError}</span>
            <button onClick={() => setLessonError("")} className="ml-auto">✕</button>
          </div>
        )}

        {/* Article Body */}
        <main className={`max-w-3xl w-full mx-auto px-5 md:px-8 py-10 flex-grow ${isLessonActive ? "pb-32" : ""}`}>
          <article className="card p-6 md:p-10">
            <ReactMarkdown
              components={{
                h1: ({ node, ...props }) => <h1 className="font-display font-extrabold tracking-tight text-3xl border-b border-border pb-3 mb-6" {...props} />,
                h2: ({ node, ...props }) => <h2 className="font-display font-bold text-2xl mt-9 mb-4 border-l-2 border-primary pl-3" {...props} />,
                h3: ({ node, ...props }) => <h3 className="font-display font-bold text-lg text-foreground mt-6 mb-3" {...props} />,
                p: ({ node, ...props }) => <p className="text-foreground/90 text-[15px] leading-relaxed mb-4" {...props} />,
                ul: ({ node, ...props }) => <ul className="list-none pl-0 space-y-2 mb-4 [&>li]:before:content-['—'] [&>li]:before:text-primary [&>li]:before:mr-2" {...props} />,
                ol: ({ node, ...props }) => <ol className="list-decimal pl-6 text-foreground/90 space-y-2 mb-4 marker:font-mono marker:text-primary" {...props} />,
                li: ({ node, ...props }) => <li className="text-foreground/90 text-sm leading-relaxed" {...props} />,
                code: ({ node, inline, className, children, ...props }: any) => {
                  if (inline) {
                    return <code className="bg-panel px-1.5 py-0.5 rounded text-[13px] text-secondary border border-border font-mono" {...props}>{children}</code>;
                  }
                  return (
                    <div className="my-6 rounded-lg overflow-hidden border border-border">
                      <div className="term-surface !rounded-none !border-0 border-b border-border px-4 py-2 flex items-center justify-between font-mono text-xs text-muted">
                        <span>// code implementation</span><span className="text-primary">●●●</span>
                      </div>
                      <pre className="term-surface !rounded-none !border-0 p-4 overflow-x-auto text-sm font-mono leading-relaxed">
                        <code {...props}>{children}</code>
                      </pre>
                    </div>
                  );
                },
                blockquote: ({ node, ...props }) => (
                  <blockquote className="border-l-2 border-primary bg-panel/50 rounded-r-lg p-4 my-4 text-muted text-sm" {...props} />
                ),
              }}
            >
              {topic.content || "Loading article content..."}
            </ReactMarkdown>
          </article>

          {topic.article_ideas && topic.article_ideas.length > 0 && (
            <section className="card overflow-hidden mt-8">
              <div className="border-b border-border px-6 py-4 flex items-center justify-between">
                <h3 className="font-display font-bold text-lg">Suggested article projects</h3>
                <span className="badge">{topic.article_ideas.length}</span>
              </div>
              <p className="text-muted text-xs leading-relaxed px-6 py-4 border-b border-border">
                Translate understanding into community authority. Gemini prepared these blog proposals matching your topic depth.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
                {topic.article_ideas.map((idea: string, idx: number) => (
                  <div key={idx} className="px-4 py-4 flex items-start gap-3">
                    <span className="badge-primary shrink-0">{String(idx + 1).padStart(2, "0")}</span>
                    <p className="text-sm font-semibold leading-tight">{idea}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="flex items-center justify-between border-t border-border mt-8 pt-6">
            <Link href={`/plan/${planId}`} className="section-label hover:text-primary transition-colors flex items-center gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to track
            </Link>
            <Link href={`/plan/${planId}/day/${dayId}/topic/${topicId}/article`}
                  className="btn px-5 py-3 text-sm">
              <PenTool className="h-4 w-4" /> Article editor
            </Link>
          </div>
        </main>

        {/* Floating Audio Lesson Player */}
        {isLessonActive && (
          <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-surface/80 backdrop-blur px-5 md:px-8 py-4">
            <div className="max-w-3xl mx-auto flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 min-w-0">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSpeaking ? "bg-primary text-primary-fg" : "bg-panel text-muted"}`}>
                  <Headphones className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <p className="font-display font-bold text-sm truncate">Nova / AI tutor</p>
                  <p className="section-label truncate">{topic.title}</p>
                </div>
              </div>

              {/* Telemetry waveform */}
              <div className="hidden sm:flex items-end gap-0.5 h-8 flex-1 max-w-[220px] justify-center">
                {[...Array(24)].map((_, i) => (
                  <div key={i} className={`w-1 rounded-full ${isSpeaking ? "bg-primary telem-bar" : "bg-border h-1.5"}`}
                       style={isSpeaking ? { height: "100%", animationDelay: `${i * 45}ms` } : undefined} />
                ))}
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="section-label hidden md:flex items-center gap-1.5">
                  <Mic className="h-3.5 w-3.5 text-primary" /> Ask anytime
                </span>
                <span className="section-label">
                  {lessonStatus === "connecting" ? "Connecting…" : isSpeaking ? "Teaching" : "Listening"}
                </span>
                <button onClick={handleEndLesson} className="btn-secondary !py-2 text-sm">
                  <StopCircle className="h-3.5 w-3.5" /> End
                </button>
              </div>
            </div>
          </div>
        )}

        <WaitlistModal
          open={waitlistOpen}
          onClose={() => setWaitlistOpen(false)}
          feature="audio_lesson"
          featureLabel="Audio lessons"
        />
      </div>
    </AuthGuard>
  );
}
