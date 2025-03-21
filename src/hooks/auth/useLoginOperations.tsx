
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { User } from '@/contexts/AuthContext';

export const useLoginOperations = (
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
      
      // Clear previous sessions to prevent conflicts
      await supabase.auth.signOut();
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
        options: {
          // Ensure session is persisted properly
          session: {
            persistSession: true,
          }
        }
      });
      
      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        
        // Try to provide more helpful error messages
        if (error.message.includes('Invalid login credentials')) {
          toast.error(t('Email or password is incorrect. Please try again.'));
        } else {
          toast.error(t('Login failed: ') + error.message);
        }
        
        setIsLoading(false);
        return false;
      }
      
      if (data.session) {
        console.log("Login successful, session found:", !!data.session);
        
        try {
          // Fetch additional user profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user?.id)
            .maybeSingle();
            
          if (profileError) {
            console.error('Error fetching user profile:', profileError);
            // Continue anyway with basic info
          }
          
          // Create user object using available data
          const newUser: User = {
            id: data.user?.id || '',
            email: data.user?.email || '',
            name: profile?.name || data.user?.user_metadata?.name || '',
            isAdmin: profile?.is_admin || false,
            apiKey: profile?.api_key || '',
            models: profile?.models || ['1', '2', '3', '4'],
            highlightColor: profile?.highlight_color || '#ff653a',
            creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
            profileImage: profile?.profile_image || '/placeholder.svg'
          };
          
          setUser(newUser);
          setSession(data.session);
          
          toast.success(t('Signed in successfully!'));
          return true;
        } catch (err) {
          console.error('Error processing profile data:', err);
          
          // Set minimal user data if profile retrieval fails
          if (data.user) {
            const basicUser: User = {
              id: data.user.id,
              email: data.user.email || '',
              isAdmin: false,
              models: ['1', '2', '3', '4'],
              highlightColor: '#ff653a',
              creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
              profileImage: '/placeholder.svg'
            };
            
            setUser(basicUser);
            setSession(data.session);
            toast.success(t('Signed in successfully!'));
            return true;
          }
        }
      }
      
      // No valid session returned
      setError(t('Login failed. No valid session returned.'));
      toast.error(t('Login failed. Please try again later.'));
      return false;
    } catch (error: any) {
      console.error("Login exception:", error);
      setError(typeof error === 'string' ? error : error?.message || t('Unknown error during login'));
      toast.error(t('Login failed due to an unexpected error. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    login,
    signIn: login,
  };
};
