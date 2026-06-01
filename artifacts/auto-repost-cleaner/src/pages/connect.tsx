import { useState, useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { Shield, AlertTriangle, Zap, CheckCircle2 } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../contexts/AuthContext";
import { Layout } from "@/components/Layout";

export default function Connect() {
  const [, setLocation] = useLocation();
  const searchStr = useSearch();
  const { user, refresh } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  // Handle return from TikTok OAuth
  useEffect(() => {
    const params = new URLSearchParams(searchStr);
    const error = params.get("error");
    if (error) {
      const messages: Record<string, string> = {
        tiktok_denied: "You cancelled the TikTok login.",
        token_failed: "TikTok authentication failed. Please try again.",
        state_expired: "Login session expired. Please try again.",
        server_error: "A server error occurred. Please try again.",
        invalid_state: "Invalid auth state. Please try again.",
      };
      toast({ title: messages[error] ?? "TikTok connection failed.", variant: "destructive" });
    }
  }, [searchStr]);

  async function handleTikTokLogin() {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/tiktok/initiate", {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to initiate TikTok login");
      const { url } = await res.json() as { url: string };
      window.location.href = url;
    } catch {
      toast({ title: "Could not start TikTok login. Please try again.", variant: "destructive" });
      setLoading(false);
    }
  }

  async function handleDisconnect() {
    setLoading(true);
    try {
      await fetch("/api/account/disconnect", { method: "POST", credentials: "include" });
      await refresh();
      toast({ title: "TikTok account disconnected." });
    } catch {
      toast({ title: "Failed to disconnect.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  const isConnected = !!user?.tiktokUsername;

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
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center mx-auto mb-4 glow-purple">
                <SiTiktok className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {isConnected ? "TikTok Connected" : "Connect TikTok Account"}
              </h1>
              <p className="text-sm text-muted-foreground">
                {isConnected
                  ? `Connected as @${user.tiktokUsername}`
                  : "Sign in with TikTok to start removing reposts."}
              </p>
            </div>

            {isConnected ? (
              /* Connected state */
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-emerald-300">Account Connected</p>
                    <p className="text-xs text-muted-foreground mt-0.5">@{user.tiktokUsername}</p>
                  </div>
                </div>

                <button
                  onClick={() => setLocation("/dashboard")}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold py-3 rounded-lg glow-purple transition-all"
                >
                  Go to Dashboard
                </button>

                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="w-full text-sm text-muted-foreground hover:text-red-400 py-2 transition-colors disabled:opacity-50"
                >
                  Disconnect TikTok account
                </button>
              </div>
            ) : (
              /* Not connected state */
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20">
                  <Shield className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-violet-300 leading-relaxed">
                    You'll be redirected to TikTok's official login page. We never see or store your TikTok password.
                  </p>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-300 leading-relaxed">
                    Only grant permissions to manage your own TikTok content. We request read access to detect reposts.
                  </p>
                </div>

                <button
                  onClick={handleTikTokLogin}
                  disabled={loading}
                  data-testid="button-connect-tiktok"
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-lg glow-purple transition-all text-base"
                >
                  {loading ? (
                    <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connecting…</>
                  ) : (
                    <><SiTiktok className="w-5 h-5" /> Login with TikTok</>
                  )}
                </button>

                <p className="text-center text-xs text-muted-foreground">
                  By connecting, you agree to our{" "}
                  <a href="/terms" className="text-violet-400 hover:underline">Terms of Service</a>
                  {" "}and{" "}
                  <a href="/privacy" className="text-violet-400 hover:underline">Privacy Policy</a>
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
