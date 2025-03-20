
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/services/api';
import { toast } from 'sonner';

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
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  updateEmail: (currentPassword: string, newEmail: string) => Promise<boolean>;
  // Add these properties to match usage in components
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, name?: string) => Promise<boolean>;
  signOut: () => void;
  loading: boolean;
  error: string | null;
  creditsReset?: string;
  profileImage?: string;
  updateProfileImage: (imageUrl: string) => void;
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
            models: ['1', '2'],
            highlightColor: '#ff653a',
            creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            profileImage: '/placeholder.svg'
          };
          setUser(mockUser);
          localStorage.setItem('user', JSON.stringify(mockUser));
          resolve(true);
        } else if (email === 'admin@example.com' && password === 'admin123') { // Updated admin password
          const mockAdmin: User = {
            id: '2',
            email: 'admin@example.com',
            isAdmin: true,
            apiKey: 'r8_example_admin_api_key',
            models: ['1', '2', '3', '4'],
            highlightColor: '#ff653a',
            creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
            profileImage: '/placeholder.svg'
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
          models: ['1', '2'],
          highlightColor: '#ff653a',
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
        toast.success(`Password reset link sent to ${email}`);
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
        toast.success('Password has been reset successfully');
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
      toast.success('Profile updated successfully');
    }
  };

  const updateProfileImage = (imageUrl: string) => {
    if (user) {
      const updatedUser = { ...user, profileImage: imageUrl };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      toast.success('Profile image updated successfully');
    }
  };

  // New function to update password
  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if current password is correct - simplified for demo
        if (
          (user?.email === 'user@example.com' && currentPassword === 'password') ||
          (user?.email === 'admin@example.com' && currentPassword === 'admin')
        ) {
          // Password updated successfully
          toast.success('Password updated successfully');
          resolve(true);
        } else {
          setError('Current password is incorrect');
          toast.error('Current password is incorrect');
          resolve(false);
        }
        setIsLoading(false);
      }, 1000);
    });
  };

  // New function to update email
  const updateEmail = async (currentPassword: string, newEmail: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    return new Promise((resolve) => {
      setTimeout(() => {
        // Check if current password is correct - simplified for demo
        if (
          (user?.email === 'user@example.com' && currentPassword === 'password') ||
          (user?.email === 'admin@example.com' && currentPassword === 'admin')
        ) {
          // Update the user's email
          if (user) {
            const updatedUser = { ...user, email: newEmail };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            toast.success('Email updated successfully');
            resolve(true);
          } else {
            setError('User not found');
            toast.error('User not found');
            resolve(false);
          }
        } else {
          setError('Current password is incorrect');
          toast.error('Current password is incorrect');
          resolve(false);
        }
        setIsLoading(false);
      }, 1000);
    });
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
    updatePassword,
    updateEmail,
    updateProfileImage,
    // Alias functions to match component usage
    signIn: login,
    signUp: register,
    signOut: logout,
    loading: isLoading,
    error,
    creditsReset: user?.creditsReset,
    profileImage: user?.profileImage,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
