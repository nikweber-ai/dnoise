
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import LoadingSpinner from '@/components/LoadingSpinner';
import { Navigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  
  console.log("Layout rendering:", { loading, user: !!user });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <LoadingSpinner size="lg" className="mt-[-100px]" />
      </div>
    );
  }

  if (!user) {
    console.log("No user in Layout, redirecting to sign-in");
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out px-4 py-24 md:px-8 overflow-auto",
            "md:ml-64"
          )}
        >
          <div className="fade-in-element max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
