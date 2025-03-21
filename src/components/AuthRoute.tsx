
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';

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
  const { user, loading } = useAuth();
  
  console.info('AuthRoute rendering:', {
    requireAuth,
    requireAdmin,
    loading,
    authenticated: !!user,
    isAdmin: user?.isAdmin || false
  });

  // Show loading state when authentication is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin-slow text-primary">
          <div className="h-12 w-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full" />
        </div>
      </div>
    );
  }

  // Determine authentication state
  const authenticated = !!user;
  const isAdmin = user?.isAdmin ?? false;

  // Handle required authentication but user is not authenticated
  if (requireAuth && !authenticated) {
    console.info('Not authenticated, redirecting to sign-in');
    return <Navigate to="/sign-in" replace />;
  }

  // Handle required admin privileges but user is not admin
  if (requireAdmin && !isAdmin) {
    console.info('Not admin, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Handle public routes when user is already authenticated
  if (!requireAuth && authenticated) {
    console.info('Already authenticated, redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  // Render with layout for authenticated routes
  if (requireAuth) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }

  // Render without layout for public routes
  return <Outlet />;
};
