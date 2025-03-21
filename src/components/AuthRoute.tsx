
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" className="mt-[-100px]" />
      </div>
    );
  }

  const authenticated = !!user;
  
  if (requireAuth && !authenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAuth && authenticated) {
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
