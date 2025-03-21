
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

export const useLogoutOperations = (
  setUser: (user: null) => void,
  setSession: (session: null) => void,
  setIsLoading: (loading: boolean) => void
) => {
  const { t } = useTranslation();

  const logout = async () => {
    try {
      console.log("Attempting to sign out");
      setIsLoading(true);
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Logout error:', error);
        toast.error(t('Failed to sign out. Please try again.'));
      } else {
        setUser(null);
        setSession(null);
        toast.success(t('Signed out successfully'));
      }
    } catch (error) {
      console.error('Logout exception:', error);
      toast.error(t('Failed to sign out. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return {
    logout,
    signOut: logout,
  };
};
