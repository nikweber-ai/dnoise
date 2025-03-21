import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    console.log("Auth provider initializing...");
    
    const initAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        console.log("Initial session check:", data.session ? "Session found" : "No session");
        
        if (!data.session) {
          console.log("No initial session, setting loading to false");
          setIsLoading(false);
          return;
        }
        
        await refreshUserData(data.session);
      } catch (error) {
        console.error("Error during auth initialization:", error);
        setIsLoading(false);
      }
    };
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        
        if (session) {
          await refreshUserData(session);
        } else {
          console.log("No session in state change, clearing user");
          setUser(null);
          setIsLoading(false);
        }
      }
    );
    
    initAuth();
    
    return () => {
      console.log("Auth provider cleanup");
      subscription.unsubscribe();
    };
  }, []);
  
  const refreshUserData = async (session: any) => {
    try {
      if (!session?.user) {
        setUser(null);
        setIsLoading(false);
        return;
      }
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', profileError);
      }
      
      const isAdmin = session.user.email?.includes('admin') || false;
      
      const userData = {
        id: session.user.id,
        email: session.user.email || '',
        name: profile?.name,
        isAdmin,
        apiKey: profile?.api_key,
        models: ['1', '2', '3', '4'], // Default models
        highlightColor: '#ff653a',
        creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        profileImage: profile?.profile_image || '/placeholder.svg'
      };
      
      console.log("Setting user data:", userData);
      setUser(userData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error processing user data:", error);
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log("Attempting login for:", email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error.message);
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      console.log("Login successful");
      return true;
    } catch (error) {
      console.error("Login exception:", error);
      setError(t('Login failed. Please try again.'));
      toast.error(t('Login failed. Please try again.'));
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      toast.success(t('Registration successful! Please check your email to confirm your account.'));
      setIsLoading(false);
      return true;
    } catch (error) {
      setError(t('Registration failed. Please try again.'));
      toast.error(t('Registration failed. Please try again.'));
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      toast.success(t(`Password reset link sent to ${email}`));
      setIsLoading(false);
      return true;
    } catch (error) {
      setError(t('Failed to send reset email. Please try again.'));
      toast.error(t('Failed to send reset email. Please try again.'));
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      toast.success(t('Password has been reset successfully'));
      setIsLoading(false);
      return true;
    } catch (error) {
      setError(t('Password reset failed. Please try again.'));
      toast.error(t('Password reset failed. Please try again.'));
      setIsLoading(false);
      return false;
    }
  };

  const updateCurrentUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          api_key: userData.apiKey,
          profile_image: userData.profileImage
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast.error(t('Failed to update profile'));
        return;
      }
      
      setUser(prev => prev ? { ...prev, ...userData } : null);
      toast.success(t('Profile updated successfully'));
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(t('Failed to update profile'));
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ profile_image: imageUrl })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile image:', error);
        toast.error(t('Failed to update profile image'));
        return;
      }
      
      setUser(prev => prev ? { ...prev, profileImage: imageUrl } : null);
      toast.success(t('Profile image updated successfully'));
    } catch (error) {
      console.error('Error updating profile image:', error);
      toast.error(t('Failed to update profile image'));
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      
      if (signInError) {
        setError(t('Current password is incorrect'));
        toast.error(t('Current password is incorrect'));
        setIsLoading(false);
        return false;
      }
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      toast.success(t('Password updated successfully'));
      setIsLoading(false);
      return true;
    } catch (error) {
      setError(t('Failed to update password. Please try again.'));
      toast.error(t('Failed to update password. Please try again.'));
      setIsLoading(false);
      return false;
    }
  };

  const updateEmail = async (currentPassword: string, newEmail: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      
      if (signInError) {
        setError(t('Current password is incorrect'));
        toast.error(t('Current password is incorrect'));
        setIsLoading(false);
        return false;
      }
      
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', user?.id);
      
      if (profileError) {
        console.error('Error updating email in profile:', profileError);
      }
      
      toast.success(t('Email updated successfully. Please check your new email to confirm the change.'));
      setIsLoading(false);
      return true;
    } catch (error) {
      setError(t('Failed to update email. Please try again.'));
      toast.error(t('Failed to update email. Please try again.'));
      setIsLoading(false);
      return false;
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
    updatePassword,
    updateEmail,
    updateProfileImage,
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
