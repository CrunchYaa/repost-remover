import { Switch, Route, Router as WouterRouter, useLocation, Redirect } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth, hasActiveSubscription } from "@/contexts/AuthContext";
import { CookieConsent } from "@/components/CookieConsent";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Connect from "@/pages/connect";
import Dashboard from "@/pages/dashboard";
import Reposts from "@/pages/reposts";
import Logs from "@/pages/logs";
import Settings from "@/pages/settings";
import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ActivatePage from "@/pages/activate";
import AdminDashboard from "@/pages/admin/index";
import AdminUsersPage from "@/pages/admin/users";
import AdminKeysPage from "@/pages/admin/keys";
import AdminLogsPage from "@/pages/admin/logs";
import TermsOfService from "@/pages/terms";
import PrivacyPolicy from "@/pages/privacy";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false, staleTime: 10_000 },
  },
});

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/login" />;
  if (!hasActiveSubscription(user)) return <Redirect to="/activate" />;
  return <Component />;
}

function AdminRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Redirect to="/login" />;
  if (user.role !== "admin") return <Redirect to="/dashboard" />;
  return <Component />;
}

function AuthRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user && hasActiveSubscription(user)) return <Redirect to="/dashboard" />;
  return <Component />;
}

function LoadingScreen() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#080810]">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

function Router() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <Switch>
      {/* Public auth pages */}
      <Route path="/login"><AuthRoute component={LoginPage} /></Route>
      <Route path="/register"><AuthRoute component={RegisterPage} /></Route>

      {/* Activate — requires logged in, no active sub needed */}
      <Route path="/activate">
        {!user ? <Redirect to="/login" /> : <ActivatePage />}
      </Route>

      {/* Admin pages */}
      <Route path="/admin"><AdminRoute component={AdminDashboard} /></Route>
      <Route path="/admin/users"><AdminRoute component={AdminUsersPage} /></Route>
      <Route path="/admin/keys"><AdminRoute component={AdminKeysPage} /></Route>
      <Route path="/admin/logs"><AdminRoute component={AdminLogsPage} /></Route>

      {/* Protected app pages */}
      <Route path="/dashboard"><ProtectedRoute component={Dashboard} /></Route>
      <Route path="/reposts"><ProtectedRoute component={Reposts} /></Route>
      <Route path="/logs"><ProtectedRoute component={Logs} /></Route>
      <Route path="/settings"><ProtectedRoute component={Settings} /></Route>
      <Route path="/connect"><ProtectedRoute component={Connect} /></Route>

      {/* Public legal pages */}
      <Route path="/terms" component={TermsOfService} />
      <Route path="/privacy" component={PrivacyPolicy} />

      {/* Home — redirect based on auth state */}
      <Route path="/">
        {user && hasActiveSubscription(user)
          ? <Redirect to="/dashboard" />
          : user
          ? <Redirect to="/activate" />
          : <Home />}
      </Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <CookieConsent />
            <Router />
          </WouterRouter>
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
