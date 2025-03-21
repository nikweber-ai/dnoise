
import React, { createContext, useContext } from 'react';

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  apiKey?: string;
  models?: string[];
  highlightColor?: string;
  creditsReset?: string;
  profileImage?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  updateCurrentUser: (userData: Partial<User>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateEmail: (currentPassword: string, newEmail: string) => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signOut: () => void;
  loading: boolean;
  error: string | null;
  creditsReset?: string;
  profileImage?: string;
  updateProfileImage: (imageUrl: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type { User };
