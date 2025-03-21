
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" className="mt-[-100px]" />
      </div>
    );
  }

  const authenticated = !!user;
  
  console.log("Auth status:", { authenticated, isAdmin, redirectTo });
  
  if (requireAuth && !authenticated) {
    console.log("Not authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAdmin && !isAdmin) {
    console.log("Not admin, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAuth && authenticated) {
    console.log("Already authenticated, redirecting to:", redirectTo);
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAuth) {
    return (
      <Layout>
        <Outlet />
      </Layout>
    );
  }

  return <Outlet />;
};
