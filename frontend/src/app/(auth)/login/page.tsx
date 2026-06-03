"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn, signInWithGoogle, isMock } from "../../../lib/firebase";
import { Wordmark } from "../../../components/BrandLogo";
import { ThemeToggle } from "../../../components/ThemeToggle";
import { Mail, Lock, AlertCircle, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError("Please fill in all fields."); return; }
    setError(""); setLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Login failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
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
    <div className="relative min-h-screen bg-paper text-ink flex items-center justify-center px-4 py-16 blueprint">
      <div className="absolute top-4 right-4 z-20"><ThemeToggle className="!p-2" /></div>
      <div className="relative z-10 w-full max-w-[440px]">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/"><Wordmark size="lg" /></Link>
          <div className="w-full h-[2px] bg-ink my-6" />
          <h2 className="macro text-2xl">WELCOME BACK</h2>
          <p className="mono-label-sm text-ink-500 mt-2">[ OPERATOR SIGN-IN ]</p>
        </div>

        {/* Card */}
        <div className="panel">
          <div className="hazard-stripes h-3" />
          <div className="p-7">
            {isMock && (
              <div className="border-2 border-ink bg-paper-alt px-3.5 py-3 mb-5 flex items-start gap-2.5 text-xs">
                <span className="w-2 h-2 bg-hazard mt-1 shrink-0" />
                <span className="text-ink-700"><strong className="font-mono uppercase">DEV MODE:</strong> Any email and password works via mock authentication.</span>
              </div>
            )}
            {error && (
              <div className="bg-hazard text-paper px-3.5 py-3 mb-5 flex items-start gap-2.5 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" /><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="mono-label-sm text-ink-500 block mb-2">EMAIL ADDRESS</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com"
                         className="field-ind w-full pl-10 pr-4 py-3 text-sm" required />
                </div>
              </div>
              <div>
                <label className="mono-label-sm text-ink-500 block mb-2">PASSWORD</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-ink-400" />
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••"
                         className="field-ind w-full pl-10 pr-4 py-3 text-sm" required />
                </div>
              </div>
              <button type="submit" disabled={loading} className="btn-ind w-full py-3.5 text-xs flex items-center justify-center gap-2 disabled:opacity-50">
                {loading ? <div className="flex items-end gap-0.5 h-3.5">{[0,1,2].map(i=><div key={i} className="w-1 h-full bg-paper telem-bar" style={{animationDelay:`${i*0.12}s`}}/>)}</div>
                         : <>SIGN IN <ArrowRight className="h-4 w-4" /></>}
              </button>
            </form>

            <div className="flex items-center my-5 gap-4">
              <div className="flex-grow h-[1.5px] bg-ink" />
              <span className="mono-label-sm text-ink-400">OR</span>
              <div className="flex-grow h-[1.5px] bg-ink" />
            </div>

            <button onClick={handleGoogleLogin} disabled={loading}
                    className="btn-outline w-full py-3 text-xs flex items-center justify-center gap-2.5 disabled:opacity-50">
              <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                <path fill="currentColor" d="M20.24 12.25c0-.64-.06-1.25-.17-1.85H12v3.74h4.63c-.2 1.05-.79 1.94-1.68 2.54l3.92 3.7c2.29-2.11 3.61-5.22 3.61-8.13zM12 22.09c3.05 0 5.86-1.12 7.96-3.05l-3.92-3.7c-1.03.72-2.42 1.2-4.04 1.2-2.94 0-5.43-1.99-6.32-4.67l-3.86 2.14C3.7 18.91 7.55 22.09 12 22.09zM5.68 11.87a6.99 6.99 0 0 1 0-2.11L1.82 7.62a11.096 11.096 0 0 0 0 6.39l3.86-2.14zM12 4.91c1.69 0 3.21.6 4.41 1.58l2.91-2.91C17.48 1.93 14.96 1 12 1 7.55 1 3.7 4.18 1.82 7.62l3.86 2.14C6.57 7.08 9.06 4.91 12 4.91z"/>
              </svg>
              CONTINUE WITH GOOGLE
            </button>
          </div>
        </div>

        <p className="text-center mono-label-sm text-ink-400 mt-5 px-2 leading-relaxed normal-case tracking-normal">
          By continuing you agree to our{" "}
          <Link href="/terms" className="text-ink-700 hover:text-hazard underline underline-offset-2">Terms &amp; Conditions</Link>{" "}
          and{" "}
          <Link href="/privacy" className="text-ink-700 hover:text-hazard underline underline-offset-2">Privacy Policy</Link>.
        </p>
        <p className="text-center mono-label-sm text-ink-500 mt-4">
          NO ACCOUNT?{" "}
          <Link href="/signup" className="text-hazard hover:text-ink font-semibold">SIGN UP →</Link>
        </p>
      </div>
    </div>
  );
}
