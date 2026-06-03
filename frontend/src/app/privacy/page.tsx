import Link from "next/link";
import { Wordmark } from "../../components/BrandLogo";
import { ThemeToggle } from "../../components/ThemeToggle";

export const metadata = {
  title: "Privacy Policy — PrepStudio",
  description: "How PrepStudio collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  const lastUpdated = "May 28, 2025";

  return (
    <div className="min-h-screen bg-paper text-ink blueprint">
      {/* Nav */}
      <nav className="border-b-2 border-ink bg-paper px-5 md:px-8 h-14 flex items-center sticky top-0 z-30">
        <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
          <Link href="/"><Wordmark size="sm" /></Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="mono-label-sm text-ink-500 hover:text-hazard transition-colors">
              ← BACK TO HOME
            </Link>
            <ThemeToggle className="!p-2" />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-16">
        <div className="mb-12 border-b-2 border-ink pb-8">
          <span className="mono-label text-hazard block mb-4">[ LEGAL / DOC-PRIV ]</span>
          <h1 className="macro text-[clamp(2.4rem,5vw,4rem)] mb-3">PRIVACY POLICY</h1>
          <p className="mono-label-sm text-ink-500">LAST UPDATED / {lastUpdated.toUpperCase()}</p>
        </div>

        <div className="space-y-10 text-ink-700 leading-relaxed">

          <section>
            <p>
              PrepStudio (&ldquo;we&rdquo;, &ldquo;our&rdquo;, or &ldquo;us&rdquo;) is operated by Mritunjay Pandey and is accessible at{" "}
              <span className="text-hazard">prepstudio.mritunjay.live</span>. This Privacy Policy explains what
              information we collect when you use PrepStudio, how we use it, and the choices you have. By using our
              platform you agree to the practices described here.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">1. Information We Collect</h2>
            <h3 className="font-display font-bold uppercase tracking-tight text-base text-ink mb-2">Account Information</h3>
            <p className="mb-4">
              When you create an account we collect your name (optional), email address, and a hashed password if you
              register with email and password. If you sign in with Google we receive your name, email address, and
              profile picture from Google&rsquo;s OAuth service.
            </p>
            <h3 className="font-display font-bold uppercase tracking-tight text-base text-ink mb-2">Content You Create</h3>
            <p className="mb-4">
              We store the study plans, topics, notes, and blog drafts you generate inside the platform so you can
              access them across sessions.
            </p>
            <h3 className="font-display font-bold uppercase tracking-tight text-base text-ink mb-2">Voice &amp; Audio Data</h3>
            <p className="mb-4">
              When you use voice features (AI audio lessons or voice mock interviews) your microphone input is
              streamed to ElevenLabs&rsquo; servers for real-time speech processing. We do not permanently store raw
              audio recordings on our own servers. ElevenLabs&rsquo; privacy policy governs the handling of that audio
              stream.
            </p>
            <h3 className="font-display font-bold uppercase tracking-tight text-base text-ink mb-2">Usage Data</h3>
            <p>
              We collect standard server logs including IP addresses, browser type, pages visited, and timestamps.
              This data helps us diagnose bugs, monitor performance, and understand how the platform is used.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 text-ink-700">
              <li>Provide, operate, and improve the PrepStudio service.</li>
              <li>Personalise your learning experience and generate AI-powered study plans.</li>
              <li>Authenticate your identity and keep your account secure.</li>
              <li>Send transactional emails (e.g. password resets) — we do not send marketing emails without your consent.</li>
              <li>Analyse aggregate usage patterns to improve features.</li>
              <li>Comply with legal obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">3. Third-Party Services</h2>
            <p className="mb-4">PrepStudio integrates with the following third-party services. Each has its own privacy policy:</p>
            <div className="space-y-3">
              {[
                { name: "Google Firebase & Google OAuth", use: "Authentication and account management." },
                { name: "ElevenLabs", use: "Real-time voice synthesis and speech recognition for audio lessons and mock interviews." },
                { name: "Google Gemini AI", use: "Generating study plans, articles, and interview questions." },
              ].map(({ name, use }) => (
                <div key={name} className="panel px-4 py-3">
                  <p className="text-sm font-semibold text-ink">{name}</p>
                  <p className="text-sm text-ink-500 mt-0.5">{use}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-sm text-ink-500">
              We are not responsible for the privacy practices of these third parties. We encourage you to review
              their policies before using their features.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">4. Data Retention</h2>
            <p>
              We retain your account data and study content for as long as your account is active. If you delete your
              account, we will delete your personal data within 30 days, except where we are required to retain it by
              law. Anonymised aggregate usage statistics may be retained indefinitely.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">5. Data Security</h2>
            <p>
              We use industry-standard measures including HTTPS encryption, Firebase&rsquo;s secure infrastructure,
              and hashed credentials to protect your data. No method of transmission over the internet is 100% secure,
              and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">6. Your Rights</h2>
            <p className="mb-3">Depending on your location you may have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-ink-700">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and associated data.</li>
              <li>Object to or restrict certain processing.</li>
              <li>Data portability — receive your data in a machine-readable format.</li>
            </ul>
            <p className="mt-3">
              To exercise any of these rights, email us at{" "}
              <span className="text-hazard">mritunjaypandey0789@gmail.com</span>. We will respond within 30 days.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">7. Children&rsquo;s Privacy</h2>
            <p>
              PrepStudio is not directed at children under the age of 13. We do not knowingly collect personal
              information from children under 13. If you believe we have inadvertently collected such information,
              please contact us and we will delete it promptly.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">8. Changes to This Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we do, we will revise the &ldquo;Last updated&rdquo;
              date at the top of this page. Continued use of PrepStudio after changes are posted constitutes your
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">9. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy, please reach out:
            </p>
            <div className="mt-3 panel px-5 py-4 text-sm">
              <p className="text-ink font-semibold">Mritunjay Pandey</p>
              <p className="text-ink-500 mt-1">Email: mritunjaypandey0789@gmail.com</p>
              <p className="text-ink-500">Website: prepstudio.mritunjay.live</p>
            </div>
          </section>
        </div>

        <div className="mt-16 pt-8 border-t border-ink flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-ink-400">
          <p>&copy; {new Date().getFullYear()} PrepStudio. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-hazard transition-colors">Terms &amp; Conditions</Link>
            <Link href="/" className="hover:text-hazard transition-colors">Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
