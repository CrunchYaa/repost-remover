import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Key, ArrowLeft, RefreshCw, Plus, Trash2, ToggleLeft, ToggleRight, Copy, Check } from "lucide-react";
import { format } from "date-fns";

interface LicenseKey {
  id: number; key: string; duration: string; isActive: boolean;
  usedByUserId: number | null; usedAt: string | null; expiresAt: string | null; createdAt: string;
}

const durationLabel: Record<string, string> = {
  week: "1 Week", month: "1 Month", three_months: "3 Months",
  six_months: "6 Months", year: "1 Year", lifetime: "Lifetime",
};

export default function AdminKeysPage() {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [duration, setDuration] = useState("month");
  const [qty, setQty] = useState(1);
  const [actioning, setActioning] = useState<number | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  const fetchKeys = () => {
    setLoading(true);
    fetch("/api/admin/keys", { credentials: "include" }).then((r) => r.json()).then(setKeys).finally(() => setLoading(false));
  };

  useEffect(fetchKeys, []);

  const createKeys = async () => {
    setCreating(true);
    await fetch("/api/admin/keys", {
      method: "POST", credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ duration, count: qty }),
    });
    await fetchKeys();
    setCreating(false);
  };

  const deleteKey = async (id: number) => {
    setActioning(id);
    await fetch(`/api/admin/keys/${id}`, { method: "DELETE", credentials: "include" });
    await fetchKeys();
    setActioning(null);
  };

  const toggleKey = async (id: number) => {
    setActioning(id);
    await fetch(`/api/admin/keys/${id}/toggle`, { method: "PATCH", credentials: "include" });
    await fetchKeys();
    setActioning(null);
  };

  const copyKey = (k: string) => {
    navigator.clipboard.writeText(k);
    setCopied(k);
    setTimeout(() => setCopied(null), 2000);
  };

  const available = keys.filter((k) => k.isActive && !k.usedByUserId).length;
  const used = keys.filter((k) => !!k.usedByUserId).length;

  return (
    <div className="min-h-screen bg-[#080810] p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/admin" className="text-muted-foreground hover:text-white transition-colors"><ArrowLeft className="w-5 h-5" /></Link>
          <Key className="w-5 h-5 text-violet-400" />
          <h1 className="text-xl font-bold text-white">License Keys</h1>
          <div className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
            <span className="glass-card border border-emerald-500/30 text-emerald-400 rounded-full px-3 py-1">{available} available</span>
            <span className="glass-card border border-border rounded-full px-3 py-1">{used} used</span>
          </div>
          <button onClick={fetchKeys} className="text-muted-foreground hover:text-white transition-colors">
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>

        {/* Generator */}
        <div className="glass-card border border-border rounded-xl p-5 mb-5">
          <h2 className="text-sm font-semibold text-white mb-4">Generate Keys</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Duration</label>
              <select
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                {Object.entries(durationLabel).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-muted-foreground mb-1.5">Quantity</label>
              <input
                type="number" min={1} max={1000} value={qty}
                onChange={(e) => setQty(Math.min(1000, Math.max(1, Number(e.target.value))))}
                className="bg-white/5 border border-border rounded-lg px-3 py-2 text-sm text-white w-24 focus:outline-none focus:border-violet-500"
              />
            </div>
            <button
              onClick={createKeys} disabled={creating}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              <Plus className="w-4 h-4" />
              {creating ? "Generating…" : `Generate ${qty} Key${qty > 1 ? "s" : ""}`}
            </button>
          </div>
        </div>

        {/* Key List */}
        <div className="glass-card border border-border rounded-xl overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20"><RefreshCw className="w-6 h-6 text-violet-400 animate-spin" /></div>
          ) : (
            <table className="w-full text-sm">
              <thead className="border-b border-border">
                <tr className="text-xs text-muted-foreground uppercase tracking-wide">
                  <th className="text-left p-4">Key</th>
                  <th className="text-left p-4">Duration</th>
                  <th className="text-left p-4">Status</th>
                  <th className="text-left p-4">Used By</th>
                  <th className="text-left p-4">Created</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {keys.map((k) => (
                  <motion.tr key={k.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className={`border-b border-border/50 ${!k.isActive ? "opacity-40" : ""}`}
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono text-violet-300 bg-violet-950/30 px-2 py-1 rounded">
                          {k.key.slice(0, 12)}…
                        </code>
                        <button
                          onClick={() => copyKey(k.key)}
                          className="text-muted-foreground hover:text-white transition-colors"
                          title="Copy full key"
                        >
                          {copied === k.key ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 text-xs text-white">{durationLabel[k.duration] ?? k.duration}</td>
                    <td className="p-4">
                      {k.usedByUserId ? (
                        <span className="text-xs text-muted-foreground">Used</span>
                      ) : k.isActive ? (
                        <span className="text-xs text-emerald-400 font-medium">Available</span>
                      ) : (
                        <span className="text-xs text-red-400">Disabled</span>
                      )}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {k.usedByUserId ? `User #${k.usedByUserId}` : "—"}
                      {k.usedAt && <span className="block">{format(new Date(k.usedAt), "MMM d")}</span>}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">{format(new Date(k.createdAt), "MMM d, yyyy")}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {!k.usedByUserId && (
                          <button
                            onClick={() => toggleKey(k.id)} disabled={actioning === k.id}
                            title={k.isActive ? "Disable" : "Enable"}
                            className="text-muted-foreground hover:text-amber-400 transition-colors"
                          >
                            {k.isActive ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => deleteKey(k.id)} disabled={actioning === k.id}
                          title="Delete"
                          className="text-muted-foreground hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
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
