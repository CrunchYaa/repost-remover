import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetSettings,
  useUpdateSettings,
  useGetAccount,
  useDisconnectAccount,
  getGetSettingsQueryKey,
  getGetAccountQueryKey,
  getGetLogsQueryKey,
} from "@workspace/api-client-react";
import { Layout } from "@/components/Layout";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Save, LogOut, Clock, Bell, Zap, Shield } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useToast } from "@/hooks/use-toast";

const settingsSchema = z.object({
  scanIntervalMinutes: z.coerce.number(),
  autoRemove: z.boolean(),
  notifications: z.boolean(),
  notifyOnRemoval: z.boolean(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const intervalOptions = [
  { value: "1", label: "Every 1 minute" },
  { value: "5", label: "Every 5 minutes" },
  { value: "10", label: "Every 10 minutes" },
  { value: "30", label: "Every 30 minutes" },
  { value: "60", label: "Every 60 minutes" },
];

export default function Settings() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettings();
  const { data: account } = useGetAccount();

  const updateMutation = useUpdateSettings({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        toast({ title: "Settings saved" });
      },
    },
  });

  const disconnectMutation = useDisconnectAccount({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAccountQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetLogsQueryKey() });
        toast({ title: "Account disconnected" });
      },
    },
  });

  const form = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      scanIntervalMinutes: 5,
      autoRemove: true,
      notifications: true,
      notifyOnRemoval: true,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        scanIntervalMinutes: settings.scanIntervalMinutes,
        autoRemove: settings.autoRemove,
        notifications: settings.notifications,
        notifyOnRemoval: settings.notifyOnRemoval,
      });
    }
  }, [settings, form]);

  function onSubmit(values: SettingsForm) {
    updateMutation.mutate({ data: values });
  }

  return (
    <Layout>
      <div className="p-6 max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Configure your repost cleaner preferences</p>
        </div>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-24 glass-card rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {/* Scan interval */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card gradient-border rounded-xl p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-violet-400" />
                  <h2 className="text-sm font-semibold text-white">Scan Interval</h2>
                </div>
                <FormField
                  control={form.control}
                  name="scanIntervalMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs text-muted-foreground">
                        How often Auto Mode should scan your account
                      </FormLabel>
                      <FormControl>
                        <Select
                          value={String(field.value)}
                          onValueChange={(v) => field.onChange(Number(v))}
                        >
                          <SelectTrigger
                            className="bg-muted/40 border-border mt-2"
                            data-testid="select-scan-interval"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {intervalOptions.map(({ value, label }) => (
                              <SelectItem key={value} value={value}>
                                {label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Auto-remove */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="glass-card gradient-border rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Zap className="w-4 h-4 text-blue-400" />
                  <h2 className="text-sm font-semibold text-white">Automation</h2>
                </div>

                <FormField
                  control={form.control}
                  name="autoRemove"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-4">
                      <div>
                        <FormLabel className="text-sm text-white">Auto Remove</FormLabel>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Automatically remove detected reposts without manual approval
                        </p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-auto-remove"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>

              {/* Notifications */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-card gradient-border rounded-xl p-5 space-y-4"
              >
                <div className="flex items-center gap-2 mb-1">
                  <Bell className="w-4 h-4 text-violet-400" />
                  <h2 className="text-sm font-semibold text-white">Notifications</h2>
                </div>

                <FormField
                  control={form.control}
                  name="notifications"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-4">
                      <div>
                        <FormLabel className="text-sm text-white">Enable Notifications</FormLabel>
                        <p className="text-xs text-muted-foreground mt-0.5">Receive alerts about system activity</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-notifications"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="notifyOnRemoval"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between gap-4">
                      <div>
                        <FormLabel className="text-sm text-white">Notify on Removal</FormLabel>
                        <p className="text-xs text-muted-foreground mt-0.5">Get notified each time a repost is removed</p>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="switch-notify-removal"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </motion.div>

              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold"
                data-testid="button-save-settings"
              >
                {updateMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    Save Settings
                  </div>
                )}
              </Button>
            </form>
          </Form>
        )}

        {/* Account section */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card gradient-border rounded-xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold text-white">Account</h2>
          </div>

          {account?.connected ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
                  <SiTiktok className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-medium text-white">@{account.username}</p>
                  <p className="text-xs text-muted-foreground">TikTok connected</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                disabled={disconnectMutation.isPending}
                onClick={() => disconnectMutation.mutate()}
                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs"
                data-testid="button-disconnect-account"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                Disconnect
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No account connected.</p>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
