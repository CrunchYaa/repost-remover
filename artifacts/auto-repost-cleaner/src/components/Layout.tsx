import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard,
  Repeat2,
  ScrollText,
  Settings,
  Menu,
  X,
  Zap,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useGetAccount } from "@workspace/api-client-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/reposts", label: "Reposts", icon: Repeat2 },
  { path: "/logs", label: "Activity Log", icon: ScrollText },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: account } = useGetAccount();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 glass-card border-r border-border shrink-0">
        <div className="p-5 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center glow-purple">
              <Zap className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <p className="text-sm font-bold tracking-tight text-white">Auto Repost</p>
              <p className="text-xs text-muted-foreground">Cleaner</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1" data-testid="sidebar-nav">
          {navItems.map(({ path, label, icon: Icon }) => {
            const isActive = location === path || location.startsWith(path + "/");
            return (
              <Link
                key={path}
                href={path}
                data-testid={`nav-${label.toLowerCase().replace(" ", "-")}`}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? "bg-violet-600/20 text-violet-300 border border-violet-500/30 shadow-[0_0_12px_rgba(124,58,237,0.15)]"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-violet-400" : ""}`} />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border">
          {account?.connected ? (
            <div className="flex items-center gap-3" data-testid="account-info">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
                <SiTiktok className="w-4 h-4 text-white" />
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">@{account.username}</p>
                <p className="text-xs text-muted-foreground">Connected</p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 ml-auto shrink-0 animate-pulse" />
            </div>
          ) : (
            <Link
              href="/connect"
              className="flex items-center gap-2 text-xs text-muted-foreground hover:text-violet-400 transition-colors"
              data-testid="link-connect-account"
            >
              <SiTiktok className="w-4 h-4" />
              Connect Account
            </Link>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold">Auto Repost Cleaner</span>
        </div>
        <button
          data-testid="button-mobile-menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-white/5 transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-14">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative glass-card border-r border-border w-64 h-full p-4 space-y-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location === path;
              return (
                <Link
                  key={path}
                  href={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-violet-600/20 text-violet-300 border border-violet-500/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0 md:overflow-auto">
        <div className="md:hidden h-14" />
        {children}
      </main>
    </div>
  );
}
