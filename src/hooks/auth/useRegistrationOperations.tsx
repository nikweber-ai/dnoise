
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

export const useRegistrationOperations = (
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { t } = useTranslation();

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    setError(null);
    
    try {
      console.log(`Attempting to register with email: ${email}`);
      setIsLoading(true);
      
      // Disable public registration (only admins can create users)
      toast.error(t('Public registration is disabled. Please contact an administrator.'));
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error("Registration exception:", error);
      setError(t('Registration failed. Please try again.'));
      toast.error(t('Registration failed. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    register,
    signUp: register,
  };
};
