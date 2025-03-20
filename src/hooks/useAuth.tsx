
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  credits: number;
  creditsReset: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Authentication error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // For demo purposes, we'll use localStorage
  // In a real app, you would use a proper authentication system
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Demo authentication - in a real app, you would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock users for demonstration
      const mockUsers = [
        { id: '1', email: 'user@example.com', password: 'password', isAdmin: false, credits: 0, creditsReset: '2023-06-01' },
        { id: '2', email: 'admin@example.com', password: 'password', isAdmin: true, credits: 500, creditsReset: '2023-06-01' }
      ];
      
      const foundUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (foundUser) {
        const { password, ...userWithoutPassword } = foundUser;
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        setUser(userWithoutPassword);
        toast.success('Signed in successfully');
      } else {
        setError('Invalid email or password');
        toast.error('Invalid email or password');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      setError('An error occurred during sign in');
      toast.error('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Demo registration - in a real app, you would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new user with 0 credits
      const newUser = {
        id: Math.random().toString(36).substring(2, 11),
        email,
        isAdmin: false,
        credits: 0, // New users start with 0 credits
        creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      };
      
      localStorage.setItem('user', JSON.stringify(newUser));
      setUser(newUser);
      toast.success('Account created successfully');
    } catch (error) {
      console.error('Sign up error:', error);
      setError('An error occurred during registration');
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('An error occurred during sign out');
    }
  };

  const resetPassword = async (email: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // Demo password reset - in a real app, you would call an API
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Password reset email sent');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('An error occurred during password reset');
      toast.error('An error occurred during password reset');
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
