
import { useState } from 'react';
import { User } from '@/contexts/AuthContext';
import { useAuthSession } from './auth/useAuthSession';
import { useAuthTimeout } from './auth/useAuthTimeout';
import { useAuthRetry } from './auth/useAuthRetry';

export const useAuthState = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the retry hook
  const { initializationAttempts, retryInitialization } = useAuthRetry(error, user, isLoading);
  
  // Use the session hook
  const { session, setSession } = useAuthSession(setUser, setIsLoading, setError);
  
  // Use the timeout hook
  useAuthTimeout(isLoading, setIsLoading);

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
    retryInitialization,
  };
};
