"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../../../../../../components/auth/AuthGuard";
import { Wordmark } from "../../../../../../../../components/BrandLogo";
import { ThemeToggle } from "../../../../../../../../components/ThemeToggle";
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
      <div className="min-h-screen bg-paper text-ink flex flex-col blueprint">
        {/* Header */}
        <header className="border-b-2 border-ink bg-paper px-5 md:px-8 h-14 flex items-center gap-4 sticky top-0 z-30">
          <Link href={`/plan/${planId}/day/${dayId}/topic/${topicId}`} className="btn-outline p-2 flex items-center" title="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div className="border-l border-ink pl-4">
            <h1 className="macro text-sm leading-tight">ARTICLE REFINER & THREADER</h1>
            <p className="mono-label-sm text-ink-500 mt-0.5">AUTHORING WORKSPACE</p>
          </div>
          <ThemeToggle className="ml-auto !p-2" />
        </header>

        {/* Workspace */}
        <main className="flex-grow max-w-[1400px] w-full mx-auto md:border-x-2 md:border-ink grid grid-cols-1 lg:grid-cols-2">
          {/* Left: input */}
          <div className="flex flex-col border-b-2 lg:border-b-0 lg:border-r-2 border-ink">
            <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-ink bg-paper-alt">
              <h2 className="macro text-base">STUDY SCRATCHPAD</h2>
              <span className="mono-label-sm text-ink-500">[ RAW INPUT ]</span>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              placeholder={`EXAMPLE:
- Learned django middleware. Sits between request and response.
- process_request runs before view, process_response after.
- Chained together in settings MIDDLEWARE list.
- Use cases: auth, security headers, logging duration.`}
              className="field-ind border-0 p-5 w-full flex-grow min-h-[380px] text-sm leading-relaxed disabled:opacity-50 resize-none"
            />

            <div className="p-4 border-t-2 border-ink bg-paper-alt space-y-3">
              <button
                onClick={handleRefine}
                disabled={loading || !notes.trim()}
                className="btn-ind w-full py-4 text-xs flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <><RefreshCw className="h-4 w-4 animate-spin" /> REFINEMENT IN PROGRESS…</>
                         : <><Sparkles className="h-4 w-4" /> REFINE SCRATCHPAD NOTES</>}
              </button>
              {error && (
                <div className="bg-hazard text-paper px-3 py-2.5 flex items-start gap-2 text-xs">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Right: results */}
          <div className="flex flex-col min-h-[500px] bg-paper-alt">
            {loading ? (
              <div className="flex-grow flex flex-col items-center justify-center gap-4 p-8 text-center">
                <div className="flex items-end gap-1 h-8">
                  {[0,1,2,3,4].map(i => <div key={i} className="w-1.5 h-full bg-ink telem-bar" style={{ animationDelay: `${i*0.12}s` }} />)}
                </div>
                <p className="mono-label text-hazard">[ COMPILING CONTENT ]</p>
                <p className="text-ink-700 text-xs max-w-xs leading-relaxed">
                  Gemini is restructuring your points into a long-form article and a custom thread.
                </p>
              </div>
            ) : !refinedMarkdown ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-center">
                <div className="panel px-6 py-5 mb-5 halftone"><div className="bg-paper px-5 py-3 border border-ink"><p className="mono-label text-ink-500">[ OUTPUT PENDING ]</p></div></div>
                <p className="text-ink-700 text-xs max-w-xs leading-relaxed">
                  Enter study notes in the scratchpad and execute REFINE. Outputs populate here.
                </p>
              </div>
            ) : (
              <div className="flex flex-col flex-grow">
                {/* Tabs */}
                <div className="border-b-2 border-ink bg-paper flex items-stretch justify-between">
                  <div className="flex">
                    <button onClick={() => setActiveTab("markdown")}
                            className={`px-5 py-3 mono-label-sm border-r-2 border-ink transition-colors ${activeTab === "markdown" ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-paper-dark"}`}>
                      MARKDOWN BLOG
                    </button>
                    <button onClick={() => setActiveTab("twitter")}
                            className={`px-5 py-3 mono-label-sm border-r-2 border-ink transition-colors ${activeTab === "twitter" ? "bg-ink text-paper" : "bg-paper text-ink hover:bg-paper-dark"}`}>
                      X / THREAD
                    </button>
                  </div>
                  {activeTab === "markdown" && (
                    <button onClick={handleCopyMarkdown} className="px-4 mono-label-sm text-ink-500 hover:text-hazard transition-colors flex items-center gap-1.5">
                      {copiedMd ? <><Check className="h-3.5 w-3.5" /> COPIED</> : <><Copy className="h-3.5 w-3.5" /> COPY</>}
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="flex-grow p-6 overflow-y-auto max-h-[600px] bg-paper">
                  {activeTab === "markdown" ? (
                    <ReactMarkdown
                      components={{
                        h1: ({ node, ...props }) => <h1 className="macro text-2xl border-b-2 border-ink pb-3 mb-4" {...props} />,
                        h2: ({ node, ...props }) => <h2 className="macro text-xl mt-6 mb-3 border-l-4 border-hazard pl-3" {...props} />,
                        p: ({ node, ...props }) => <p className="text-ink-700 text-sm leading-relaxed mb-4" {...props} />,
                        ul: ({ node, ...props }) => <ul className="list-none pl-0 space-y-1.5 mb-4 [&>li]:before:content-['—'] [&>li]:before:text-hazard [&>li]:before:mr-2" {...props} />,
                        li: ({ node, ...props }) => <li className="text-ink-700 text-sm" {...props} />,
                        code: ({ node, inline, children, ...props }: any) => (
                          <code className="bg-paper-dark px-1 py-0.5 text-xs text-hazard border border-ink font-mono" {...props}>{children}</code>
                        ),
                        blockquote: ({ node, ...props }) => (
                          <blockquote className="border-l-4 border-ink bg-paper-alt p-3 my-4 text-ink-700 text-xs" {...props} />
                        ),
                      }}
                    >
                      {refinedMarkdown}
                    </ReactMarkdown>
                  ) : (
                    <div className="space-y-px bg-ink border-2 border-ink">
                      {twitterThread.map((tweet, idx) => (
                        <div key={idx} className="bg-paper px-5 py-4 relative group">
                          <div className="flex items-center justify-between mb-2">
                            <span className="mono-label-sm text-hazard">TWEET {idx + 1}/{twitterThread.length}</span>
                            <button onClick={() => handleCopyTweet(tweet, idx)} className="text-ink-400 hover:text-hazard transition-colors" title="Copy">
                              {copiedTweetIndex === idx ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </button>
                          </div>
                          <p className="text-ink-700 text-sm leading-relaxed whitespace-pre-line">{tweet}</p>
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
