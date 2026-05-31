import { useState, useEffect } from "react";
import { Link } from "wouter";
import { FileText, ArrowLeft, RefreshCw } from "lucide-react";
import { format } from "date-fns";

interface AuditLog { id: number; userId: number | null; action: string; category: string; details: unknown; ipAddress: string | null; createdAt: string; }

const categoryColor: Record<string, string> = {
  auth: "text-blue-400 bg-blue-950/30 border-blue-500/20",
  admin: "text-amber-400 bg-amber-950/30 border-amber-500/20",
  license: "text-emerald-400 bg-emerald-950/30 border-emerald-500/20",
  account: "text-violet-400 bg-violet-950/30 border-violet-500/20",
  system: "text-muted-foreground bg-white/5 border-border",
};

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  const fetchLogs = () => {
    setLoading(true);
    fetch("/api/admin/logs", { credentials: "include" }).then((r) => r.json()).then(setLogs).finally(() => setLoading(false));
  };

  useEffect(fetchLogs, []);

  const categories = ["all", "auth", "admin", "license", "account", "system"];
  const filtered = filter === "all" ? logs : logs.filter((l) => l.category === filter);

  return (
    <div className="min-h-screen bg-[#080810] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-muted-foreground hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <FileText className="w-5 h-5 text-violet-400" />
          <h1 className="text-xl font-bold text-white">Audit Logs</h1>
          <span className="ml-auto text-xs text-muted-foreground glass-card border border-border rounded-full px-3 py-1">{filtered.length} entries</span>
          <button onClick={fetchLogs} className="text-muted-foreground hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 flex-wrap mb-5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-all capitalize ${filter === cat ? "border-violet-500/40 text-violet-300 bg-violet-600/20" : "border-border text-muted-foreground hover:text-white"}`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="glass-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 text-violet-400 animate-spin" /></div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground text-sm">No logs found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left p-4">Time</th>
                  <th className="text-left p-4">Action</th>
                  <th className="text-left p-4">Category</th>
                  <th className="text-left p-4">User ID</th>
                  <th className="text-left p-4">IP</th>
                  <th className="text-left p-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((log) => (
                  <tr key={log.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                    <td className="p-4 text-xs text-muted-foreground whitespace-nowrap">{format(new Date(log.createdAt), "MMM d HH:mm:ss")}</td>
                    <td className="p-4 text-xs text-white font-mono">{log.action}</td>
                    <td className="p-4">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${categoryColor[log.category] ?? categoryColor.system}`}>
                        {log.category}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{log.userId ?? "—"}</td>
                    <td className="p-4 text-xs text-muted-foreground">{log.ipAddress ?? "—"}</td>
                    <td className="p-4 text-xs text-muted-foreground max-w-xs truncate">
                      {log.details ? JSON.stringify(log.details).slice(0, 60) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
