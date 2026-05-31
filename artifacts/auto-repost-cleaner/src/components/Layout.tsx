import { Link, useLocation } from "wouter";
import { useState } from "react";
import {
  LayoutDashboard, Repeat2, ScrollText, Settings, Menu, X, Zap, LogOut, Crown, KeyRound,
} from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useAuth } from "../contexts/AuthContext";
import { format } from "date-fns";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/reposts", label: "Reposts", icon: Repeat2 },
  { path: "/logs", label: "Activity Log", icon: ScrollText },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuth();

  const isSubLifetime = user?.subscriptionExpiresAt === null && user?.role !== "admin";
  const subExpiry = user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) : null;
  const subActive = user?.role === "admin" || (subExpiry && subExpiry > new Date());

  const handleLogout = async () => {
    await logout();
  };

  const SidebarContent = () => (
    <>
      {/* Logo */}
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

      {/* User info */}
      {user && (
        <div className="px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shrink-0">
              <span className="text-xs font-bold text-white">{user.username[0].toUpperCase()}</span>
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">@{user.username}</p>
              {user.role === "admin" ? (
                <p className="text-xs text-amber-400 flex items-center gap-1"><Crown className="w-2.5 h-2.5" /> Admin</p>
              ) : subActive ? (
                <p className="text-xs text-emerald-400">
                  {isSubLifetime ? "Lifetime" : subExpiry ? `Until ${format(subExpiry, "MMM d")}` : "Active"}
                </p>
              ) : (
                <Link href="/activate" className="text-xs text-red-400 flex items-center gap-1 hover:text-red-300">
                  <KeyRound className="w-2.5 h-2.5" /> No subscription
                </Link>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const isActive = location === path || location.startsWith(path + "/");
          return (
            <Link
              key={path}
              href={path}
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

        {user?.role === "admin" && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
              location.startsWith("/admin")
                ? "bg-amber-600/20 text-amber-300 border border-amber-500/30"
                : "text-muted-foreground hover:text-amber-300 hover:bg-amber-500/5"
            }`}
          >
            <Crown className="w-4 h-4" />
            Admin Panel
          </Link>
        )}
      </nav>

      {/* Bottom: TikTok + logout */}
      <div className="p-4 border-t border-border space-y-2">
        {user?.tiktokUsername ? (
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center shrink-0">
              <SiTiktok className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="overflow-hidden flex-1">
              <p className="text-xs font-semibold text-white truncate">@{user.tiktokUsername}</p>
              <p className="text-xs text-muted-foreground">TikTok Connected</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </div>
        ) : (
          <Link href="/connect" className="flex items-center gap-2 text-xs text-muted-foreground hover:text-violet-400 transition-colors">
            <SiTiktok className="w-4 h-4" /> Connect TikTok
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-red-400 transition-colors px-1 py-1"
        >
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-60 glass-card border-r border-border shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 glass-card border-b border-border px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-blue-500 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-bold">Auto Repost Cleaner</span>
        </div>
        <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 pt-14">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative glass-card border-r border-border w-64 h-full flex flex-col">
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
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
            </nav>
            <div className="p-4 border-t border-border">
              <button onClick={handleLogout} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-red-400 transition-colors">
                <LogOut className="w-3.5 h-3.5" /> Sign out
              </button>
            </div>
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
