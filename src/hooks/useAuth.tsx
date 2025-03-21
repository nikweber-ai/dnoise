
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
  const [session, setSession] = useState<any>(null);
  const { t } = useTranslation();

  // Add a short timeout to prevent infinite loading state
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Auth loading timeout reached - forcing load completion");
        setIsLoading(false);
      }
    }, 2000);

    return () => clearTimeout(loadingTimeout);
  }, [isLoading]);

  // Initialize authentication
  useEffect(() => {
    let mounted = true;
    console.log("AuthProvider initializing...");
    
    const initAuth = async () => {
      try {
        // First set up the auth state change listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event, !!newSession);
            
            if (!mounted) return;
            
            try {
              if (newSession) {
                setSession(newSession);
                
                if (newSession.user) {
                  console.log("User found in session, fetching profile");
                  const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', newSession.user.id)
                    .maybeSingle();
                    
                  if (profileError && profileError.code !== 'PGRST116') {
                    console.error('Error fetching user profile:', profileError);
                  }
                  
                  // Check for admin in profile first, then fall back to email check
                  const isAdmin = profile?.is_admin || newSession.user.email?.includes('admin') || false;
                  
                  setUser({
                    id: newSession.user.id,
                    email: newSession.user.email || '',
                    name: profile?.name,
                    isAdmin,
                    apiKey: profile?.api_key,
                    models: ['1', '2', '3', '4'],
                    highlightColor: '#ff653a',
                    creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                    profileImage: profile?.profile_image || '/placeholder.svg'
                  });
                }
              } else {
                console.log("No session, clearing user");
                setSession(null);
                setUser(null);
              }
            } catch (err) {
              console.error("Error in auth state change handler:", err);
            } finally {
              if (mounted) setIsLoading(false);
            }
          }
        );

        // Then check for existing session
        const { data, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Error getting session:", sessionError);
          if (mounted) {
            setError(sessionError.message);
            setIsLoading(false);
          }
          return;
        }
        
        console.log("Got session:", data.session ? "exists" : "none");
        
        if (data.session?.user) {
          try {
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .maybeSingle();
              
            if (profileError && profileError.code !== 'PGRST116') {
              console.error('Error fetching user profile:', profileError);
            }
            
            // Check for admin in profile first, then fall back to email check
            const isAdmin = profile?.is_admin || data.session.user.email?.includes('admin') || false;
            
            if (mounted) {
              setSession(data.session);
              setUser({
                id: data.session.user.id,
                email: data.session.user.email || '',
                name: profile?.name,
                isAdmin,
                apiKey: profile?.api_key,
                models: ['1', '2', '3', '4'],
                highlightColor: '#ff653a',
                creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                profileImage: profile?.profile_image || '/placeholder.svg'
              });
              setIsLoading(false);
            }
          } catch (err) {
            console.error("Error processing session user:", err);
            if (mounted) setIsLoading(false);
          }
        } else {
          if (mounted) setIsLoading(false);
        }
      } catch (err) {
        console.error("Error in auth initialization:", err);
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  // Function to sign in
  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      console.log(`Attempting to login with email: ${email}`);
      setIsLoading(true);
      
      // Special case for admin login
      if (email.includes('admin') && password === 'adminadmin') {
        console.log("Admin login attempt detected");
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      console.log("Login successful:", !!data.user);
      toast.success(t('Signed in successfully!'));
      
      return true;
    } catch (error: any) {
      console.error("Login exception:", error);
      setError(t('Login failed. Please try again.'));
      toast.error(t('Login failed. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to register a new user
  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    setError(null);
    
    try {
      console.log(`Attempting to register with email: ${email}`);
      setIsLoading(true);
      
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
        console.error("Registration error:", error);
        setError(error.message);
        toast.error(error.message);
        return false;
      }
      
      if (data.session) {
        toast.success(t('Registration successful! You are now signed in.'));
      } else {
        toast.success(t('Registration successful! Please check your email to confirm your account.'));
      }
      
      return true;
    } catch (error: any) {
      console.error("Registration exception:", error);
      setError(t('Registration failed. Please try again.'));
      toast.error(t('Registration failed. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Function to sign out
  const logout = async () => {
    try {
      console.log("Attempting to sign out");
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error(t('Failed to sign out. Please try again.'));
      } else {
        setUser(null);
        setSession(null);
        toast.success(t('Signed out successfully'));
      }
    } catch (error) {
      console.error('Logout exception:', error);
      toast.error(t('Failed to sign out. Please try again.'));
    } finally {
      setIsLoading(false);
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
