
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/contexts/AuthContext';

export const useAuthSession = (
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const [session, setSession] = useState<any>(null);

  // Initialize auth session listener
  useEffect(() => {
    let mounted = true;
    console.log("Auth session listener initializing...");
    
    const initAuthListener = async () => {
      try {
        // Set up the auth state change listener FIRST
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            console.log("Auth state changed:", event, !!newSession);
            
            if (!mounted) return;
            
            try {
              if (newSession) {
                setSession(newSession);
                await fetchUserProfile(newSession);
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

        // THEN check for existing session
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
            setSession(data.session);
            await fetchUserProfile(data.session);
          } catch (err) {
            console.error("Error processing session user:", err);
            if (mounted) {
              // Set basic user info even if profile fetch fails
              setSession(data.session);
              createBasicUserFromSession(data.session);
              setIsLoading(false);
            }
          }
        } else {
          if (mounted) setIsLoading(false);
        }

        // Return the subscription for cleanup
        return authListener.subscription;
      } catch (err) {
        console.error("Error in auth initialization:", err);
        if (mounted) {
          setError("Authentication initialization failed. Please try again.");
          setIsLoading(false);
        }
        return null;
      }
    };

    // Execute auth listener initialization
    const cleanupPromise = initAuthListener();

    // Return cleanup function for useEffect
    return () => {
      mounted = false;
      
      // Handle cleanup for the subscription
      cleanupPromise.then(subscription => {
        if (subscription) {
          subscription.unsubscribe();
        }
      }).catch(err => {
        console.error("Error in cleanup:", err);
      });
    };
  }, [setUser, setIsLoading, setError]);

  // Helper function to fetch user profile
  const fetchUserProfile = async (currentSession: any) => {
    if (!currentSession?.user) return;
    
    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentSession.user.id)
        .maybeSingle();
        
      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Error fetching user profile:', profileError);
        // Continue anyway with basic user info
      }
      
      const newUser = {
        id: currentSession.user.id,
        email: currentSession.user.email || '',
        name: profile?.name || currentSession.user.user_metadata?.name || '',
        isAdmin: profile?.is_admin || false,
        apiKey: profile?.api_key || '',
        models: profile?.models || ['1', '2', '3', '4'],
        highlightColor: profile?.highlight_color || '#ff653a',
        creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        profileImage: profile?.profile_image || '/placeholder.svg'
      };
      
      setUser(newUser);
      setIsLoading(false);
    } catch (err) {
      console.error("Error in profile fetching:", err);
      createBasicUserFromSession(currentSession);
    }
  };

  // Helper function to create basic user object when profile fetch fails
  const createBasicUserFromSession = (currentSession: any) => {
    if (!currentSession?.user) return;
    
    const newUser = {
      id: currentSession.user.id,
      email: currentSession.user.email || '',
      isAdmin: false,
      models: ['1', '2', '3', '4'],
      highlightColor: '#ff653a',
      creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      profileImage: '/placeholder.svg'
    };
    setUser(newUser);
    setIsLoading(false);
  };

  return {
    session,
    setSession
  };
};
