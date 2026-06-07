"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../../../../../../components/auth/AuthGuard";
import { ThemePicker } from "../../../../../../../../components/ThemeToggle";
import api from "../../../../../../../../lib/api";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Sparkles, Copy, Check, AlertCircle, RefreshCw } from "lucide-react";

export default function ArticleEditor() {
  const { planId, dayId, topicId } = useParams();

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"markdown" | "twitter">("markdown");

  const [refinedMarkdown, setRefinedMarkdown] = useState("");
  const [twitterThread, setTwitterThread] = useState<string[]>([]);

  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedTweetIndex, setCopiedTweetIndex] = useState<number | null>(null);

  const handleRefine = async () => {
    if (!notes.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/articles/refine", { topic_id: topicId, notes });
      setRefinedMarkdown(res.data.markdown || "");
      setTwitterThread(res.data.twitter_thread || []);
    } catch (err: any) {
      console.error("Notes refinement error:", err);
      setError("Failed to refine your notes. Please verify backend state.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopyMarkdown = () => {
    if (!refinedMarkdown) return;
    navigator.clipboard.writeText(refinedMarkdown);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyTweet = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedTweetIndex(index);
    setTimeout(() => setCopiedTweetIndex(null), 2000);
  };

  return (
    <AuthGuard>
      <div className="min-h-screen text-foreground flex flex-col">
        {/* Header */}
        <header className="nav-glass px-5 md:px-8 h-14 flex items-center gap-4">
          <Link href={`/plan/${planId}/day/${dayId}/topic/${topicId}`} className="btn-ghost !p-2" title="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="border-l border-border pl-4">
            <h1 className="font-display font-bold text-sm leading-tight">Article refiner &amp; threader</h1>
            <p className="section-label mt-0.5">Authoring workspace</p>
          </div>
          <div className="ml-auto"><ThemePicker /></div>
        </header>

        {/* Workspace */}
        <main className="flex-grow max-w-[1400px] w-full mx-auto grid grid-cols-1 lg:grid-cols-2">
          {/* Left: input */}
          <div className="flex flex-col border-b lg:border-b-0 lg:border-r border-border">
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-border">
              <h2 className="font-display font-bold text-base">Study scratchpad</h2>
              <span className="section-label">Raw input</span>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              placeholder={`Example:
- Learned django middleware. Sits between request and response.
- process_request runs before view, process_response after.
- Chained together in settings MIDDLEWARE list.
- Use cases: auth, security headers, logging duration.`}
              className="field !rounded-none !border-0 p-5 w-full flex-grow min-h-[380px] text-sm leading-relaxed disabled:opacity-50 resize-none bg-transparent focus:!shadow-none"
            />

            <div className="p-4 border-t border-border space-y-3">
              <button
                onClick={handleRefine}
                disabled={loading || !notes.trim()}
                className="btn w-full py-4 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> Refinement in progress…</>
                  : <><Sparkles className="h-4 w-4" /> Refine scratchpad notes</>}
              </button>
              {error && (
                <div className="viz-error rounded-lg px-3 py-2.5 flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: results */}
          <div className="flex flex-col min-h-[500px]">
            {loading ? (
              <div className="flex-grow flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex items-end gap-1 h-8">
                  {[0, 1, 2, 3, 4].map((i) => <div key={i} className="w-1.5 h-full bg-primary telem-bar" style={{ animationDelay: `${i * 0.12}s` }} />)}
                </div>
                <p className="section-label text-primary">Compiling content</p>
                <p className="text-muted text-xs max-w-xs leading-relaxed">
                  Gemini is restructuring your points into a long-form article and a custom thread.
                </p>
              </div>
            ) : !refinedMarkdown ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                <div className="badge mb-5">Output pending</div>
                <p className="text-muted text-xs max-w-xs leading-relaxed">
                  Enter study notes in the scratchpad and execute Refine. Outputs populate here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col flex-grow">
                {/* Tabs */}
                <div className="border-b border-border flex items-stretch justify-between">
                  <div className="flex">
                    <button onClick={() => setActiveTab("markdown")}
                            className={`px-5 py-3 section-label transition-colors ${activeTab === "markdown" ? "text-primary border-b-2 border-primary" : "hover:text-foreground"}`}>
                      Markdown blog
                    </button>
                    <button onClick={() => setActiveTab("twitter")}
                            className={`px-5 py-3 section-label transition-colors ${activeTab === "twitter" ? "text-primary border-b-2 border-primary" : "hover:text-foreground"}`}>
                      X / thread
                    </button>
                  </div>
                  {activeTab === "markdown" && (
                    <button onClick={handleCopyMarkdown} className="px-4 section-label hover:text-primary transition-colors flex items-center gap-1.5">
                      {copiedMd ? <><Check className="h-3.5 w-3.5" /> Copied</> : <><Copy className="h-3.5 w-3.5" /> Copy</>}
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow p-6 overflow-y-auto max-h-[600px]">
                  {activeTab === "markdown" ? (
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="font-display font-extrabold tracking-tight text-2xl border-b border-border pb-3 mb-4" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="font-display font-bold text-xl mt-6 mb-3 border-l-2 border-primary pl-3" {...props} />,
                        p: ({ node, ...props }) => <p className="text-foreground/90 text-sm leading-relaxed mb-4" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-none pl-0 space-y-1.5 mb-4 [&>li]:before:content-['—'] [&>li]:before:text-primary [&>li]:before:mr-2" {...props} />,
                        li: ({ node, ...props }) => <li className="text-foreground/90 text-sm" {...props} />,
                        code: ({ node, inline, children, ...props }: any) => (
                          <code className="bg-panel px-1 py-0.5 rounded text-xs text-secondary border border-border font-mono" {...props}>{children}</code>
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-2 border-primary bg-panel/50 rounded-r-lg p-3 my-4 text-muted text-xs" {...props} />
                        ),
                      }}
                    >
                      {refinedMarkdown}
                    </ReactMarkdown>
                  ) : (
                    <div className="card divide-y divide-border overflow-hidden">
                      {twitterThread.map((tweet, idx) => (
                        <div key={idx} className="px-5 py-4 relative group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="section-label text-primary">Tweet {idx + 1}/{twitterThread.length}</span>
                            <button onClick={() => handleCopyTweet(tweet, idx)} className="text-muted hover:text-primary transition-colors" title="Copy">
                              {copiedTweetIndex === idx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="text-foreground/90 text-sm leading-relaxed whitespace-pre-line">{tweet}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
