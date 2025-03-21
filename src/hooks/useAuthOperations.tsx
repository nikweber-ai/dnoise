
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { User } from '@/contexts/AuthContext';

export const useAuthOperations = (
  user: User | null,
  setUser: (user: User | null) => void,
  setSession: (session: any) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { t } = useTranslation();

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      console.log(`Attempting to login with email: ${email}`);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        toast.error(t(error.message));
        setIsLoading(false);
        return false;
      }
      
      if (data.session) {
        console.log("Login successful:", !!data.user);
        
        // Fetch additional user profile if needed
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .maybeSingle();
            
          const isAdmin = profile?.is_admin || false;
          
          const newUser: User = {
            id: data.user.id,
            email: data.user.email || '',
            name: profile?.name || data.user.user_metadata?.name,
            isAdmin,
            apiKey: profile?.api_key || '',
            models: profile?.models || ['1', '2', '3', '4'],
            highlightColor: profile?.highlight_color || '#ff653a',
            creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            profileImage: profile?.profile_image || '/placeholder.svg'
          };
          
          setUser(newUser);
          setSession(data.session);
        }
        
        toast.success(t('Signed in successfully!'));
        return true;
      }
      
      setError(t('Login failed. No session returned.'));
      toast.error(t('Login failed. Please try again.'));
      return false;
    } catch (error: any) {
      console.error("Login exception:", error);
      setError(t('Login failed. Please try again.'));
      toast.error(t('Login failed. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    setError(null);
    
    try {
      console.log(`Attempting to register with email: ${email}`);
      setIsLoading(true);
      
      // Disable public registration (only admins can create users)
      toast.error(t('Public registration is disabled. Please contact an administrator.'));
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error("Registration exception:", error);
      setError(t('Registration failed. Please try again.'));
      toast.error(t('Registration failed. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

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

  // Function to create users (only for administrators)
  const createUser = async (email: string, password: string, name?: string, isAdmin: boolean = false): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast.error(t('Only administrators can create users'));
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, is_admin: isAdmin }
      });
      
      if (error) {
        console.error('Error creating user:', error);
        toast.error(t(error.message) || t('Failed to create user. Please try again.'));
        return false;
      }
      
      if (data.user) {
        // Create or update profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            name: name || '',
            is_admin: isAdmin,
            highlight_color: '#ff653a',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          toast.error(t('User created, but profile setup failed.'));
        }
      }
      
      toast.success(t('User created successfully'));
      return true;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(t('Failed to create user. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    register,
    logout,
    createUser,
    signIn: login,
    signUp: register,
    signOut: logout,
  };
};
