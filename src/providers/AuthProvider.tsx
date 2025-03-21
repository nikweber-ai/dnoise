
import React, { useEffect } from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useProfileOperations } from '@/hooks/useProfileOperations';
import { usePasswordOperations } from '@/hooks/usePasswordOperations';

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

  // Since we've now integrated with Supabase, we don't need to check for demo users anymore
  // as they will be stored in Supabase instead

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
