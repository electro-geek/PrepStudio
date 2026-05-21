"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../../../../../../components/auth/AuthGuard";
import api from "../../../../../../../../lib/api";
import ReactMarkdown from "react-markdown";
import { ArrowLeft, Sparkles, Copy, Check, Twitter, BookOpen, AlertCircle, RefreshCw } from "lucide-react";

export default function ArticleEditor() {
  const { planId, dayId, topicId } = useParams();

  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"markdown" | "twitter">("markdown");
  
  // Results from backend
  const [refinedMarkdown, setRefinedMarkdown] = useState("");
  const [twitterThread, setTwitterThread] = useState<string[]>([]);
  
  // Copy feedback indicators
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedTweetIndex, setCopiedTweetIndex] = useState<number | null>(null);

  const handleRefine = async () => {
    if (!notes.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await api.post("/articles/refine", {
        topic_id: topicId,
        notes: notes,
      });
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
      <div className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col justify-between">
        {/* Header */}
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <Link href={`/plan/${planId}/day/${dayId}/topic/${topicId}`} className="text-slate-400 hover:text-white transition">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="font-extrabold text-sm text-white leading-tight">Article Refiner & Social Threader</h1>
              <p className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold mt-0.5">Authoring Workspace</p>
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main className="flex-grow max-w-7xl w-full mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left panel: Input Area */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-lg text-slate-200">Study Scratchpad</h2>
              <span className="text-slate-500 text-xs font-medium">Type or paste rough study points</span>
            </div>

            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={loading}
              placeholder={`Example:
- Learned django middleware. It sits between request and response.
- Process_request is run before view, process_response after.
- They are chained together in setting file Middlewares list.
- Use cases: auth, security headers, logging execution duration.`}
              className="bg-slate-950 border border-slate-850 rounded-2xl p-5 w-full flex-grow min-h-[400px] text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition leading-relaxed font-mono disabled:opacity-50"
            />

            <button
              onClick={handleRefine}
              disabled={loading || !notes.trim()}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/40 text-white rounded-xl py-4 font-semibold transition text-sm flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/10"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin text-white" />
                  <span>AI Refinement In Progress...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 text-white" />
                  <span>Refine Scratchpad Notes</span>
                </>
              )}
            </button>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 flex items-start space-x-2 text-xs text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}
          </div>

          {/* Right panel: Tabbed Results preview */}
          <div className="flex flex-col bg-slate-900/20 border border-slate-850 rounded-2xl overflow-hidden min-h-[500px]">
            {loading ? (
              <div className="flex-grow flex flex-col items-center justify-center space-y-4 p-8 text-center">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-500"></div>
                  <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-indigo-400 animate-pulse" />
                </div>
                <h3 className="font-bold text-lg text-white">Composing Educational Content</h3>
                <p className="text-slate-400 text-xs max-w-xs leading-relaxed">
                  Gemini is restructuring your points into a long-form article and synthesizing a custom Twitter thread.
                </p>
              </div>
            ) : !refinedMarkdown ? (
              <div className="flex-grow flex flex-col items-center justify-center p-8 text-slate-500 text-center">
                <BookOpen className="h-10 w-10 text-slate-700 mb-4" />
                <h3 className="font-semibold text-slate-300 mb-1">Refined Outputs Panel</h3>
                <p className="text-xs max-w-xs leading-relaxed">
                  Enter study notes on the left scratchpad and click the "Refine" button. Outputs will populate here instantly.
                </p>
              </div>
            ) : (
              <div className="flex flex-col flex-grow">
                {/* Panel Navigation Tabs */}
                <div className="border-b border-slate-850 bg-slate-950/40 p-2 flex items-center justify-between">
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setActiveTab("markdown")}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                        activeTab === "markdown"
                          ? "bg-slate-850 text-white border border-slate-700/50"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <BookOpen className="h-3.5 w-3.5" />
                      <span>Markdown Blog</span>
                    </button>
                    <button
                      onClick={() => setActiveTab("twitter")}
                      className={`px-4 py-2 rounded-xl text-xs font-semibold transition flex items-center space-x-1.5 ${
                        activeTab === "twitter"
                          ? "bg-slate-850 text-white border border-slate-700/50"
                          : "text-slate-400 hover:text-white"
                      }`}
                    >
                      <Twitter className="h-3.5 w-3.5" />
                      <span>X/Twitter Thread</span>
                    </button>
                  </div>

                  {activeTab === "markdown" && (
                    <button
                      onClick={handleCopyMarkdown}
                      className="border border-slate-800 hover:bg-slate-850 text-slate-400 hover:text-white px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1"
                    >
                      {copiedMd ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy Markdown</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {/* Tab content area */}
                <div className="flex-grow p-6 overflow-y-auto max-h-[600px]">
                  {activeTab === "markdown" ? (
                    <div className="prose prose-invert max-w-none">
                      <ReactMarkdown
                        components={{
                          h1: ({ node, ...props }) => <h1 className="text-2xl font-extrabold text-white border-b border-slate-800 pb-3 mb-4" {...props} />,
                          h2: ({ node, ...props }) => <h2 className="text-xl font-bold text-slate-100 mt-6 mb-3 border-l-4 border-indigo-500 pl-3.5" {...props} />,
                          p: ({ node, ...props }) => <p className="text-slate-300 text-sm leading-relaxed mb-4" {...props} />,
                          ul: ({ node, ...props }) => <ul className="list-disc pl-6 text-slate-300 space-y-1.5 mb-4" {...props} />,
                          code: ({ node, inline, children, ...props }: any) => (
                            <code className="bg-slate-950 px-1 py-0.5 rounded text-xs text-indigo-300 font-mono" {...props}>{children}</code>
                          ),
                          blockquote: ({ node, ...props }) => (
                            <blockquote className="border-l-4 border-indigo-600 bg-indigo-500/5 p-3 rounded-r-xl my-4 text-slate-400 italic text-xs" {...props} />
                          )
                        }}
                      >
                        {refinedMarkdown}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {twitterThread.map((tweet, idx) => (
                        <div key={idx} className="bg-slate-950 border border-slate-850 p-5 rounded-2xl relative group">
                          <span className="absolute top-4 right-4 bg-indigo-500/10 text-indigo-400 text-[10px] font-extrabold px-1.5 py-0.5 rounded">
                            {idx + 1}/{twitterThread.length}
                          </span>
                          
                          <p className="text-slate-300 text-sm leading-relaxed pr-8 whitespace-pre-line">
                            {tweet}
                          </p>

                          <button
                            onClick={() => handleCopyTweet(tweet, idx)}
                            className="absolute bottom-4 right-4 text-slate-600 hover:text-white transition opacity-0 group-hover:opacity-100"
                            title="Copy Tweet"
                          >
                            {copiedTweetIndex === idx ? (
                              <Check className="h-4 w-4 text-emerald-400" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
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
