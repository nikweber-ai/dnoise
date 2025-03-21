
import React from 'react';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin-slow text-primary">
          <div className="h-12 w-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full" />
        </div>
        <span className="ml-3 text-primary font-medium">{t('Loading')}...</span>
      </div>
    );
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
