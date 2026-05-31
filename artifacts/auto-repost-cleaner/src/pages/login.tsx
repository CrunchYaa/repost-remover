import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { SiTiktok } from "react-icons/si";
import { Eye, EyeOff, LogIn, KeyRound } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { getFingerprint } from "../lib/fingerprint";

export default function LoginPage() {
  const [, nav] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const fp = await getFingerprint();
      await login(email, password, fp);
      nav("/dashboard");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Login failed";
      if (msg.includes("DEVICE_MISMATCH") || msg.includes("new device")) {
        setError("Access blocked — this account is bound to a different device. Contact support to reset.");
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[#080810]">
      <div className="absolute inset-0 bg-gradient-to-br from-violet-950/20 via-transparent to-blue-950/20 pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-600 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(124,58,237,0.4)]">
            <SiTiktok className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Auto Repost Cleaner</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to your account</p>
        </div>

        <div className="glass-card border border-border rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="you@example.com"
                className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-border rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-muted-foreground focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500/30 transition-all pr-10"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-950/40 border border-red-500/30 rounded-lg px-4 py-3 text-xs text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-border text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{" "}
              <button onClick={() => nav("/register")} className="text-violet-400 hover:text-violet-300 font-medium">
                Create one
              </button>
            </p>
            <p className="text-xs text-muted-foreground">
              Have a license key?{" "}
              <button onClick={() => nav("/activate")} className="text-blue-400 hover:text-blue-300 font-medium flex items-center gap-1 justify-center mx-auto">
                <KeyRound className="w-3 h-3" /> Activate
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
