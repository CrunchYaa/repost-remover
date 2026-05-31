import { useState } from "react";
import { useLocation } from "wouter";
import { Shield, AlertTriangle, Zap } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "@/components/Layout";

export default function Connect() {
  const [, setLocation] = useLocation();
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [username, setUsername] = useState(user?.tiktokUsername ?? "");
  const [sessionToken, setSessionToken] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/account/connect", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.replace(/^@/, ""),
          sessionToken,
        }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error ?? "Failed to connect");
      }
      await refresh();
      toast({ title: "TikTok account connected successfully!" });
      setLocation("/dashboard");
    } catch (err: unknown) {
      toast({ title: err instanceof Error ? err.message : "Failed to connect", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="glass-card gradient-border rounded-2xl p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center mx-auto mb-4 glow-purple">
                <SiTiktok className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">Connect TikTok Account</h1>
              <p className="text-sm text-muted-foreground">Enter your credentials to start monitoring for reposts.</p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 mb-4">
              <Shield className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
              <p className="text-xs text-violet-300 leading-relaxed">
                Your session token is stored securely and used solely to interact with TikTok on your behalf.
              </p>
            </div>

            <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
              <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-300 leading-relaxed">
                Use this tool responsibly. Automated actions on TikTok may be subject to their Terms of Service.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">TikTok Username</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="yourusername"
                    className="w-full pl-7 bg-muted/40 border border-border rounded-lg px-3 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 transition-all"
                    data-testid="input-username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1.5">Session Token</label>
                <input
                  type="password"
                  value={sessionToken}
                  onChange={(e) => setSessionToken(e.target.value)}
                  required
                  autoComplete="off"
                  placeholder="Paste your session token here"
                  className="w-full bg-muted/40 border border-border rounded-lg px-3 py-2.5 text-sm text-white font-mono placeholder:text-muted-foreground focus:outline-none focus:border-violet-500/50 transition-all"
                  data-testid="input-session-token"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Find this in your browser's developer tools under Application → Cookies → sessionid
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-60 text-white font-semibold py-3 rounded-lg glow-purple transition-all"
                data-testid="button-connect-submit"
              >
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting…</>
                ) : (
                  <><SiTiktok className="w-4 h-4" /> Connect Account</>
                )}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
