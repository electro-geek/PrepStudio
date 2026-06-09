"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, signInWithGoogle, isMock } from "../../../lib/firebase";
import { forceTokenRefresh } from "../../../store/authStore";
import { Wordmark } from "../../../components/BrandLogo";
import { ThemePicker } from "../../../components/ThemeToggle";
import { Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all required fields."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setError(""); setLoading(true);
    try {
      await signUp(email, password, name.trim());
      // Re-exchange the now-updated token so the backend stores the real name.
      await forceTokenRefresh();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError(""); setLoading(true);
    try {
      await signInWithGoogle();
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Google sign-in failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen text-foreground flex items-center justify-center px-4 py-16">
      <div className="absolute top-4 right-4 z-20"><ThemePicker /></div>
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/"><Wordmark size="lg" /></Link>
          <h2 className="font-display font-extrabold tracking-tight text-2xl mt-6">Create account</h2>
          <p className="section-label mt-2">New operator intake</p>
        </div>

        {/* Card */}
        <div className="card overflow-hidden shadow-glow">
          <div className="h-1.5 bg-primary" />
          <div className="p-7">
            {isMock && (
              <div className="card bg-panel/60 px-3.5 py-3 mb-5 flex items-start gap-2.5 text-xs">
                <span className="w-2 h-2 rounded-full bg-secondary mt-1 shrink-0" />
                <span className="text-muted"><strong className="font-semibold text-foreground">Dev mode:</strong> Mock authentication active. Any credentials work.</span>
              </div>
            )}
            {error && (
              <div className="rounded-lg viz-error px-3.5 py-3 mb-5 flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSignup} className="space-y-4">
              <div>
                <label className="section-label block mb-2">Full name <span className="text-muted/70">(optional)</span></label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe"
                         className="field w-full pl-10 pr-4 py-3 text-sm" />
                </div>
              </div>
              <div>
                <label className="section-label block mb-2">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
                         className="field w-full pl-10 pr-4 py-3 text-sm" required />
                </div>
              </div>
              <div>
                <label className="section-label block mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters"
                         className="field w-full pl-10 pr-4 py-3 text-sm" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn w-full py-3.5 text-sm disabled:opacity-50">
                {loading ? <div className="flex items-end gap-0.5 h-3.5">{[0, 1, 2].map((i) => <div key={i} className="w-1 h-full bg-current telem-bar" style={{ animationDelay: `${i * 0.12}s` }} />)}</div>
                  : <>Create account <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <div className="flex items-center my-5 gap-4">
              <div className="flex-grow h-px bg-border" />
              <span className="section-label">or</span>
              <div className="flex-grow h-px bg-border" />
            </div>

            <button onClick={handleGoogleSignup} disabled={loading}
                    className="btn-ghost w-full py-3 text-sm disabled:opacity-50">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.24 12.25c0-.64-.06-1.25-.17-1.85H12v3.74h4.63c-.2 1.05-.79 1.94-1.68 2.54l3.92 3.7c2.29-2.11 3.61-5.22 3.61-8.13zM12 22.09c3.05 0 5.86-1.12 7.96-3.05l-3.92-3.7c-1.03.72-2.42 1.2-4.04 1.2-2.94 0-5.43-1.99-6.32-4.67l-3.86 2.14C3.7 18.91 7.55 22.09 12 22.09zM5.68 11.87a6.99 6.99 0 0 1 0-2.11L1.82 7.62a11.096 11.096 0 0 0 0 6.39l3.86-2.14zM12 4.91c1.69 0 3.21.6 4.41 1.58l2.91-2.91C17.48 1.93 14.96 1 12 1 7.55 1 3.7 4.18 1.82 7.62l3.86 2.14C6.57 7.08 9.06 4.91 12 4.91z" />
              </svg>
              Continue with Google
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-muted mt-5 px-2 leading-relaxed">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-foreground hover:text-primary underline underline-offset-2">Terms &amp; Conditions</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-foreground hover:text-primary underline underline-offset-2">Privacy Policy</Link>.
        </p>
        <p className="text-center text-sm text-muted mt-4">
          Have an account?{" "}
          <Link href="/login" className="text-primary hover:text-primary-hover font-semibold">Sign in →</Link>
        </p>
      </div>
    </div>
  );
}
