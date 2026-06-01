import { Link } from "wouter";
import { Zap } from "lucide-react";

export default function TermsOfService() {
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
        <h1 className="text-4xl font-extrabold mb-3 text-gradient">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Please read these terms carefully before using Auto Repost Cleaner.</p>

        <div className="space-y-10">
          <Section title="1. Acceptance of Terms">
            <p>By accessing or using Auto Repost Cleaner ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.</p>
          </Section>

          <Section title="2. Description of Service">
            <p>Auto Repost Cleaner is a web-based tool that allows TikTok users to detect and remove reposted content from their own TikTok accounts. The Service connects to TikTok on behalf of the authenticated user solely to manage their own content.</p>
          </Section>

          <Section title="3. User Responsibilities">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You must be at least 13 years old to use the Service.</li>
              <li>You must own the TikTok account you connect to the Service.</li>
              <li>You are solely responsible for all actions taken on your TikTok account through the Service.</li>
              <li>You agree to use the Service only for lawful purposes and in accordance with TikTok's Terms of Service.</li>
            </ul>
          </Section>

          <Section title="4. Account Registration">
            <p>To use the Service, you must create an account. You agree to provide accurate and complete information, keep your credentials confidential, and notify us immediately of any unauthorized use of your account.</p>
          </Section>

          <Section title="5. License Key & Subscription">
            <p>Access to the Service requires a valid license key. License keys are non-transferable and tied to a single user account. Sharing or reselling license keys is strictly prohibited and will result in immediate account termination.</p>
          </Section>

          <Section title="6. Prohibited Activities">
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Using the Service to manage TikTok accounts you do not own.</li>
              <li>Attempting to reverse-engineer, decompile, or tamper with the Service.</li>
              <li>Using the Service for any illegal or unauthorized purpose.</li>
              <li>Interfering with or disrupting the integrity or performance of the Service.</li>
            </ul>
          </Section>

          <Section title="7. Disclaimer of Warranties">
            <p>The Service is provided "as is" without warranties of any kind. We do not guarantee that the Service will be uninterrupted, error-free, or that it will meet your specific requirements. Use of the Service is at your own risk.</p>
          </Section>

          <Section title="8. Limitation of Liability">
            <p>To the fullest extent permitted by law, Auto Repost Cleaner and its operators shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service, including any account restrictions imposed by TikTok.</p>
          </Section>

          <Section title="9. Termination">
            <p>We reserve the right to suspend or terminate your account at any time for violation of these Terms, without prior notice. You may also terminate your account at any time by contacting us.</p>
          </Section>

          <Section title="10. Changes to Terms">
            <p>We may update these Terms from time to time. Continued use of the Service after changes constitutes acceptance of the new Terms.</p>
          </Section>

          <Section title="11. Contact">
            <p>If you have questions about these Terms, please contact us at: <span className="text-violet-400">admin@repost-remover.com</span></p>
          </Section>
        </div>
      </main>

      <footer className="border-t border-border mt-16 py-8 text-center text-sm text-muted-foreground">
        © 2025 Auto Repost Cleaner · <Link href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</Link>
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
