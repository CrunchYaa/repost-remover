import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { KeyRound, CheckCircle, LogOut } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { format, formatDistanceToNow } from "date-fns";

export default function ActivatePage() {
  const [, nav] = useLocation();
  const { user, logout, refresh } = useAuth();
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<{ duration: string; expiresAt: string | null } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleActivate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/license/activate", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: key.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Activation failed");
      setSuccess({ duration: data.duration, expiresAt: data.expiresAt });
      await refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Activation failed");
    } finally {
      setLoading(false);
    }
  };

  const durationLabel: Record<string, string> = {
    week: "1 Week",
    month: "1 Month",
    three_months: "3 Months",
    six_months: "6 Months",
    year: "1 Year",
    lifetime: "Lifetime",
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080810]">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-blue-950/20 pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(124,58,237,0.4)]">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Activate License</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Signed in as <span className="text-violet-300">@{user?.username}</span>
          </p>
        </div>

        <div className="glass-card border border-border rounded-2xl p-8">
          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">License Activated!</h2>
              <p className="text-sm text-muted-foreground mb-2">
                Plan: <span className="text-emerald-300 font-medium">{durationLabel[success.duration] ?? success.duration}</span>
              </p>
              {success.expiresAt && (
                <p className="text-xs text-muted-foreground mb-6">
                  Expires: {format(new Date(success.expiresAt), "MMM d, yyyy")} ({formatDistanceToNow(new Date(success.expiresAt), { addSuffix: true })})
                </p>
              )}
              {!success.expiresAt && (
                <p className="text-xs text-emerald-400 mb-6">Never expires — Lifetime access!</p>
              )}
              <button
                onClick={() => nav("/dashboard")}
                className="w-full bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-4 py-3 rounded-lg transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
              >
                Go to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleActivate} className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">License Key</label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => setKey(e.target.value.toUpperCase())}
                  required
                  placeholder="ARC-XXXXXXXXXXXXXXXXXXXX"
                  className="w-full bg-white/5 border border-border rounded-lg px-4 py-3 text-sm text-white font-mono placeholder:text-muted-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all tracking-wider"
                />
                <p className="text-xs text-muted-foreground mt-1.5">Paste your key exactly as received</p>
              </div>

              {error && (
                <div className="bg-red-950/40 border border-red-500/30 rounded-lg px-4 py-3 text-xs text-red-300">{error}</div>
              )}

              <button
                type="submit"
                disabled={loading || !key.trim()}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
              >
                <KeyRound className="w-4 h-4" />
                {loading ? "Activating…" : "Activate License"}
              </button>
            </form>
          )}

          {!success && (
            <div className="mt-6 pt-6 border-t border-border">
              <button
                onClick={async () => { await logout(); nav("/login"); }}
                className="w-full text-xs text-muted-foreground hover:text-red-400 flex items-center justify-center gap-1.5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" /> Sign out of this account
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
