import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Users, ArrowLeft, RefreshCw, Ban, CheckCircle, Smartphone, Trash2, Crown } from "lucide-react";
import { format } from "date-fns";

interface AdminUser {
  id: number; username: string; email: string; role: string; isBanned: boolean;
  deviceFingerprint: string | null; tiktokUsername: string | null;
  subscriptionExpiresAt: string | null; createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actioning, setActioning] = useState<number | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    fetch("/api/admin/users", { credentials: "include" })
      .then((r) => r.json()).then(setUsers).finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const action = async (id: number, path: string, method = "POST") => {
    setActioning(id);
    await fetch(`/api/admin/users/${id}/${path}`, { method, credentials: "include" });
    await fetchUsers();
    setActioning(null);
  };

  const isSubActive = (u: AdminUser) =>
    u.role === "admin" || (!!u.subscriptionExpiresAt && new Date(u.subscriptionExpiresAt) > new Date());

  return (
    <div className="min-h-screen bg-[#080810] p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-muted-foreground hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <Users className="w-5 h-5 text-violet-400" />
          <h1 className="text-xl font-bold text-white">User Management</h1>
          <span className="ml-auto text-xs text-muted-foreground glass-card border border-border rounded-full px-3 py-1">{users.length} users</span>
          <button onClick={fetchUsers} className="text-muted-foreground hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        <div className="glass-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 text-violet-400 animate-spin" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left p-4">User</th>
                  <th className="text-left p-4">Role</th>
                  <th className="text-left p-4">Subscription</th>
                  <th className="text-left p-4">Device</th>
                  <th className="text-left p-4">Joined</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <motion.tr key={u.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`border-b border-border/50 ${u.isBanned ? "opacity-50" : ""}`}
                  >
                    <td className="p-4">
                      <p className="font-medium text-white">@{u.username}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      {u.tiktokUsername && <p className="text-xs text-blue-400">TikTok: @{u.tiktokUsername}</p>}
                    </td>
                    <td className="p-4">
                      {u.role === "admin" ? (
                        <span className="flex items-center gap-1 text-amber-400 text-xs font-medium"><Crown className="w-3 h-3" /> Admin</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">User</span>
                      )}
                    </td>
                    <td className="p-4">
                      {isSubActive(u) ? (
                        <div>
                          <span className="text-xs text-emerald-400 font-medium">Active</span>
                          {u.subscriptionExpiresAt && u.role !== "admin" && (
                            <p className="text-xs text-muted-foreground">Until {format(new Date(u.subscriptionExpiresAt), "MMM d, yyyy")}</p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-red-400">No subscription</span>
                      )}
                    </td>
                    <td className="p-4">
                      {u.deviceFingerprint ? (
                        <span className="text-xs text-emerald-400 flex items-center gap-1"><Smartphone className="w-3 h-3" /> Bound</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{format(new Date(u.createdAt), "MMM d, yyyy")}</td>
                    <td className="p-4">
                      {u.role !== "admin" && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => action(u.id, u.isBanned ? "unban" : "ban")}
                            disabled={actioning === u.id}
                            title={u.isBanned ? "Unban" : "Ban"}
                            className={`p-1.5 rounded-lg border transition-all ${u.isBanned ? "border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10" : "border-red-500/30 text-red-400 hover:bg-red-500/10"}`}
                          >
                            {u.isBanned ? <CheckCircle className="w-3.5 h-3.5" /> : <Ban className="w-3.5 h-3.5" />}
                          </button>
                          {u.deviceFingerprint && (
                            <button
                              onClick={() => action(u.id, "revoke-device")}
                              disabled={actioning === u.id}
                              title="Reset device binding"
                              className="p-1.5 rounded-lg border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 transition-all"
                            >
                              <Smartphone className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {isSubActive(u) && (
                            <button
                              onClick={() => action(u.id, "subscription", "DELETE")}
                              disabled={actioning === u.id}
                              title="Revoke subscription"
                              className="p-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-all"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
