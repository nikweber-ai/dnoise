
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { User } from '@/contexts/AuthContext';

export const useProfileOperations = (
  user: User | null,
  setUser: (user: User | null) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { t } = useTranslation();

  const updateCurrentUser = async (userData: Partial<User>) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          api_key: userData.apiKey,
          highlight_color: userData.highlightColor,
          profile_image: userData.profileImage
        })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        toast.error(t('Failed to update profile'));
        return;
      }
      
      // Fix the type issue by properly handling the user update
      if (user) {
        const updatedUser: User = { ...user, ...userData };
        setUser(updatedUser);
      }
      
      toast.success(t('Profile updated successfully'));
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error(t('Failed to update profile'));
    }
  };

  const updateProfileImage = async (imageUrl: string) => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ profile_image: imageUrl })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile image:', error);
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
      toast.error(t('Failed to update profile image'));
    }
  };

  return {
    updateCurrentUser,
    updateProfileImage,
  };
};
