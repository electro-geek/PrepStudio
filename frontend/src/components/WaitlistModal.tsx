"use client";

import { useEffect, useState } from "react";
import { Sparkles, Headphones, X, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import api from "@/lib/api";
import { useAuthStore } from "@/store/authStore";

interface WaitlistModalProps {
  open: boolean;
  onClose: () => void;
  feature?: string;
  featureLabel?: string;
}

export default function WaitlistModal({
  open,
  onClose,
  feature = "audio_lesson",
  featureLabel = "Audio lessons",
}: WaitlistModalProps) {
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  // Pre-fill from the signed-in profile each time the modal opens.
  useEffect(() => {
    if (open) {
      setName(user?.displayName || "");
      setEmail(user?.email || "");
      setError("");
      setJoined(false);
      setAlreadyJoined(false);
    }
  }, [open, user]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setError("Please enter an email so we can reach you.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const res = await api.post("/waitlist", {
        email: email.trim(),
        name: name.trim() || undefined,
        feature,
      });
      setAlreadyJoined(Boolean(res.data?.already_joined));
      setJoined(true);
    } catch (err: any) {
      setError(err?.response?.data?.detail || "Couldn't join the waitlist. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-5 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="card overflow-hidden w-full max-w-md relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1.5 bg-primary" />
        <button
          onClick={onClose}
          className="absolute top-3 right-3 btn-ghost !p-2"
          title="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {!joined ? (
          <div className="px-7 py-8 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-lg bg-primary/15 text-primary flex items-center justify-center shrink-0">
                <Headphones className="h-5 w-5" />
              </div>
              <div>
                <p className="section-label text-primary flex items-center gap-1.5">
                  <Sparkles className="h-3 w-3" /> Premium feature
                </p>
                <h2 className="font-display font-extrabold tracking-tight text-xl leading-tight">
                  {featureLabel} are coming soon
                </h2>
              </div>
            </div>

            <p className="text-muted text-sm leading-relaxed">
              Voice-guided {featureLabel.toLowerCase()} with an AI tutor are a premium
              capability we&apos;re rolling out gradually. Join the waitlist and we&apos;ll
              email you the moment you get access.
            </p>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="section-label block mb-1.5">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="field w-full px-4 py-2.5 text-sm"
                />
              </div>
              <div>
                <label className="section-label block mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="field w-full px-4 py-2.5 text-sm"
                />
              </div>

              {error && (
                <div className="viz-error rounded-lg px-3 py-2 flex items-center gap-2 text-sm">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn w-full !py-3 text-sm disabled:opacity-50">
                {submitting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {submitting ? "Joining…" : "Join the waitlist"}
              </button>
            </form>
          </div>
        ) : (
          <div className="px-7 py-9 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-primary/15 text-primary flex items-center justify-center mx-auto">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h2 className="font-display font-extrabold tracking-tight text-xl">
              {alreadyJoined ? "You're already on the list" : "You're on the list!"}
            </h2>
            <p className="text-muted text-sm leading-relaxed">
              {alreadyJoined
                ? "We've already got your spot saved. We'll email you the moment access opens up."
                : `Thanks${name ? `, ${name.split(" ")[0]}` : ""}! We'll email ${email} as soon as ${featureLabel.toLowerCase()} are ready for you.`}
            </p>
            <button onClick={onClose} className="btn px-6 py-3 text-sm">Got it</button>
          </div>
        )}
      </div>
    </div>
  );
}
