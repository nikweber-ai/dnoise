
import React from 'react';
import { AuthContext } from '@/contexts/AuthContext';
import { useAuthState } from '@/hooks/useAuthState';
import { useAuthOperations } from '@/hooks/useAuthOperations';
import { useProfileOperations } from '@/hooks/useProfileOperations';
import { usePasswordOperations } from '@/hooks/usePasswordOperations';
import { useAuthInitialization } from '@/hooks/auth/useAuthInitialization';

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
    retryInitialization,
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

  // Use the initialization hook for admin user and retry logic
  useAuthInitialization(error, user, isLoading, retryInitialization);

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
