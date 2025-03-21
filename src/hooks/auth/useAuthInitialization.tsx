
import { useEffect } from 'react';
import { ensureAdminUserExists } from '@/utils/adminUserUtils';
import { User } from '@/contexts/AuthContext';

export const useAuthInitialization = (
  error: string | null,
  user: User | null,
  isLoading: boolean,
  retryInitialization: () => void
) => {
  // Run admin user check on mount if in development mode
  useEffect(() => {
    if (import.meta.env.DEV || import.meta.env.MODE === 'development') {
      ensureAdminUserExists().catch(err => {
        console.error('Error ensuring admin user exists:', err);
      });
    }
  }, []);

  // Retry authentication if there's an error
  useEffect(() => {
    if (error && !user && !isLoading) {
      const timer = setTimeout(() => {
        console.log('Retrying authentication due to error:', error);
        retryInitialization();
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [error, user, isLoading, retryInitialization]);
};
