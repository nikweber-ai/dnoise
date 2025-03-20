
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  Home,
  Image,
  Settings,
  History,
  Star,
  Users,
  LogOut,
  Sun,
  Moon,
  LucideIcon,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

type NavItemProps = {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
};

const NavItem = ({ to, icon: Icon, label, end }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          'group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors',
          'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground'
        )
      }
    >
      <Icon className="mr-2 h-4 w-4" />
      <span>{label}</span>
    </NavLink>
  );
};

export function Sidebar() {
  const { isAuthenticated, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const isMobile = useIsMobile();
  const location = useLocation();

  if (isMobile) return null;
  if (!isAuthenticated) return null;

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <aside className="flex h-screen w-60 flex-col border-r bg-sidebar-background">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-sidebar-primary">GenHub</h2>
        <p className="text-xs text-sidebar-foreground">AI Image Generator</p>
      </div>

      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          <p className="px-3 py-1 text-xs font-medium text-sidebar-foreground">Main</p>
          <NavItem to="/" icon={Home} label="Dashboard" end />
          <NavItem to="/generate" icon={Image} label="Generate" />
          <NavItem to="/history" icon={History} label="History" />
          <NavItem to="/favorites" icon={Star} label="Favorites" />
          <NavItem to="/profile" icon={Settings} label="Profile" />
        </div>

        {isAdmin && (
          <div className="mt-6 space-y-1">
            <p className="px-3 py-1 text-xs font-medium text-sidebar-foreground">
              Admin
            </p>
            <NavItem to="/admin/users" icon={Users} label="Users" />
            <NavItem to="/admin/models" icon={Layers} label="Models" />
            <NavItem to="/admin/settings" icon={Settings} label="Settings" />
          </div>
        )}
      </div>

      <div className="mt-auto p-4 border-t border-sidebar-border">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-sidebar-foreground">Theme</span>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full justify-start text-sidebar-foreground hover:text-sidebar-accent-foreground"
          onClick={() => signOut()}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Log out</span>
        </Button>
      </div>
    </aside>
  );
}
