"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../../../components/auth/AuthGuard";
import { Wordmark } from "../../../../../components/BrandLogo";
import { ThemePicker } from "../../../../../components/ThemeToggle";
import MermaidDiagram from "../../../../../components/MermaidDiagram";
import api from "../../../../../lib/api";
import ReactMarkdown from "react-markdown";
import {
  ArrowLeft, AlertCircle, ImagePlus, X, Sparkles, Eye, Loader2,
  CheckCircle2, XCircle,
} from "lucide-react";

const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // 4MB

const md = {
  h1: (p: any) => <h1 className="font-display font-extrabold text-2xl border-b border-border pb-2 mb-4" {...p} />,
  h2: (p: any) => <h2 className="font-display font-bold text-xl mt-6 mb-3 border-l-2 border-primary pl-3" {...p} />,
  h3: (p: any) => <h3 className="font-display font-bold text-base mt-4 mb-2" {...p} />,
  p: (p: any) => <p className="text-foreground/90 text-sm leading-relaxed mb-3" {...p} />,
  ul: (p: any) => <ul className="list-disc pl-5 text-foreground/90 text-sm space-y-1 mb-3" {...p} />,
  ol: (p: any) => <ol className="list-decimal pl-5 text-foreground/90 text-sm space-y-1 mb-3" {...p} />,
  code: ({ inline, className, children, ...props }: any) => {
    const text = String(children ?? "");
    if (!inline && /language-mermaid/.test(className || "")) {
      return <MermaidDiagram chart={text} />;
    }
    if (inline) {
      return <code className="bg-panel px-1.5 py-0.5 rounded text-[13px] text-secondary border border-border font-mono" {...props}>{children}</code>;
    }
    return (
      <pre className="term-surface p-4 my-4 overflow-x-auto text-xs font-mono leading-relaxed">
        <code {...props}>{children}</code>
      </pre>
    );
  },
};

function ScorePill({ label, value }: { label: string; value: number }) {
  const tone = value >= 80 ? "text-secondary" : value >= 60 ? "text-primary" : "text-secondary";
  return (
    <div className="card px-4 py-3 text-center">
      <div className={`font-display font-extrabold text-2xl ${tone}`}>{value}</div>
      <div className="section-label mt-1">{label}</div>
    </div>
  );
}

function FeedbackBlock({ title, data }: { title: string; data: any }) {
  if (!data) return null;
  return (
    <div className="card p-5">
      <h4 className="font-display font-bold text-base mb-3">{title}</h4>
      {data.covered?.length > 0 && (
        <ul className="space-y-1.5 mb-3">
          {data.covered.map((s: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-foreground/90">
              <CheckCircle2 className="h-4 w-4 text-secondary shrink-0 mt-0.5" /> {s}
            </li>
          ))}
        </ul>
      )}
      {data.missing?.length > 0 && (
        <ul className="space-y-1.5">
          {data.missing.map((s: string, i: number) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted">
              <XCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" /> {s}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ImageUpload({
  label, value, onChange,
}: { label: string; value: string | null; onChange: (v: string | null) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");

  const handleFile = (file?: File) => {
    setErr("");
    if (!file) return;
    if (!file.type.startsWith("image/")) { setErr("Please upload an image file."); return; }
    if (file.size > MAX_IMAGE_BYTES) { setErr("Image too large (max 4MB)."); return; }
    const reader = new FileReader();
    reader.onload = () => onChange(reader.result as string);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="section-label block mb-2">{label}</label>
      {value ? (
        <div className="relative card overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="diagram" className="w-full max-h-72 object-contain bg-panel" />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute top-2 right-2 btn-secondary !p-1.5"
            title="Remove"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="card card-hover w-full py-8 flex flex-col items-center justify-center gap-2 text-muted"
        >
          <ImagePlus className="h-6 w-6" />
          <span className="text-sm">Click to upload diagram (PNG/JPG, max 4MB)</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      {err && <p className="text-xs text-secondary mt-1.5">{err}</p>}
    </div>
  );
}

export default function ChallengeWorkspace() {
  const { trackId, challengeId } = useParams();

  const [challenge, setChallenge] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [functional, setFunctional] = useState("");
  const [nonfunctional, setNonfunctional] = useState("");
  const [hldImage, setHldImage] = useState<string | null>(null);
  const [hldNotes, setHldNotes] = useState("");
  const [lldText, setLldText] = useState("");
  const [lldImage, setLldImage] = useState<string | null>(null);

  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<any>(null);

  const [revealing, setRevealing] = useState(false);
  const [solution, setSolution] = useState<any>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/system-design/challenges/${challengeId}`);
        setChallenge(res.data);
        const s = res.data.submission;
        if (s) {
          setFunctional(s.functional_reqs || "");
          setNonfunctional(s.nonfunctional_reqs || "");
          setHldImage(s.hld_image || null);
          setHldNotes(s.hld_notes || "");
          setLldText(s.lld_text || "");
          setLldImage(s.lld_image || null);
          if (s.evaluation) setEvaluation(s.evaluation);
        }
      } catch {
        setError("Failed to load this challenge.");
      } finally {
        setLoading(false);
      }
    }
    if (challengeId) load();
  }, [challengeId]);

  const handleEvaluate = async () => {
    setEvaluating(true);
    setError("");
    try {
      const res = await api.post(`/system-design/challenges/${challengeId}/evaluate`, {
        functional_reqs: functional,
        nonfunctional_reqs: nonfunctional,
        hld_image: hldImage,
        hld_notes: hldNotes,
        lld_text: lldText,
        lld_image: lldImage,
      });
      setEvaluation(res.data);
      document.getElementById("sd-results")?.scrollIntoView({ behavior: "smooth" });
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Evaluation failed. Try again.");
    } finally {
      setEvaluating(false);
    }
  };

  const handleReveal = async () => {
    setRevealing(true);
    setError("");
    try {
      const res = await api.get(`/system-design/challenges/${challengeId}/solution`);
      setSolution(res.data);
      setTimeout(() => document.getElementById("sd-solution")?.scrollIntoView({ behavior: "smooth" }), 50);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Could not load the model answer.");
    } finally {
      setRevealing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!challenge) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 text-center">
        <div className="card px-8 py-8 max-w-md">
          <p className="section-label text-secondary mb-3">Not found</p>
          <p className="text-muted text-sm mb-5">{error || "Challenge unavailable."}</p>
          <Link href={`/system-design/${trackId}`} className="btn px-6 py-3 text-sm inline-flex">Back to track</Link>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen text-foreground flex flex-col">
        <header className="nav-glass px-5 md:px-8 h-14 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <Link href={`/system-design/${trackId}`} className="btn-ghost !p-2 shrink-0" title="Back">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="min-w-0 border-l border-border pl-4">
              <h1 className="font-display font-bold text-sm leading-tight truncate">{challenge.product}</h1>
              <p className="section-label mt-0.5 capitalize">{challenge.difficulty} · system design</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ThemePicker />
            <Wordmark size="sm" />
          </div>
        </header>

        <main className="max-w-3xl w-full mx-auto px-5 md:px-8 py-8 flex-grow space-y-6">
          {/* Prompt */}
          <div className="card p-5">
            <p className="section-label text-primary mb-2">The brief</p>
            <p className="text-foreground/90 text-sm leading-relaxed">{challenge.prompt}</p>
          </div>

          {error && (
            <div className="viz-error px-4 py-3 flex items-center gap-2 text-sm rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" /> <span>{error}</span>
            </div>
          )}

          {/* Requirements */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="section-label block mb-2">Functional requirements</label>
              <textarea
                value={functional}
                onChange={(e) => setFunctional(e.target.value)}
                rows={5}
                placeholder="What the system must do — core features, user flows…"
                className="field w-full px-3 py-2.5 text-sm resize-y"
              />
            </div>
            <div>
              <label className="section-label block mb-2">Non-functional requirements</label>
              <textarea
                value={nonfunctional}
                onChange={(e) => setNonfunctional(e.target.value)}
                rows={5}
                placeholder="Scale, latency, availability, consistency, security…"
                className="field w-full px-3 py-2.5 text-sm resize-y"
              />
            </div>
          </div>

          {/* HLD */}
          <div className="card p-5 space-y-4">
            <p className="section-label text-primary">High-level design (HLD)</p>
            <ImageUpload label="Architecture diagram" value={hldImage} onChange={setHldImage} />
            <div>
              <label className="section-label block mb-2">HLD notes (optional)</label>
              <textarea
                value={hldNotes}
                onChange={(e) => setHldNotes(e.target.value)}
                rows={3}
                placeholder="Explain components, data flow, scaling, caching, storage choices…"
                className="field w-full px-3 py-2.5 text-sm resize-y"
              />
            </div>
          </div>

          {/* LLD */}
          <div className="card p-5 space-y-4">
            <p className="section-label text-primary">Low-level design (LLD)</p>
            <textarea
              value={lldText}
              onChange={(e) => setLldText(e.target.value)}
              rows={6}
              placeholder="API contracts, database schema, key classes / data structures…"
              className="field w-full px-3 py-2.5 text-sm resize-y font-mono"
            />
            <ImageUpload label="Class/schema diagram (optional)" value={lldImage} onChange={setLldImage} />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleEvaluate}
              disabled={evaluating}
              className="btn flex-1 py-3.5 text-sm disabled:opacity-50"
            >
              {evaluating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {evaluating ? "Evaluating your design…" : "Evaluate my design"}
            </button>
            <button
              onClick={handleReveal}
              disabled={revealing}
              className="btn-ghost flex-1 py-3.5 text-sm disabled:opacity-50"
            >
              {revealing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Eye className="h-4 w-4" />}
              {revealing ? "Loading answer…" : "Reveal model answer"}
            </button>
          </div>

          {/* Results */}
          {evaluation && (
            <div id="sd-results" className="space-y-5 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <h2 className="font-display font-extrabold text-2xl">Evaluation</h2>
                <span className="badge-primary">{evaluation.overall_grade}</span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <ScorePill label="Overall" value={evaluation.overall_score} />
                <ScorePill label="Requirements" value={evaluation.requirements_score} />
                <ScorePill label="HLD" value={evaluation.hld_score} />
                <ScorePill label="LLD" value={evaluation.lld_score} />
              </div>

              <div className="card p-5">
                <p className="text-foreground/90 text-sm leading-relaxed">{evaluation.summary}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <FeedbackBlock title="Requirements" data={evaluation.requirements_feedback} />
                <FeedbackBlock title="High-Level Design" data={evaluation.hld_feedback} />
                <FeedbackBlock title="Low-Level Design" data={evaluation.lld_feedback} />
              </div>

              {evaluation.model_diagram_mermaid && (
                <div className="card p-5">
                  <p className="section-label text-primary mb-3">Reference architecture</p>
                  <MermaidDiagram chart={evaluation.model_diagram_mermaid} />
                </div>
              )}

              {evaluation.model_answer_markdown && (
                <div className="card p-6">
                  <ReactMarkdown components={md as any}>{evaluation.model_answer_markdown}</ReactMarkdown>
                </div>
              )}
            </div>
          )}

          {/* Reveal-only solution */}
          {solution && (
            <div id="sd-solution" className="space-y-5 pt-4 border-t border-border">
              <h2 className="font-display font-extrabold text-2xl">Model answer</h2>
              {solution.model_diagram_mermaid && (
                <div className="card p-5">
                  <p className="section-label text-primary mb-3">Reference architecture</p>
                  <MermaidDiagram chart={solution.model_diagram_mermaid} />
                </div>
              )}
              <div className="card p-6">
                <ReactMarkdown components={md as any}>{solution.model_answer_markdown}</ReactMarkdown>
              </div>
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
