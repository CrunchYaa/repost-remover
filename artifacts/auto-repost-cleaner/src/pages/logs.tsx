import { useGetLogs, getGetLogsQueryKey } from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { motion } from "framer-motion";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Trash2, Play, Square, Link, Unlink, AlertTriangle, ScrollText, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

type LogType = "scan" | "removal" | "automation_start" | "automation_stop" | "account_connect" | "account_disconnect" | "error";

const typeConfig: Record<LogType, { icon: React.ElementType; label: string; cls: string }> = {
  scan: { icon: Search, label: "Scan", cls: "bg-blue-500/15 text-blue-400 border-blue-500/20" },
  removal: { icon: Trash2, label: "Removal", cls: "bg-violet-500/15 text-violet-400 border-violet-500/20" },
  automation_start: { icon: Play, label: "Auto Start", cls: "bg-emerald-500/15 text-emerald-400 border-emerald-500/20" },
  automation_stop: { icon: Square, label: "Auto Stop", cls: "bg-gray-500/15 text-gray-400 border-gray-500/20" },
  account_connect: { icon: Link, label: "Connected", cls: "bg-cyan-500/15 text-cyan-400 border-cyan-500/20" },
  account_disconnect: { icon: Unlink, label: "Disconnected", cls: "bg-orange-500/15 text-orange-400 border-orange-500/20" },
  error: { icon: AlertTriangle, label: "Error", cls: "bg-red-500/15 text-red-400 border-red-500/20" },
};

export default function Logs() {
  const queryClient = useQueryClient();
  const { data: logs, isLoading } = useGetLogs();

  function handleRefresh() {
    queryClient.invalidateQueries({ queryKey: getGetLogsQueryKey() });
  }

  return (
    <Layout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Activity Log</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {(logs ?? []).length} entries recorded
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            className="border-border hover:border-violet-500/50 text-muted-foreground hover:text-white"
            data-testid="button-refresh-logs"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        <div className="glass-card gradient-border rounded-xl overflow-hidden" data-testid="logs-container">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : (logs ?? []).length === 0 ? (
            <div className="p-16 text-center">
              <ScrollText className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-white font-medium mb-1">No log entries yet</p>
              <p className="text-sm text-muted-foreground">Activity will appear here once you start using the app.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/50">
              {(logs ?? []).map((log, i) => {
                const config = typeConfig[log.type as LogType] ?? typeConfig.scan;
                const Icon = config.icon;
                return (
                  <motion.div
                    key={log.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: Math.min(i * 0.02, 0.3) }}
                    className="flex items-start gap-4 px-5 py-4 hover:bg-white/2 transition-colors"
                    data-testid={`log-entry-${log.id}`}
                  >
                    <div className={`w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 ${config.cls}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span
                          className={`text-xs px-1.5 py-0.5 rounded border font-medium ${config.cls}`}
                          data-testid={`log-type-${log.id}`}
                        >
                          {config.label}
                        </span>
                        <p className="text-sm text-white" data-testid={`log-message-${log.id}`}>{log.message}</p>
                      </div>
                      {log.detail && (
                        <p className="text-xs text-muted-foreground mt-0.5">{log.detail}</p>
                      )}
                    </div>
                    <time
                      className="text-xs text-muted-foreground shrink-0 mt-0.5"
                      data-testid={`log-time-${log.id}`}
                    >
                      {format(new Date(log.createdAt), "MMM d, HH:mm:ss")}
                    </time>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
