import { useQueryClient } from "@tanstack/react-query";
import {
  useGetReposts,
  useScanReposts,
  useRemoveAllReposts,
  useRemoveRepost,
  getGetRepostsQueryKey,
  getGetStatsQueryKey,
  getGetLogsQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { motion, AnimatePresence } from "framer-motion";
import { ScanLine, Trash2, RefreshCw, Repeat2, CheckCircle, XCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

function StatusPill({ status }: { status: "pending" | "removed" | "failed" }) {
  const config = {
    pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-300 border-amber-500/25", icon: Clock },
    removed: { label: "Removed", cls: "bg-emerald-500/15 text-emerald-300 border-emerald-500/25", icon: CheckCircle },
    failed: { label: "Failed", cls: "bg-red-500/15 text-red-300 border-red-500/25", icon: XCircle },
  }[status];

  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-xs font-medium ${config.cls}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  );
}

export default function Reposts() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: reposts, isLoading } = useGetReposts();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: getGetRepostsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetLogsQueryKey() });
  };

  const scanMutation = useScanReposts({
    mutation: {
      onSuccess: (result) => {
        invalidateAll();
        toast({ title: `Scan complete — ${result.newFound} new repost${result.newFound !== 1 ? "s" : ""} found` });
      },
    },
  });

  const removeAllMutation = useRemoveAllReposts({
    mutation: {
      onSuccess: (result) => {
        invalidateAll();
        toast({ title: `Removed ${result.removed} repost${result.removed !== 1 ? "s" : ""}` });
      },
    },
  });

  const removeMutation = useRemoveRepost({
    mutation: {
      onSuccess: () => {
        invalidateAll();
      },
    },
  });

  const pending = (reposts ?? []).filter((r) => r.status === "pending");
  const all = reposts ?? [];

  return (
    <Layout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Reposts</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {all.length} total detected · {pending.length} pending removal
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={scanMutation.isPending}
              onClick={() => scanMutation.mutate()}
              className="border-border hover:border-blue-500/50 text-muted-foreground hover:text-white"
              data-testid="button-scan-now"
            >
              {scanMutation.isPending ? (
                <RefreshCw className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ScanLine className="w-4 h-4 mr-2" />
              )}
              Scan Now
            </Button>
            {pending.length > 0 && (
              <Button
                size="sm"
                disabled={removeAllMutation.isPending}
                onClick={() => removeAllMutation.mutate()}
                className="bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white"
                data-testid="button-remove-all"
              >
                {removeAllMutation.isPending ? (
                  <RefreshCw className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Remove All ({pending.length})
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="glass-card gradient-border rounded-xl overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-muted/20 animate-pulse" />
              ))}
            </div>
          ) : all.length === 0 ? (
            <div className="p-16 text-center">
              <Repeat2 className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
              <p className="text-white font-medium mb-1">No reposts detected</p>
              <p className="text-sm text-muted-foreground">Click "Scan Now" to check your account for reposts.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="reposts-table">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Original Author</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden md:table-cell">Description</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3 hidden sm:table-cell">Reposted</th>
                    <th className="text-left text-xs font-medium text-muted-foreground px-5 py-3">Status</th>
                    <th className="text-right text-xs font-medium text-muted-foreground px-5 py-3">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence>
                    {all.map((repost, i) => (
                      <motion.tr
                        key={repost.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: i * 0.03 }}
                        className="border-b border-border/50 hover:bg-white/3 transition-colors"
                        data-testid={`row-repost-${repost.id}`}
                      >
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600/20 to-blue-600/20 border border-violet-500/20 flex items-center justify-center shrink-0">
                              <Repeat2 className="w-4 h-4 text-violet-400" />
                            </div>
                            <span className="font-medium text-white text-xs">{repost.originalAuthor}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 hidden md:table-cell">
                          <span className="text-xs text-muted-foreground truncate max-w-xs block">
                            {repost.description ?? "—"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 hidden sm:table-cell text-xs text-muted-foreground">
                          {format(new Date(repost.repostedAt), "MMM d, HH:mm")}
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusPill status={repost.status} />
                        </td>
                        <td className="px-5 py-3.5 text-right">
                          {repost.status === "pending" && (
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={removeMutation.isPending}
                              onClick={() => removeMutation.mutate({ id: repost.id })}
                              className="text-xs text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
                              data-testid={`button-remove-repost-${repost.id}`}
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-1" />
                              Remove
                            </Button>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
