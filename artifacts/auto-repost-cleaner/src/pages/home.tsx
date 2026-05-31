import { Link } from "wouter";
import { Shield, Zap, Clock, Eye, ArrowRight, Check } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { motion } from "framer-motion";

const features = [
  {
    icon: Eye,
    title: "Smart Detection",
    desc: "Automatically finds every repost on your TikTok profile, even newly added ones.",
  },
  {
    icon: Zap,
    title: "Instant Removal",
    desc: "Remove reposts one by one or wipe them all in a single click — no manual work.",
  },
  {
    icon: Clock,
    title: "Auto Mode",
    desc: "Set it and forget it. The system monitors your account 24/7 and removes reposts the moment they're detected.",
  },
  {
    icon: Shield,
    title: "Zero Data Storage",
    desc: "Your session credentials are never stored on our servers. Everything stays in your browser session.",
  },
];

const stats = [
  { value: "100K+", label: "Reposts Removed" },
  { value: "99.9%", label: "Uptime" },
  { value: "<1s", label: "Detection Speed" },
  { value: "0", label: "Data Stored" },
];

export default function Home() {

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b border-border glass-card sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <span className="font-bold text-white">Auto Repost Cleaner</span>
          </div>
          <Link
            href="/login"
            data-testid="button-get-started-nav"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            Sign In
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
            Automated TikTok Repost Management
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight">
            <span className="text-white">Keep Your Profile</span>
            <br />
            <span className="text-gradient">Repost-Free</span>
          </h1>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
            Connect your TikTok account and let Auto Repost Cleaner silently monitor and remove reposts —
            automatically, continuously, and securely.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/connect"
              data-testid="button-get-started-hero"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold transition-all glow-purple"
            >
              <SiTiktok className="w-5 h-5" />
              Get Started Free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              data-testid="link-view-dashboard"
              className="px-6 py-3 rounded-xl border border-border hover:border-violet-500/50 text-muted-foreground hover:text-white text-sm font-medium transition-all"
            >
              View Dashboard
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="glass-card gradient-border rounded-xl p-6 text-center"
              data-testid={`stat-${stat.label.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <p className="text-3xl font-extrabold text-gradient">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <h2 className="text-3xl font-bold text-center text-white mb-12">
            Everything you need,{" "}
            <span className="text-gradient">nothing you don't</span>
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {features.map(({ icon: Icon, title, desc }, i) => (
              <motion.div
                key={title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i + 0.4 }}
                className="glass-card gradient-border rounded-xl p-6"
                data-testid={`feature-${title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-600/30 to-blue-600/30 border border-violet-500/20 flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-violet-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="glass-card gradient-border rounded-2xl p-10 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to clean your profile?</h2>
          <p className="text-muted-foreground mb-8">Connect your TikTok account in under 30 seconds.</p>
          <div className="flex flex-col items-center gap-3">
            <Link
              href="/connect"
              data-testid="button-cta-connect"
              className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold transition-all glow-purple"
            >
              <SiTiktok className="w-5 h-5" />
              Connect TikTok Account
            </Link>
            <div className="flex items-center gap-4 mt-2">
              {["No credit card", "Secure session", "No data stored"].map((item) => (
                <div key={item} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Check className="w-3 h-3 text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
