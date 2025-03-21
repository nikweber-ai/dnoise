
import { User } from '@/contexts/AuthContext';
import { useLoginOperations } from './auth/useLoginOperations';
import { useRegistrationOperations } from './auth/useRegistrationOperations';
import { useLogoutOperations } from './auth/useLogoutOperations';
import { useUserCreationOperations } from './auth/useUserCreationOperations';

export const useAuthOperations = (
  user: User | null,
  setUser: (user: User | null) => void,
  setSession: (session: any) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  // Login operations
  const { login, signIn } = useLoginOperations(
    setUser,
    setSession,
    setIsLoading,
    setError
  );

  // Registration operations
  const { register, signUp } = useRegistrationOperations(
    setIsLoading,
    setError
  );

  // Logout operations
  const { logout, signOut } = useLogoutOperations(
    setUser,
    setSession,
    setIsLoading
  );

  // User creation operations
  const { createUser } = useUserCreationOperations(
    user,
    setIsLoading
  );

  return {
    login,
    register,
    logout,
    createUser,
    signIn,
    signUp,
    signOut,
  };
};
