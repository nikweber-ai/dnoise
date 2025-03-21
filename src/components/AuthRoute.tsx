
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin-slow text-primary">
          <div className="h-12 w-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const authenticated = !!user;
  const isAdmin = user?.isAdmin ?? false;

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
