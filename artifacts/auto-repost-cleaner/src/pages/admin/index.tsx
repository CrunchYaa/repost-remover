import { useState, useEffect } from "react";
import { useLocation, Link } from "wouter";
import { motion } from "framer-motion";
import { Users, Key, FileText, BarChart3, Shield, TrendingUp, RefreshCw } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

interface AdminStats { totalUsers: number; availableKeys: number; usedKeys: number; bannedUsers: number; }

export default function AdminDashboard() {
  const [, nav] = useLocation();
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== "admin") { nav("/dashboard"); return; }
    fetch("/api/admin/stats", { credentials: "include" })
      .then((r) => r.json())
      .then(setStats)
      .finally(() => setLoading(false));
  }, [user]);

  const cards = [
    { label: "Total Users", value: stats?.totalUsers ?? 0, icon: Users, color: "violet" },
    { label: "Available Keys", value: stats?.availableKeys ?? 0, icon: Key, color: "emerald" },
    { label: "Used Keys", value: stats?.usedKeys ?? 0, icon: TrendingUp, color: "blue" },
    { label: "Banned Users", value: stats?.bannedUsers ?? 0, icon: Shield, color: "red" },
  ];

  const navLinks = [
    { href: "/admin/users", label: "User Management", icon: Users, desc: "View, ban, and manage subscriptions" },
    { href: "/admin/keys", label: "License Keys", icon: Key, desc: "Generate and manage license keys" },
    { href: "/admin/logs", label: "Audit Logs", icon: FileText, desc: "Full activity log of all operations" },
  ];

  return (
    <div className="min-h-screen bg-[#080810] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Signed in as <span className="text-violet-300">@{user?.username}</span></p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-white transition-colors border border-border rounded-lg px-3 py-2">
              ← Dashboard
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <RefreshCw className="w-6 h-6 text-violet-400 animate-spin" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {cards.map(({ label, value, icon: Icon, color }) => (
                <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className="glass-card rounded-xl p-4 border border-border"
                >
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <Icon className={`w-4 h-4 text-${color}-400`} />
                  </div>
                  <p className={`text-3xl font-bold text-${color}-400`}>{value}</p>
                </motion.div>
              ))}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              {navLinks.map(({ href, label, icon: Icon, desc }) => (
                <Link key={href} href={href}>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="glass-card border border-border rounded-xl p-6 cursor-pointer hover:border-violet-500/40 transition-all"
                  >
                    <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mb-4">
                      <Icon className="w-5 h-5 text-violet-400" />
                    </div>
                    <h3 className="text-sm font-semibold text-white mb-1">{label}</h3>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </motion.div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
