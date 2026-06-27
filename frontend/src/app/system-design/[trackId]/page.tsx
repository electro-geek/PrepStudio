"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import AuthGuard from "../../../components/auth/AuthGuard";
import { Wordmark } from "../../../components/BrandLogo";
import { ThemePicker } from "../../../components/ThemeToggle";
import api from "../../../lib/api";
import { ArrowLeft, ChevronRight, CheckCircle2 } from "lucide-react";

const DIFF_BADGE: Record<string, string> = {
  easy: "badge-secondary",
  medium: "badge",
  hard: "badge-primary",
};

export default function SystemDesignTrack() {
  const { trackId } = useParams();
  const [track, setTrack] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get(`/system-design/tracks/${trackId}`);
        setTrack(res.data);
      } catch {
        setError("Failed to load this track.");
      } finally {
        setLoading(false);
      }
    }
    if (trackId) load();
  }, [trackId]);

  // Group challenges by day_number, preserving server order.
  const byDay: Record<number, any[]> = {};
  (track?.challenges || []).forEach((c: any) => {
    (byDay[c.day_number] ||= []).push(c);
  });
  const days = Object.keys(byDay).map(Number).sort((a, b) => a - b);
  const total = track?.challenges?.length || 0;
  const done = (track?.challenges || []).filter((c: any) => c.is_complete).length;

  return (
    <AuthGuard>
      <div className="min-h-screen flex flex-col text-foreground">
        <header className="nav-glass px-5 md:px-8 h-14 flex items-center gap-4">
          <Link href="/dashboard" className="btn-ghost !p-2" title="Back">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <Wordmark size="sm" />
          <span className="section-label hidden sm:inline ml-2 border-l border-border pl-4">
            System design track
          </span>
          <div className="ml-auto"><ThemePicker /></div>
        </header>

        <div className="border-b border-border">
          <div className="max-w-[1100px] w-full mx-auto px-5 md:px-8 py-12 flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <p className="section-label text-primary mb-3">Practice ladder</p>
              <h1 className="font-display font-extrabold tracking-tight text-[clamp(2rem,5vw,3.2rem)]">
                System design
              </h1>
            </div>
            <span className="section-label">
              {loading ? "Loading…" : `${done} / ${total} solved · ${track?.total_days}d`}
            </span>
          </div>
        </div>

        <main className="flex-grow max-w-[1100px] w-full mx-auto px-5 md:px-8 py-8">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => <div key={i} className="card h-24 ind-pulse" />)}
            </div>
          ) : error ? (
            <p className="text-muted text-sm">{error}</p>
          ) : (
            <div className="space-y-10">
              {days.map((day) => (
                <section key={day}>
                  <div className="flex items-center gap-3 mb-4">
                    <span className="section-label text-primary">Day {String(day).padStart(2, "0")}</span>
                    <div className="h-px flex-grow bg-border" />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {byDay[day].map((c: any) => (
                      <Link
                        key={c.id}
                        href={`/system-design/${trackId}/challenge/${c.id}`}
                        className="group card card-hover px-5 py-5 flex flex-col justify-between"
                      >
                        <div className="flex items-start justify-between mb-4 gap-3">
                          <h3 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors">
                            {c.product}
                          </h3>
                          <span className={`${DIFF_BADGE[c.difficulty] || "badge"} shrink-0 capitalize`}>
                            {c.difficulty}
                          </span>
                        </div>
                        <p className="text-muted text-sm leading-relaxed line-clamp-2 mb-4">
                          {c.prompt}
                        </p>
                        <div className="flex items-center justify-between">
                          {c.is_complete ? (
                            <span className="section-label text-secondary flex items-center gap-1.5">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Solved
                            </span>
                          ) : (
                            <span className="section-label">Not started</span>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted group-hover:text-primary transition-colors" />
                        </div>
                      </Link>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          )}
        </main>
      </div>
    </AuthGuard>
  );
}
