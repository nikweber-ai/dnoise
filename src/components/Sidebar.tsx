
import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
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
  User,
  ImageIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';

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
  const { user, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/sign-in');
  };

  const getUserInitials = () => {
    if (!user?.name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return user.name.charAt(0).toUpperCase();
  };

  if (!user) {
    return null;
  }

  // Get system settings for app name with localStorage persistence
  const getSystemSettings = () => {
    const settings = localStorage.getItem('appSettings');
    if (settings) {
      return JSON.parse(settings);
    }
    
    // Default settings
    const defaultSettings = { appName: 'GenHub', logoUrl: null };
    
    // Save default settings to localStorage if not set
    localStorage.setItem('appSettings', JSON.stringify(defaultSettings));
    
    return defaultSettings;
  };
  
  const systemSettings = getSystemSettings();
  const appName = systemSettings.appName || 'GenHub';
  const logoUrl = systemSettings.logoUrl;

  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <aside className="fixed h-screen w-64 flex-col border-r bg-sidebar-background flex">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {logoUrl ? (
            <img src={logoUrl} alt="Logo" className="h-6 w-6 object-contain" />
          ) : (
            <ImageIcon className="h-5 w-5 text-sidebar-primary" />
          )}
          <h2 className="text-xl font-semibold text-sidebar-primary">{appName}</h2>
        </div>
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

      <div className="flex-1 px-3 py-2">
        <div className="space-y-1">
          <p className="px-3 py-1 text-xs font-medium text-sidebar-foreground">Main</p>
          <NavItem to="/" icon={Home} label="Dashboard" end />
          <NavItem to="/generate" icon={Image} label="Generate" />
          <NavItem to="/history" icon={History} label="History" />
          <NavItem to="/favorites" icon={Star} label="Favorites" />
          <NavItem to="/profile" icon={User} label="Profile" />
        </div>

        {user.isAdmin && (
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="w-full justify-between">
              <div className="flex items-center">
                <Avatar className="h-8 w-8 mr-2">
                  {user.profileImage ? (
                    <AvatarImage src={user.profileImage} alt={user.name || user.email || 'User'} />
                  ) : (
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {getUserInitials()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <span className="text-sm truncate">{user.name || user.email}</span>
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="flex items-center justify-start gap-2 p-2">
              <div className="flex flex-col space-y-1 leading-none">
                {user.name && (
                  <p className="font-medium">{user.name}</p>
                )}
                {user.email && (
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                )}
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <NavLink to="/profile" className="cursor-pointer flex w-full items-center">
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </NavLink>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
