
import { User } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';

export const useUserCreationOperations = (
  user: User | null,
  setIsLoading: (loading: boolean) => void
) => {
  const { t } = useTranslation();

  // Function to create users (only for administrators)
  const createUser = async (email: string, password: string, name?: string, isAdmin: boolean = false): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast.error(t('Only administrators can create users'));
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Create user in Supabase Auth
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { name, is_admin: isAdmin }
      });
      
      if (error) {
        console.error('Error creating user:', error);
        toast.error(t(error.message) || t('Failed to create user. Please try again.'));
        return false;
      }
      
      if (data.user) {
        // Create or update profile record
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: data.user.id,
            email: data.user.email,
            name: name || '',
            is_admin: isAdmin,
            highlight_color: '#ff653a',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
        if (profileError) {
          console.error('Error creating user profile:', profileError);
          toast.error(t('User created, but profile setup failed.'));
        }
      }
      
      toast.success(t('User created successfully'));
      return true;
    } catch (error: any) {
      console.error('Error creating user:', error);
      toast.error(t('Failed to create user. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createUser
  };
};
