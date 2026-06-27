"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthGuard from "../../../components/auth/AuthGuard";
import { Wordmark } from "../../../components/BrandLogo";
import { ThemePicker } from "../../../components/ThemeToggle";
import api from "../../../lib/api";
import { ArrowLeft, Network, AlertCircle } from "lucide-react";

export default function NewSystemDesignTrack() {
  const [days, setDays] = useState("7");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(days);
    if (isNaN(parsed) || parsed < 1 || parsed > 30) {
      setError("Enter a whole number of days between 1 and 30.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/system-design/tracks", { total_days: parsed });
      router.push(`/system-design/${res.data.id}`);
    } catch (e: any) {
      setError(e?.response?.data?.detail || "Failed to build the system design track. Try again.");
      setLoading(false);
    }
  };

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col text-foreground">
        <header className="nav-glass px-5 md:px-8 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="btn-ghost !p-2" title="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Wordmark size="sm" />
          <span className="section-label hidden sm:inline ml-2 border-l border-border pl-4">
            System design / intake
          </span>
          <div className="ml-auto"><ThemePicker /></div>
        </header>

        <main className="flex-grow max-w-xl w-full mx-auto px-5 py-12 flex flex-col justify-center">
          <p className="section-label text-primary mb-3">System design practice</p>
          <h1 className="font-display font-extrabold tracking-tight text-[clamp(2rem,5vw,3rem)] mb-4">
            Design under pressure
          </h1>
          <p className="text-muted text-sm leading-relaxed mb-9 max-w-md">
            Choose a study window. Gemini lays out a ladder of real product
            design challenges — easy to hard — across your days. Each one lets
            you spell out requirements, upload your architecture diagram, and
            get scored on both HLD and LLD.
          </p>

          {error && (
            <div className="viz-error px-4 py-3 flex items-center gap-2 text-sm mb-5 rounded-lg">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="card p-6 space-y-5">
            <div>
              <label className="section-label block mb-2">Study window (days)</label>
              <input
                type="number"
                min={1}
                max={30}
                value={days}
                onChange={(e) => setDays(e.target.value)}
                disabled={loading}
                className="field w-full px-4 py-3 text-sm disabled:opacity-50"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn w-full py-3.5 text-sm disabled:opacity-50"
            >
              <Network className="h-4 w-4" />
              {loading ? "Building challenge ladder…" : "Generate challenges"}
            </button>
          </form>
        </main>
      </div>
    </AuthGuard>
  );
}
