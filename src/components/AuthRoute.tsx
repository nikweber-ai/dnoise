
import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/Layout';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  const { user, loading, isAdmin } = useAuth();
  
  console.log("AuthRoute rendering:", { requireAuth, requireAdmin, loading, user: !!user, isAdmin });

  // Show loading spinner while authentication state is being determined
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" className="mt-[-100px]" />
      </div>
    );
  }

  const authenticated = !!user;
  
  // Handle authentication redirects
  if (requireAuth && !authenticated) {
    console.log("Not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  if (!requireAuth && authenticated) {
    console.log("Already authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log("Not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // Render the appropriate layout
  if (requireAuth) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }

  return <Outlet />;
};
