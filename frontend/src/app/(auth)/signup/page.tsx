"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp, signInWithGoogle, isMock } from "../../../lib/firebase";
import { Sparkles, Mail, Lock, User, AlertCircle, ArrowRight } from "lucide-react";

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
      await signUp(email, password, name);
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
    <div className="relative min-h-screen bg-[#080c14] text-white flex items-center justify-center px-4 py-16 grid-bg overflow-hidden">
      {/* Glow orbs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="bg-gradient-to-tr from-indigo-500 to-blue-500 p-2 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-black text-xl text-white tracking-tight">PrepStudio</span>
          </Link>
          <h2 className="text-2xl font-black text-white mt-6 tracking-tight">Create your account</h2>
          <p className="text-slate-500 text-sm mt-1.5">Start mastering new skills with AI today</p>
        </div>

        {/* Card */}
        <div className="glass rounded-3xl p-7 border border-white/5">
          {isMock && (
            <div className="bg-indigo-500/8 border border-indigo-500/20 rounded-2xl p-3.5 mb-5 flex items-start space-x-2.5 text-xs text-indigo-300">
              <Sparkles className="h-4 w-4 shrink-0 mt-0.5 text-indigo-400" />
              <span><strong>Dev Mode:</strong> Mock authentication is active. Any credentials will work.</span>
            </div>
          )}

          {error && (
            <div className="bg-red-500/8 border border-red-500/20 rounded-2xl p-3.5 mb-5 flex items-start space-x-2.5 text-xs text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Full Name <span className="normal-case text-slate-600">(optional)</span>
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-600" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-white/5 border border-white/8 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500/50 transition"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full py-3.5 rounded-xl font-bold text-sm text-white disabled:opacity-50 flex items-center justify-center space-x-2 mt-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative flex items-center my-5">
            <div className="flex-grow border-t border-white/6" />
            <span className="mx-4 text-slate-600 text-xs font-semibold uppercase tracking-widest">or</span>
            <div className="flex-grow border-t border-white/6" />
          </div>

          <button
            onClick={handleGoogleSignup}
            disabled={loading}
            className="w-full bg-white/5 hover:bg-white/10 border border-white/8 text-slate-300 hover:text-white rounded-xl py-3 font-semibold text-sm flex items-center justify-center space-x-2.5 transition-all duration-200 disabled:opacity-50"
          >
            <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0 1 12 4.909c1.69 0 3.218.6 4.418 1.582l2.91-2.91C17.482 1.932 14.96 1 12 1 7.314 1 3.293 3.69 1.398 7.623l3.868 2.142z"/>
              <path fill="#4285F4" d="M16.04 15.34C15.01 16.06 13.62 16.54 12 16.54c-2.94 0-5.43-1.99-6.32-4.67l-3.86 2.14C3.7 18.91 7.55 22.09 12 22.09c3.05 0 5.86-1.12 7.96-3.05l-3.92-3.7z"/>
              <path fill="#FBBC05" d="M5.68 11.87a6.99 6.99 0 0 1 0-2.11L1.82 7.62a11.096 11.096 0 0 0 0 6.39l3.86-2.14z"/>
              <path fill="#34A853" d="M20.24 12.25c0-.64-.06-1.25-.17-1.85H12v3.74h4.63c-.2 1.05-.79 1.94-1.68 2.54l3.92 3.7c2.29-2.11 3.61-5.22 3.61-8.13z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        <p className="text-center text-sm text-slate-600 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
