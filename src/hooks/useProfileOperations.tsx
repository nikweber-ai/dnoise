
import { User } from '@/contexts/AuthContext';
import { useProfileUpdate } from './profile/useProfileUpdate';
import { useProfileImageUpdate } from './profile/useProfileImageUpdate';

export const useProfileOperations = (
  user: User | null,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { updateCurrentUser } = useProfileUpdate(
    user,
    setUser,
    setIsLoading,
    setError
  );

  const { updateProfileImage } = useProfileImageUpdate(
    user,
    setUser,
    setIsLoading,
    setError
  );

  return {
    updateCurrentUser,
    updateProfileImage,
  };
};
