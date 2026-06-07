import Link from "next/link";
import { Wordmark } from "../../components/BrandLogo";
import { ThemePicker } from "../../components/ThemeToggle";

export const metadata = {
  title: "Terms & Conditions — PrepStudio",
  description: "The terms and conditions governing your use of PrepStudio.",
};

export default function TermsPage() {
  const lastUpdated = "May 28, 2025";

  return (
    <div className="min-h-screen text-foreground">
      {/* Nav */}
      <nav className="nav-glass px-5 md:px-8 h-14 flex items-center">
        <div className="max-w-3xl w-full mx-auto flex items-center justify-between">
          <Link href="/"><Wordmark size="sm" /></Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="section-label hover:text-primary transition-colors">
              ← Back to home
            </Link>
            <ThemePicker />
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-5 md:px-8 py-16">
        <div className="mb-12 border-b border-border pb-8">
          <span className="section-label text-primary block mb-4">Legal / doc-terms</span>
          <h1 className="font-display font-extrabold tracking-tight text-[clamp(2.4rem,5vw,4rem)] mb-3">Terms &amp; Conditions</h1>
          <p className="section-label">Last updated / {lastUpdated}</p>
        </div>

        <div className="space-y-10 text-ink-700 leading-relaxed">

          <section>
            <p>
              Welcome to PrepStudio. These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of
              the PrepStudio platform, operated by Mritunjay Pandey, accessible at{" "}
              <span className="text-hazard">prepstudio.mritunjay.live</span> (the &ldquo;Service&rdquo;). By creating
              an account or using the Service in any way, you agree to be bound by these Terms. If you do not agree,
              do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">1. Eligibility</h2>
            <p>
              You must be at least 13 years old to use PrepStudio. By using the Service you represent and warrant
              that you meet this age requirement. If you are under 18, you represent that your parent or guardian
              has reviewed and agreed to these Terms on your behalf.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">2. Your Account</h2>
            <p className="mb-3">
              You are responsible for maintaining the confidentiality of your account credentials and for all
              activity that occurs under your account. You agree to:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>Provide accurate and current information when creating your account.</li>
              <li>Not share your password or allow others to access your account.</li>
              <li>Notify us immediately at mritunjaypandey0789@gmail.com if you suspect unauthorised access.</li>
            </ul>
            <p className="mt-3">
              We reserve the right to suspend or terminate accounts that violate these Terms.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">3. Acceptable Use</h2>
            <p className="mb-3">You agree not to:</p>
            <ul className="list-disc list-inside space-y-2">
              <li>Use the Service for any unlawful purpose or in violation of any applicable laws.</li>
              <li>Attempt to reverse-engineer, decompile, or extract the source code of the Service.</li>
              <li>Scrape, crawl, or systematically download content from the Service without written permission.</li>
              <li>Use the Service to generate, distribute, or store harmful, abusive, defamatory, or obscene content.</li>
              <li>Circumvent, disable, or interfere with security-related features of the Service.</li>
              <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity.</li>
              <li>Use automated bots or scripts to interact with the Service without our prior written consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">4. AI-Generated Content</h2>
            <p className="mb-3">
              PrepStudio uses AI models (including Google Gemini and ElevenLabs) to generate study plans, articles,
              audio lessons, and interview questions. You acknowledge that:
            </p>
            <ul className="list-disc list-inside space-y-2">
              <li>AI-generated content may occasionally be inaccurate, incomplete, or outdated.</li>
              <li>Content should not be treated as professional advice (legal, financial, medical, or otherwise).</li>
              <li>You are responsible for independently verifying any important information before acting on it.</li>
              <li>We do not guarantee that AI-generated content is free from errors or bias.</li>
            </ul>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">5. Voice Features</h2>
            <p>
              When you use audio lessons or voice mock interviews, your voice input is processed by ElevenLabs in
              real time. By enabling these features you consent to this processing and agree to ElevenLabs&rsquo; terms
              of service. You must not use voice features in a way that violates any applicable wiretapping,
              recording consent, or data protection laws in your jurisdiction.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">6. Intellectual Property</h2>
            <p className="mb-3">
              <strong className="text-ink">Our content:</strong> The PrepStudio name, logo, interface design,
              and underlying code are owned by Mritunjay Pandey and are protected by intellectual property laws.
              You may not copy, modify, or redistribute them without prior written permission.
            </p>
            <p>
              <strong className="text-ink">Your content:</strong> You retain ownership of notes, custom
              inputs, and other content you create. By submitting content to PrepStudio you grant us a limited,
              non-exclusive licence to store and display that content solely to provide the Service to you.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">7. Privacy</h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-hazard hover:text-ink transition-colors">
                Privacy Policy
              </Link>
              , which is incorporated into these Terms by reference.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">8. Disclaimers</h2>
            <p className="mb-3">
              THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND,
              EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW WE DISCLAIM ALL WARRANTIES, INCLUDING BUT
              NOT LIMITED TO:
            </p>
            <ul className="list-disc list-inside space-y-2 uppercase text-sm">
              <li>Merchantability and fitness for a particular purpose.</li>
              <li>Accuracy, reliability, or completeness of AI-generated content.</li>
              <li>Uninterrupted or error-free operation of the Service.</li>
            </ul>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">9. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by applicable law, Mritunjay Pandey and PrepStudio shall not be
              liable for any indirect, incidental, special, consequential, or punitive damages — including loss of
              data, loss of revenue, or loss of business opportunity — arising out of or related to your use of
              the Service, even if advised of the possibility of such damages. Our total liability for any claim
              shall not exceed the amount you paid us (if any) in the 12 months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">10. Third-Party Links &amp; Services</h2>
            <p>
              The Service may contain links to third-party websites or integrate third-party services. We are not
              responsible for the content, privacy practices, or availability of those third-party services. Your
              interactions with them are governed solely by their own terms and policies.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">11. Termination</h2>
            <p>
              We may suspend or terminate your access to the Service at any time, with or without notice, if you
              violate these Terms or if we discontinue the Service. You may terminate your account at any time by
              contacting us. Upon termination, your right to use the Service immediately ceases.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">12. Changes to These Terms</h2>
            <p>
              We reserve the right to modify these Terms at any time. We will notify you of material changes by
              updating the &ldquo;Last updated&rdquo; date. Continued use of the Service after changes are posted
              constitutes your acceptance of the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">13. Governing Law</h2>
            <p>
              These Terms are governed by and construed in accordance with the laws of India. Any disputes arising
              from these Terms shall be subject to the exclusive jurisdiction of the competent courts in India.
            </p>
          </section>

          <section>
            <h2 className="macro text-xl mb-3">14. Contact</h2>
            <p>Questions about these Terms? Reach us at:</p>
            <div className="mt-3 panel px-5 py-4 text-sm">
              <p className="text-ink font-semibold">Mritunjay Pandey</p>
              <p className="text-ink-500 mt-1">Email: mritunjaypandey0789@gmail.com</p>
              <p className="text-ink-500">Website: prepstudio.mritunjay.live</p>
            </div>
          </section>

        </div>

        <div className="mt-16 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} PrepStudio. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          </div>
        </div>
      </main>
    </div>
  );
}
