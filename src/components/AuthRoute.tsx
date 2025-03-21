
import React, { useEffect } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import { toast } from 'sonner';

interface AuthRouteProps {
  requireAuth: boolean;
  requireAdmin?: boolean;
  redirectTo?: string;
}

export const AuthRoute: React.FC<AuthRouteProps> = ({
  requireAuth,
  requireAdmin = false,
  redirectTo = requireAuth ? '/sign-in' : '/dashboard',
}) => {
  const { user, loading, error } = useAuth();
  const location = useLocation();
  
  useEffect(() => {
    if (error) {
      console.error("Auth error:", error);
      toast.error("Authentication error: " + error);
    }
  }, [error]);
  
  // Show loading state when authentication is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin-slow text-primary">
          <div className="h-12 w-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full" />
        </div>
        <div className="ml-3 text-sm text-muted-foreground">Checking authentication...</div>
      </div>
    );
  }

  // Simple auth checks
  const isAuthenticated = !!user;
  const isAdmin = user?.isAdmin ?? false;

  // Route requires authentication but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    console.log('Not authenticated, redirecting to sign-in');
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  // Route requires admin but user is not admin
  if (requireAuth && requireAdmin && !isAdmin) {
    console.log('Not admin, redirecting to dashboard');
    toast.error('You do not have permission to access this page');
    return <Navigate to="/dashboard" replace />;
  }

  // Public route but user is already authenticated
  if (!requireAuth && isAuthenticated) {
    console.log('Already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Render protected routes with Layout
  if (requireAuth) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }

  // Render public routes without Layout
  return <Outlet />;
};
