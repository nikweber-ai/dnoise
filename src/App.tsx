
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AuthProvider from '@/hooks/useAuth';
import { TranslationProvider } from '@/hooks/useTranslation';
import { ThemeProvider } from '@/hooks/useTheme';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from 'sonner';
import SignIn from '@/pages/SignIn';
import SignUp from '@/pages/SignUp';
import ForgotPassword from '@/pages/ForgotPassword';
import Dashboard from '@/pages/Dashboard';
import Generate from '@/pages/Generate';
import History from '@/pages/History';
import Favorites from '@/pages/Favorites';
import Profile from '@/pages/Profile';
import NotFound from '@/pages/NotFound';
import Index from '@/pages/Index';
import { AuthRoute } from '@/components/AuthRoute';
import ErrorBoundary from '@/components/ErrorBoundary';
import './App.css';

// Admin pages
import Models from '@/pages/admin/Models';
import ModelConfig from '@/pages/admin/ModelConfig';
import Users from '@/pages/admin/Users';
import Settings from '@/pages/admin/Settings';

// Configure QueryClient with better defaults for our app
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 30000, // 30 seconds
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      gcTime: 1000 * 60 * 10, // 10 minutes
    },
  },
});

// Create a global error handler
window.addEventListener('error', (event) => {
  console.error('Global error caught:', event.error);
});

// Suppress some known harmless errors from third-party scripts
const originalConsoleError = console.error;
console.error = function(...args) {
  // Filter out known harmless errors
  if (
    args[0]?.includes?.('Failed to define property ethereum') ||
    args[0]?.includes?.('Cannot redefine property: ethereum')
  ) {
    return;
  }
  return originalConsoleError.apply(this, args);
};

function App() {
  console.log("App rendering");
  
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router>
          <TranslationProvider>
            <AuthProvider>
              <ThemeProvider>
                <div className="app-container">
                  <Routes>
                    {/* Public routes */}
                    <Route element={<AuthRoute requireAuth={false} />}>
                      <Route path="/" element={<Index />} />
                      <Route path="/sign-in" element={<SignIn />} />
                      <Route path="/sign-up" element={<SignUp />} />
                      <Route path="/forgot-password" element={<ForgotPassword />} />
                    </Route>

                    {/* Protected routes */}
                    <Route element={<AuthRoute requireAuth={true} />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/generate" element={<Generate />} />
                      <Route path="/history" element={<History />} />
                      <Route path="/favorites" element={<Favorites />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>

                    {/* Admin routes */}
                    <Route element={<AuthRoute requireAuth={true} requireAdmin={true} />}>
                      <Route path="/admin/models" element={<Models />} />
                      <Route path="/admin/model/:id" element={<ModelConfig />} />
                      <Route path="/admin/users" element={<Users />} />
                      <Route path="/admin/settings" element={<Settings />} />
                    </Route>

                    {/* 404 route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
                <SonnerToaster position="top-right" richColors />
                <Toaster />
              </ThemeProvider>
            </AuthProvider>
          </TranslationProvider>
        </Router>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
