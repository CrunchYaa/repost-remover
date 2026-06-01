import { Link } from "wouter";
import { Zap } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background text-white">
      <header className="border-b border-border glass-card sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white">Auto Repost Cleaner</span>
          </Link>
          <span className="text-xs text-muted-foreground">Last updated: June 1, 2025</span>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-extrabold mb-3 text-gradient">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Your privacy is important to us. This policy explains what data we collect and how we use it.</p>

        <div className="space-y-10">
          <Section title="1. Information We Collect">
            <p>We collect the following information when you use Auto Repost Cleaner:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong className="text-white">Account Information:</strong> Your username, email address, and encrypted password.</li>
              <li><strong className="text-white">Device Fingerprint:</strong> A non-reversible identifier generated from your browser to secure your session.</li>
              <li><strong className="text-white">TikTok Username:</strong> The TikTok username you connect to the Service.</li>
              <li><strong className="text-white">Session Tokens:</strong> Temporary access tokens used to interact with TikTok on your behalf.</li>
              <li><strong className="text-white">Usage Logs:</strong> Records of actions performed through the Service (repost removals, scans) for security and debugging.</li>
            </ul>
          </Section>

          <Section title="2. How We Use Your Information">
            <ul className="list-disc list-inside space-y-2">
              <li>To authenticate you and secure your account.</li>
              <li>To perform repost detection and removal on your TikTok account.</li>
              <li>To maintain audit logs for security and dispute resolution.</li>
              <li>To communicate important updates about the Service.</li>
            </ul>
          </Section>

          <Section title="3. Data Storage & Security">
            <p>Your data is stored in a secure PostgreSQL database. Passwords are hashed using bcrypt and never stored in plain text. Session tokens are encrypted at rest. We implement industry-standard security measures including HTTPS, HTTP security headers, and rate limiting.</p>
          </Section>

          <Section title="4. TikTok Data">
            <p>We access your TikTok account solely to perform the functions you request (detecting and removing reposts). We do not sell, share, or use your TikTok data for any other purpose. TikTok session tokens are stored only for the duration needed to perform requested actions.</p>
          </Section>

          <Section title="5. Cookies">
            <p>We use essential cookies only:</p>
            <ul className="list-disc list-inside space-y-2 mt-2">
              <li><strong className="text-white">arc_token:</strong> An httpOnly authentication cookie to maintain your secure session. It expires with your session or after 7 days.</li>
            </ul>
            <p className="mt-2">We do not use advertising cookies, tracking pixels, or third-party analytics.</p>
          </Section>

          <Section title="6. Data Sharing">
            <p>We do not sell, trade, or rent your personal information to third parties. We do not share your data with advertisers. Data may only be disclosed if required by law or to protect the rights and safety of our users.</p>
          </Section>

          <Section title="7. Data Retention">
            <p>We retain your account data for as long as your account is active. Audit logs are retained for 90 days. You may request deletion of your account and all associated data at any time by contacting us.</p>
          </Section>

          <Section title="8. Your Rights">
            <ul className="list-disc list-inside space-y-2">
              <li>Access the personal data we hold about you.</li>
              <li>Request correction of inaccurate data.</li>
              <li>Request deletion of your account and data.</li>
              <li>Withdraw consent for data processing at any time.</li>
            </ul>
          </Section>

          <Section title="9. Children's Privacy">
            <p>The Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13.</p>
          </Section>

          <Section title="10. Changes to This Policy">
            <p>We may update this Privacy Policy periodically. We will notify you of significant changes via email or a notice on the Service. Continued use after changes constitutes acceptance.</p>
          </Section>

          <Section title="11. Contact Us">
            <p>For privacy-related requests or questions, contact us at: <span className="text-violet-400">admin@repost-remover.com</span></p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
        © 2025 Auto Repost Cleaner · <Link href="/terms" className="text-violet-400 hover:underline">Terms of Service</Link>
      </footer>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="text-xl font-semibold text-white mb-3">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-2">{children}</div>
    </section>
  );
}
