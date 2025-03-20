
import React from 'react';
import { NavBar } from '@/components/NavBar';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <NavBar onToggleSidebar={toggleSidebar} />
      <div className="flex flex-1 overflow-hidden">
        {user && (
          <Sidebar isOpen={sidebarOpen} />
        )}
        <main 
          className={cn(
            "flex-1 transition-all duration-300 ease-in-out px-4 py-6 md:px-8 overflow-auto",
            user && sidebarOpen ? "md:ml-64" : ""
          )}
        >
          <div className="fade-in-element max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
