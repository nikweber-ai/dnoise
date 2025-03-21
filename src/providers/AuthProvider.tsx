
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

  // Check for existing demo user in localStorage on component mount
  useEffect(() => {
    if (!user) {
      const storedUser = localStorage.getItem('demoUser');
      const storedSession = localStorage.getItem('demoSession');
      
      if (storedUser && storedSession) {
        try {
          const parsedUser = JSON.parse(storedUser);
          const parsedSession = JSON.parse(storedSession);
          
          // Only set if we have valid data
          if (parsedUser && parsedUser.id && parsedUser.email) {
            setUser(parsedUser);
            setSession(parsedSession);
            console.log('Restored user session from localStorage:', parsedUser.email);
          }
        } catch (error) {
          console.error('Error parsing stored user data:', error);
          // Clean up corrupted data
          localStorage.removeItem('demoUser');
          localStorage.removeItem('demoSession');
        }
      }
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
