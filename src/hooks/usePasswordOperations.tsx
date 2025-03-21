
import { User } from '@/contexts/AuthContext';
import { usePasswordReset } from './password/usePasswordReset';
import { useCredentialUpdate } from './password/useCredentialUpdate';

export const usePasswordOperations = (
  user: User | null,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { forgotPassword, resetPassword } = usePasswordReset(
    setIsLoading,
    setError
  );

  const { updatePassword, updateEmail } = useCredentialUpdate(
    user,
    setIsLoading,
    setError
  );

  return {
    forgotPassword,
    resetPassword,
    updatePassword,
    updateEmail,
  };
};
