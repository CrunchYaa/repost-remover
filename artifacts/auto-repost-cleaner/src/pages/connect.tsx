import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useConnectAccount, getGetAccountQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Shield, AlertTriangle, Zap } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const connectSchema = z.object({
  username: z.string().min(1, "Username is required").regex(/^@?[\w.]+$/, "Invalid TikTok username"),
  sessionToken: z.string().min(8, "Session token must be at least 8 characters"),
});

type ConnectForm = z.infer<typeof connectSchema>;

export default function Connect() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const connectMutation = useConnectAccount({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetAccountQueryKey() });
        toast({ title: "Account connected successfully" });
        setLocation("/dashboard");
      },
      onError: () => {
        toast({ title: "Failed to connect account", variant: "destructive" });
      },
    },
  });

  const form = useForm<ConnectForm>({
    resolver: zodResolver(connectSchema),
    defaultValues: { username: "", sessionToken: "" },
  });

  function onSubmit(values: ConnectForm) {
    connectMutation.mutate({
      data: {
        username: values.username.replace(/^@/, ""),
        sessionToken: values.sessionToken,
      },
    });
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute top-6 left-6 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold text-white">Auto Repost Cleaner</span>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass-card gradient-border rounded-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center mx-auto mb-4 glow-purple">
              <SiTiktok className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Connect TikTok Account</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to start monitoring for reposts.
            </p>
          </div>

          {/* Security notice */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-violet-500/10 border border-violet-500/20 mb-6">
            <Shield className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            <p className="text-xs text-violet-300 leading-relaxed">
              Your session token is never stored on our servers. It lives only in your current browser session and is used solely to interact with the TikTok API on your behalf.
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
            <AlertTriangle className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
            <p className="text-xs text-amber-300 leading-relaxed">
              Use this tool responsibly. Automated actions on TikTok may be subject to their Terms of Service. Ensure you understand the implications before proceeding.
            </p>
          </div>

          {/* Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">TikTok Username</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">@</span>
                        <Input
                          {...field}
                          placeholder="yourusername"
                          className="pl-7 bg-muted/40 border-border focus:border-violet-500/50"
                          data-testid="input-username"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sessionToken"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm text-muted-foreground">Session Token</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Paste your session token here"
                        className="bg-muted/40 border-border focus:border-violet-500/50 font-mono text-sm"
                        data-testid="input-session-token"
                      />
                    </FormControl>
                    <FormMessage />
                    <p className="text-xs text-muted-foreground mt-1">
                      Find this in your browser's developer tools under Application &rarr; Cookies &rarr; sessionid
                    </p>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                disabled={connectMutation.isPending}
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 text-white font-semibold py-3 glow-purple transition-all"
                data-testid="button-connect-submit"
              >
                {connectMutation.isPending ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Connecting...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <SiTiktok className="w-4 h-4" />
                    Connect Account
                  </div>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </motion.div>
    </div>
  );
}
