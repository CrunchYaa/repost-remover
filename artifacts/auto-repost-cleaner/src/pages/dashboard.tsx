import { useQueryClient } from "@tanstack/react-query";
import {
  useGetStats,
  useGetAutomation,
  useStartAutomation,
  useStopAutomation,
  getGetStatsQueryKey,
  getGetAutomationQueryKey,
  getGetLogsQueryKey,
  useGetLogs,
} from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { Trash2, BarChart3, TrendingUp, Clock, Repeat2, Play, Square, Search, ScrollText } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";

function StatCard({
  label,
  value,
  icon: Icon,
  color = "purple",
  testId,
}: {
  label: string;
  value: number | string;
  icon: React.ElementType;
  color?: "purple" | "blue" | "emerald" | "amber";
  testId?: string;
}) {
  const colorMap = {
    purple: "from-violet-600/20 to-violet-600/5 border-violet-500/20 text-violet-400",
    blue: "from-blue-600/20 to-blue-600/5 border-blue-500/20 text-blue-400",
    emerald: "from-emerald-600/20 to-emerald-600/5 border-emerald-500/20 text-emerald-400",
    amber: "from-amber-600/20 to-amber-600/5 border-amber-500/20 text-amber-400",
  };

  return (
    <div
      data-testid={testId}
      className={`glass-card rounded-xl p-5 border bg-gradient-to-br ${colorMap[color]}`}
    >
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <Icon className={`w-4 h-4 ${colorMap[color].split(" ").pop()}`} />
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

function LogTypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ElementType> = {
    scan: Search,
    removal: Trash2,
    automation_start: Play,
    automation_stop: Square,
    account_connect: BarChart3,
    account_disconnect: BarChart3,
    error: TrendingUp,
  };
  const Icon = icons[type] || ScrollText;
  return <Icon className="w-3.5 h-3.5" />;
}

export default function Dashboard() {
  const queryClient = useQueryClient();
  const { data: stats, isLoading: statsLoading } = useGetStats();
  const { data: automation } = useGetAutomation();
  const { data: logs } = useGetLogs();

  const startMutation = useStartAutomation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAutomationQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLogsQueryKey() });
      },
    },
  });

  const stopMutation = useStopAutomation({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAutomationQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLogsQueryKey() });
      },
    },
  });

  const isActive = automation?.active ?? false;
  const isToggling = startMutation.isPending || stopMutation.isPending;

  const chartData =
    stats?.dailyData?.map((d) => ({
      date: format(parseISO(d.date), "MMM d"),
      count: d.count,
    })) ?? [];

  const recentLogs = (logs ?? []).slice(0, 5);

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Page header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Monitor and control your repost cleaner</p>
          </div>
          <div
            data-testid="status-indicator"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              isActive
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-muted/40 border-border text-muted-foreground"
            }`}
          >
            <div className={`w-2 h-2 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-gray-500"}`} />
            {isActive ? "ACTIVE" : "STOPPED"}
          </div>
        </div>

        {/* Auto-mode power button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card gradient-border rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6"
        >
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-white mb-1">Auto Mode</h2>
            <p className="text-sm text-muted-foreground">
              {isActive
                ? `Monitoring your account every ${automation?.intervalMinutes} minutes. Next scan: ${
                    automation?.nextRunAt
                      ? format(new Date(automation.nextRunAt), "HH:mm")
                      : "soon"
                  }`
                : "Enable auto-mode to continuously monitor and remove reposts without manual intervention."}
            </p>
            {isActive && (
              <p className="text-xs text-emerald-400 mt-2">
                Started: {automation?.startedAt ? format(new Date(automation.startedAt), "MMM d, HH:mm") : "—"}
              </p>
            )}
          </div>

          {/* Big power toggle */}
          <button
            data-testid="button-auto-mode-toggle"
            disabled={isToggling}
            onClick={() => (isActive ? stopMutation.mutate({}) : startMutation.mutate({}))}
            className={`relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 ${
              isActive
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-[0_0_30px_rgba(52,211,153,0.4)] hover:shadow-[0_0_40px_rgba(52,211,153,0.6)]"
                : "bg-gradient-to-br from-violet-600 to-blue-600 shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)]"
            }`}
          >
            {isActive && (
              <div className="absolute inset-0 rounded-full border-2 border-emerald-400/40 animate-ping" />
            )}
            {isToggling ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : isActive ? (
              <Square className="w-7 h-7 text-white" strokeWidth={2.5} />
            ) : (
              <Play className="w-7 h-7 text-white ml-0.5" strokeWidth={2.5} />
            )}
          </button>
        </motion.div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="glass-card rounded-xl p-5 h-24 animate-pulse bg-muted/20" />
            ))
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
                <StatCard label="Total Removed" value={stats?.totalRemoved ?? 0} icon={Trash2} color="purple" testId="stat-total-removed" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <StatCard label="Removed Today" value={stats?.removedToday ?? 0} icon={TrendingUp} color="blue" testId="stat-removed-today" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                <StatCard label="This Week" value={stats?.removedThisWeek ?? 0} icon={BarChart3} color="emerald" testId="stat-removed-week" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <StatCard label="Pending Reposts" value={stats?.pendingReposts ?? 0} icon={Repeat2} color="amber" testId="stat-pending" />
              </motion.div>
            </>
          )}
        </div>

        {/* Chart + Recent log */}
        <div className="grid md:grid-cols-3 gap-4">
          {/* Chart */}
          <div className="md:col-span-2 glass-card gradient-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Reposts Removed — Last 7 Days</h3>
              <Clock className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="h-48" data-testid="chart-daily-removals">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: "#0f0f1a", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, fontSize: 12 }}
                    itemStyle={{ color: "#a78bfa" }}
                    cursor={{ stroke: "rgba(124,58,237,0.3)" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2} fill="url(#grad1)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent activity */}
          <div className="glass-card gradient-border rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
            {recentLogs.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">No activity yet</p>
            ) : (
              <div className="space-y-3" data-testid="recent-activity">
                {recentLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2.5" data-testid={`log-entry-${log.id}`}>
                    <div
                      className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5 ${
                        log.type === "removal"
                          ? "bg-violet-500/20 text-violet-400"
                          : log.type === "automation_start"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : log.type === "automation_stop"
                          ? "bg-gray-500/20 text-gray-400"
                          : log.type === "error"
                          ? "bg-red-500/20 text-red-400"
                          : "bg-blue-500/20 text-blue-400"
                      }`}
                    >
                      <LogTypeIcon type={log.type} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-white leading-snug truncate">{log.message}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(log.createdAt), "HH:mm")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Last scan info */}
        {stats?.lastScanAt && (
          <p className="text-xs text-muted-foreground text-right" data-testid="text-last-scan">
            Last scan: {format(new Date(stats.lastScanAt), "MMM d, HH:mm:ss")}
          </p>
        )}
      </div>
    </Layout>
  );
}
