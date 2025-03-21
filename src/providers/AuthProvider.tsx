
import React, { useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useProfileOperations } from '@/hooks/useProfileOperations';
import { usePasswordOperations } from '@/hooks/usePasswordOperations';
import { supabase } from '@/integrations/supabase/client';

// Function to ensure admin user exists
const ensureAdminUserExists = async () => {
  try {
    // Check if admin user exists
    const { data: adminUsers, error } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('is_admin', true)
      .limit(1);
      
    if (error) {
      console.error('Error checking for admin users:', error);
      return;
    }
    
    // If no admin users exist and we're in development, create one
    if ((!adminUsers || adminUsers.length === 0) && (import.meta.env.DEV || import.meta.env.MODE === 'development')) {
      console.log('No admin users found, attempting to create one...');
      
      // Create admin user with credentials from environment or use defaults
      const adminEmail = 'admin@example.com';
      const adminPassword = 'admin123';
      
      const { data, error: createError } = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: adminPassword,
        email_confirm: true,
        user_metadata: { name: 'Admin', is_admin: true }
      });
      
      if (createError) {
        console.error('Error creating admin user:', createError);
        return;
      }
      
      if (data.user) {
        // Create admin profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: adminEmail,
            name: 'Admin',
            is_admin: true,
            highlight_color: '#ff653a',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (profileError) {
          console.error('Error creating admin profile:', profileError);
        } else {
          console.log('Admin user created successfully');
        }
      }
    }
  } catch (err) {
    console.error('Error in ensureAdminUserExists:', err);
  }
};

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    user,
    setUser,
    isLoading,
    setIsLoading,
    error,
    setError,
    session,
    setSession,
    isAuthenticated,
    isAdmin,
    creditsReset,
    profileImage,
  } = useAuthState();

  const { login, register, logout, signIn, signUp, signOut, createUser } = useAuthOperations(
    user,
    setUser,
    setSession,
    setIsLoading,
    setError
  );

  const { updateCurrentUser, updateProfileImage } = useProfileOperations(
    user,
    setUser,
    setIsLoading,
    setError
  );

  const { forgotPassword, resetPassword, updatePassword, updateEmail } = usePasswordOperations(
    user,
    setIsLoading,
    setError
  );

  // Call ensureAdminUserExists on mount if in development mode
  useEffect(() => {
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      ensureAdminUserExists();
    }
  }, []);

  const value = {
    user,
    login,
    logout,
    register,
    isAuthenticated,
    isLoading,
    isAdmin,
    forgotPassword,
    resetPassword,
    updateCurrentUser,
    updatePassword,
    updateEmail,
    updateProfileImage,
    signIn,
    signUp,
    signOut,
    loading: isLoading,
    error,
    creditsReset,
    profileImage,
    createUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
