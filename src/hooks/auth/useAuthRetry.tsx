
import { useState, useEffect } from 'react';

export const useAuthRetry = (
  error: string | null,
  user: any | null,
  isLoading: boolean
) => {
  const [initializationAttempts, setInitializationAttempts] = useState(0);

  // Retry authentication if there's an error
  useEffect(() => {
    if (error && !user && !isLoading) {
      const timer = setTimeout(() => {
        console.log('Retrying authentication due to error:', error);
        setInitializationAttempts(prev => prev + 1);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, user, isLoading]);

  const retryInitialization = () => {
    setInitializationAttempts(prev => prev + 1);
  };

  return {
    initializationAttempts,
    retryInitialization
  };
};
