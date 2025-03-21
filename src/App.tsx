
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import AuthProvider from "@/hooks/useAuth";
import { AuthRoute } from "@/components/AuthRoute";
import { TranslationProvider } from "@/hooks/useTranslation";

// Auth Pages
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ForgotPassword from "./pages/ForgotPassword";

// Main Pages
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Favorites from "./pages/Favorites";

// Admin Pages
import Users from "./pages/admin/Users";
import Settings from "./pages/admin/Settings";
import Models from "./pages/admin/Models";
import ModelConfig from "./pages/admin/ModelConfig";

// Error Pages
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TranslationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner position="bottom-right" />
            <BrowserRouter>
              <Routes>
                {/* Auth Routes (redirect to dashboard if logged in) */}
                <Route element={<AuthRoute requireAuth={false} />}>
                  <Route path="/sign-in" element={<SignIn />} />
                  <Route path="/sign-up" element={<SignUp />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                </Route>

                {/* Protected Routes (redirect to login if not logged in) */}
                <Route element={<AuthRoute requireAuth={true} />}>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/generate" element={<Generate />} />
                  <Route path="/history" element={<History />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/favorites" element={<Favorites />} />
                </Route>

                {/* Admin Routes (require admin role) */}
                <Route element={<AuthRoute requireAuth={true} requireAdmin={true} />}>
                  <Route path="/admin/users" element={<Users />} />
                  <Route path="/admin/settings" element={<Settings />} />
                  <Route path="/admin/models" element={<Models />} />
                  <Route path="/admin/models/:id" element={<ModelConfig />} />
                </Route>

                {/* Catch-all route for 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </TranslationProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
