import Link from "next/link";
import { Sparkles } from "lucide-react";

export const metadata = {
  title: "Privacy Policy — PrepStudio",
  description: "How PrepStudio collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "May 28, 2025";

  return (
    <div className="min-h-screen bg-[#080c14] text-white">
      {/* Nav */}
      <nav className="border-b border-white/5 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="inline-flex items-center space-x-2.5 group">
            <div className="bg-gradient-to-tr from-indigo-500 to-blue-500 p-2 rounded-xl shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="font-black text-lg text-white tracking-tight">PrepStudio</span>
          </Link>
          <Link href="/" className="text-slate-500 hover:text-white text-sm transition-colors">
            ← Back to home
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tight mb-3">Privacy Policy</h1>
          <p className="text-slate-500 text-sm">Last updated: {lastUpdated}</p>
        </div>

        <div className="prose-dark space-y-10 text-slate-300 leading-relaxed">

          <section>
            <p>
              PrepStudio (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is operated by Mritunjay Pandey and is accessible at{" "}
              <span className="text-indigo-400">prepstudio.mritunjay.live</span>. This Privacy Policy explains what
              information we collect when you use PrepStudio, how we use it, and the choices you have. By using our
              platform you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
            <h3 className="text-base font-semibold text-slate-200 mb-2">Account Information</h3>
            <p className="mb-4">
              When you create an account we collect your name (optional), email address, and a hashed password if you
              register with email and password. If you sign in with Google we receive your name, email address, and
              profile picture from Google&rsquo;s OAuth service.
            </p>
            <h3 className="text-base font-semibold text-slate-200 mb-2">Content You Create</h3>
            <p className="mb-4">
              We store the study plans, topics, notes, and blog drafts you generate inside the platform so you can
              access them across sessions.
            </p>
            <h3 className="text-base font-semibold text-slate-200 mb-2">Voice &amp; Audio Data</h3>
            <p className="mb-4">
              When you use voice features (AI audio lessons or voice mock interviews) your microphone input is
              streamed to ElevenLabs&rsquo; servers for real-time speech processing. We do not permanently store raw
              audio recordings on our own servers. ElevenLabs&rsquo; privacy policy governs the handling of that audio
              stream.
            </p>
            <h3 className="text-base font-semibold text-slate-200 mb-2">Usage Data</h3>
            <p>
              We collect standard server logs including IP addresses, browser type, pages visited, and timestamps.
              This data helps us diagnose bugs, monitor performance, and understand how the platform is used.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Provide, operate, and improve the PrepStudio service.</li>
              <li>Personalise your learning experience and generate AI-powered study plans.</li>
              <li>Authenticate your identity and keep your account secure.</li>
              <li>Send transactional emails (e.g. password resets) — we do not send marketing emails without your consent.</li>
              <li>Analyse aggregate usage patterns to improve features.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">3. Third-Party Services</h2>
            <p className="mb-4">PrepStudio integrates with the following third-party services. Each has its own privacy policy:</p>
            <div className="space-y-3">
              {[
                { name: "Google Firebase & Google OAuth", use: "Authentication and account management." },
                { name: "ElevenLabs", use: "Real-time voice synthesis and speech recognition for audio lessons and mock interviews." },
                { name: "Google Gemini AI", use: "Generating study plans, articles, and interview questions." },
              ].map(({ name, use }) => (
                <div key={name} className="bg-white/4 border border-white/6 rounded-xl px-4 py-3">
                  <p className="text-sm font-semibold text-slate-200">{name}</p>
                  <p className="text-sm text-slate-500 mt-0.5">{use}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-slate-500">
              We are not responsible for the privacy practices of these third parties. We encourage you to review
              their policies before using their features.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">4. Data Retention</h2>
            <p>
              We retain your account data and study content for as long as your account is active. If you delete your
              account, we will delete your personal data within 30 days, except where we are required to retain it by
              law. Anonymised aggregate usage statistics may be retained indefinitely.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">5. Data Security</h2>
            <p>
              We use industry-standard measures including HTTPS encryption, Firebase&rsquo;s secure infrastructure,
              and hashed credentials to protect your data. No method of transmission over the internet is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">6. Your Rights</h2>
            <p className="mb-3">Depending on your location you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-300">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Object to or restrict certain processing.</li>
              <li>Data portability — receive your data in a machine-readable format.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <span className="text-indigo-400">mritunjaypandey0789@gmail.com</span>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">7. Children&rsquo;s Privacy</h2>
            <p>
              PrepStudio is not directed at children under the age of 13. We do not knowingly collect personal
              information from children under 13. If you believe we have inadvertently collected such information,
              please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last updated&rdquo;
              date at the top of this page. Continued use of PrepStudio after changes are posted constitutes your
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-white mb-3">9. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please reach out:
            </p>
            <div className="mt-3 bg-white/4 border border-white/6 rounded-xl px-5 py-4 text-sm">
              <p className="text-slate-200 font-semibold">Mritunjay Pandey</p>
              <p className="text-slate-500 mt-1">Email: mritunjaypandey0789@gmail.com</p>
              <p className="text-slate-500">Website: prepstudio.mritunjay.live</p>
            </div>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-white/6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-600">
          <p>&copy; {new Date().getFullYear()} PrepStudio. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-slate-400 transition-colors">Terms &amp; Conditions</Link>
            <Link href="/" className="hover:text-slate-400 transition-colors">Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
