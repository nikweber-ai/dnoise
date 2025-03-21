
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/contexts/AuthContext';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [session, setSession] = useState<any>(null);

  // Add a short timeout to prevent infinite loading state
  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      if (isLoading) {
        console.log("Auth loading timeout reached - forcing load completion");
        setIsLoading(false);
      }
    }, 3000);

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
                  try {
                    const { data: profile, error: profileError } = await supabase
                      .from('profiles')
                      .select('*')
                      .eq('id', newSession.user.id)
                      .maybeSingle();
                      
                    if (profileError && profileError.code !== 'PGRST116') {
                      console.error('Error fetching user profile:', profileError);
                    }
                    
                    const isAdmin = profile?.is_admin || false;
                    
                    const newUser = {
                      id: newSession.user.id,
                      email: newSession.user.email || '',
                      name: profile?.name || newSession.user.user_metadata?.name || '',
                      isAdmin,
                      apiKey: profile?.api_key || '',
                      models: profile?.models || ['1', '2', '3', '4'],
                      highlightColor: profile?.highlight_color || '#ff653a',
                      creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                      profileImage: profile?.profile_image || '/placeholder.svg'
                    };
                    
                    setUser(newUser);
                  } catch (err) {
                    console.error("Error in profile fetching:", err);
                    // Set basic user info even if profile fetch fails
                    const newUser = {
                      id: newSession.user.id,
                      email: newSession.user.email || '',
                      isAdmin: false,
                      models: ['1', '2', '3', '4'],
                      highlightColor: '#ff653a',
                      creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                      profileImage: '/placeholder.svg'
                    };
                    setUser(newUser);
                  }
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
              // Continue anyway with basic user info
            }
            
            const isAdmin = profile?.is_admin || false;
            
            if (mounted) {
              setSession(data.session);
              const newUser = {
                id: data.session.user.id,
                email: data.session.user.email || '',
                name: profile?.name || data.session.user.user_metadata?.name || '',
                isAdmin,
                apiKey: profile?.api_key || '',
                models: profile?.models || ['1', '2', '3', '4'],
                highlightColor: profile?.highlight_color || '#ff653a',
                creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                profileImage: profile?.profile_image || '/placeholder.svg'
              };
              
              setUser(newUser);
              setIsLoading(false);
            }
          } catch (err) {
            console.error("Error processing session user:", err);
            if (mounted) {
              // Set basic user info even if profile fetch fails
              setSession(data.session);
              const newUser = {
                id: data.session.user.id,
                email: data.session.user.email || '',
                isAdmin: false,
                models: ['1', '2', '3', '4'],
                highlightColor: '#ff653a',
                creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                profileImage: '/placeholder.svg'
              };
              setUser(newUser);
              setIsLoading(false);
            }
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

  return {
    user,
    setUser,
    isLoading,
    setIsLoading,
    error,
    setError,
    session,
    setSession,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
    creditsReset: user?.creditsReset,
    profileImage: user?.profileImage,
  };
};
