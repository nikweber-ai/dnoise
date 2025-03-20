
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, PlusCircle, History, User, UserPlus, Settings, LayoutDashboard } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const location = useLocation();
  const { user } = useAuth();

  const isActiveRoute = (path: string) => {
    return location.pathname === path;
  };

  const menuItems = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      name: "Generate",
      icon: <PlusCircle size={20} />,
      path: "/generate",
    },
    {
      name: "History",
      icon: <History size={20} />,
      path: "/history",
    },
    {
      name: "Profile",
      icon: <User size={20} />,
      path: "/profile",
    },
  ];

  const adminItems = [
    {
      name: "User Management",
      icon: <UserPlus size={20} />,
      path: "/admin/users",
    },
    {
      name: "Settings",
      icon: <Settings size={20} />,
      path: "/admin/settings",
    },
  ];

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 z-30 flex h-[calc(100vh-4rem)] w-64 flex-col border-r bg-sidebar transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-16"
      )}
    >
      <div className="flex flex-col flex-1 overflow-y-auto py-6 px-3">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                isActiveRoute(item.path)
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <span className="flex items-center justify-center">{item.icon}</span>
              <span className={cn("ml-3 transition-opacity", isOpen ? "opacity-100" : "opacity-0 md:invisible")}>
                {item.name}
              </span>
            </Link>
          ))}

          {user?.isAdmin && (
            <>
              <div className={cn("mt-6 mb-2 px-3 text-xs font-semibold text-sidebar-foreground/60", 
                isOpen ? "block" : "hidden md:hidden")}>
                Admin
              </div>
              {adminItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                    isActiveRoute(item.path)
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )}
                >
                  <span className="flex items-center justify-center">{item.icon}</span>
                  <span className={cn("ml-3 transition-opacity", isOpen ? "opacity-100" : "opacity-0 md:invisible")}>
                    {item.name}
                  </span>
                </Link>
              ))}
            </>
          )}
        </nav>
      </div>
    </aside>
  );
};
