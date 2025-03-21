
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { User } from '@/contexts/AuthContext';

export const useProfileImageUpdate = (
  user: User | null,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { t } = useTranslation();

  const updateProfileImage = async (imageUrl: string) => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .update({ profile_image: imageUrl })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile image:', error);
        setError(error.message);
        toast.error(t('Failed to update profile image'));
        return;
      }
      
      // Fix the type issue by properly handling the user update
      if (user) {
        const updatedUser: User = { ...user, profileImage: imageUrl };
        setUser(updatedUser);
      }
      
      toast.success(t('Profile image updated successfully'));
    } catch (error) {
      console.error('Error updating profile image:', error);
      setError((error as Error).message);
      toast.error(t('Failed to update profile image'));
    } finally {
      setIsLoading(false);
    }
  };

  return { updateProfileImage };
};
