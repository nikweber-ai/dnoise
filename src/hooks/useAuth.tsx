
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/services/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (email: string, password: string, name?: string) => Promise<boolean>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, password: string) => Promise<boolean>;
  updateCurrentUser: (userData: Partial<User>) => void;
  // Add these properties to match usage in components
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signOut: () => void;
  loading: boolean;
  error: string | null;
  creditsReset?: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const getStoredUser = (): User | null => {
  try {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  } catch (error) {
    console.error('Failed to parse user from localStorage', error);
    localStorage.removeItem('user');
    return null;
  }
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedUser = getStoredUser();
    setUser(storedUser);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    // Mock authentication
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'user@example.com' && password === 'password') {
          const mockUser: User = {
            id: '1',
            email: 'user@example.com',
            isAdmin: false,
            credits: 100,
            models: ['1', '2'],
            creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          };
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          resolve(true);
        } else if (email === 'admin@example.com' && password === 'admin') {
          const mockAdmin: User = {
            id: '2',
            email: 'admin@example.com',
            isAdmin: true,
            apiKey: 'r8_example_admin_api_key',
            credits: 1000,
            models: ['1', '2', '3', '4'],
            creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
          };
          setUser(mockAdmin);
          localStorage.setItem('user', JSON.stringify(mockAdmin));
          resolve(true);
        } else {
          setError('Invalid email or password');
          resolve(false);
        }
        setIsLoading(false);
      }, 1000);
    });
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    // Mock registration
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '3',
          email: email,
          name: name,
          isAdmin: false,
          credits: 100,
          models: ['1', '2'],
          creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days from now
        };
        setUser(mockUser);
        localStorage.setItem('user', JSON.stringify(mockUser));
        resolve(true);
        setIsLoading(false);
      }, 1000);
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    // Mock forgot password
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Forgot password email sent to:', email);
        resolve(true);
        setIsLoading(false);
      }, 1000);
    });
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    // Mock reset password
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Password reset with token:', token, 'and new password:', password);
        resolve(true);
        setIsLoading(false);
      }, 1000);
    });
  };

  const updateCurrentUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.isAdmin || false,
    forgotPassword,
    resetPassword,
    updateCurrentUser,
    // Alias functions to match component usage
    signIn: login,
    signUp: register,
    signOut: logout,
    loading: isLoading,
    error,
    creditsReset: user?.creditsReset,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
