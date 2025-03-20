
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
  resetUserCredits: (userId: string, amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to check if credits should be reset based on system settings
  const checkCreditReset = () => {
    if (!user) return;
    
    try {
      // Get system settings from localStorage
      const settingsString = localStorage.getItem('systemSettings');
      if (!settingsString) return;
      
      const settings = JSON.parse(settingsString);
      if (!settings.creditRolloverEnabled) return;
      
      const now = new Date();
      const resetDay = settings.creditResetDay || 1;
      const monthlyCredits = settings.monthlyCredits || 0;
      
      // Create a date object for when credits should next reset
      const nextResetDate = new Date(user.creditsReset);
      
      // If it's time to reset credits
      if (now >= nextResetDate) {
        // Set the next reset date to be next month
        const newResetDate = new Date(now.getFullYear(), now.getMonth() + 1, resetDay);
        
        // Update the user with new credits and reset date
        const updatedUser = {
          ...user,
          credits: monthlyCredits,
          creditsReset: newResetDate.toISOString()
        };
        
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        toast.info(`Your credits have been reset to ${monthlyCredits}`);
      }
    } catch (error) {
      console.error('Error checking credit reset:', error);
    }
  };

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

  // Check for credit reset whenever the user object changes
  useEffect(() => {
    if (user) {
      checkCreditReset();
    }
  }, [user]);

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
        
        // Check credit reset before saving user
        const settingsString = localStorage.getItem('systemSettings');
        if (settingsString) {
          const settings = JSON.parse(settingsString);
          if (settings.creditRolloverEnabled) {
            const now = new Date();
            const resetDay = settings.creditResetDay || 1;
            
            // Set the next reset date to be this month or next month
            let nextResetDate = new Date(now.getFullYear(), now.getMonth(), resetDay);
            if (now > nextResetDate) {
              nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, resetDay);
            }
            
            userWithoutPassword.creditsReset = nextResetDate.toISOString();
          }
        }
        
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
      
      // Get default credits from system settings
      const settingsString = localStorage.getItem('systemSettings');
      let defaultCredits = 0;
      let nextResetDate = new Date();
      nextResetDate.setMonth(nextResetDate.getMonth() + 1);
      
      if (settingsString) {
        const settings = JSON.parse(settingsString);
        defaultCredits = settings.defaultCredits || 0;
        
        if (settings.creditRolloverEnabled) {
          const now = new Date();
          const resetDay = settings.creditResetDay || 1;
          
          // Set the next reset date
          nextResetDate = new Date(now.getFullYear(), now.getMonth(), resetDay);
          if (now > nextResetDate) {
            nextResetDate = new Date(now.getFullYear(), now.getMonth() + 1, resetDay);
          }
        }
      }
      
      // Create a new user with configured default credits
      const newUser = {
        id: Math.random().toString(36).substring(2, 11),
        email,
        isAdmin: false,
        credits: defaultCredits, 
        creditsReset: nextResetDate.toISOString(),
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

  // Admin function to reset a user's credits manually
  const resetUserCredits = async (userId: string, amount: number) => {
    if (!user?.isAdmin) {
      toast.error('Only administrators can reset user credits');
      return;
    }
    
    try {
      // In a real app, this would be an API call
      // For demo, we'll just update if it's the current user
      if (user.id === userId) {
        const updatedUser = {
          ...user,
          credits: amount
        };
        
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        toast.success(`Credits updated to ${amount}`);
      } else {
        // In a real app, this would update the credits of a different user
        toast.success(`Credits for user ${userId} updated to ${amount}`);
      }
    } catch (error) {
      console.error('Reset credits error:', error);
      toast.error('An error occurred while updating credits');
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
    resetUserCredits,
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
