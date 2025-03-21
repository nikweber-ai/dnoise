
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { User } from '@/contexts/AuthContext';

export const usePasswordOperations = (
  user: User | null,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { t } = useTranslation();

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      toast.success(t(`Password reset link sent to ${email}`));
      setIsLoading(false);
      return true;
    } catch (error) {
      setError(t('Failed to send reset email. Please try again.'));
      toast.error(t('Failed to send reset email. Please try again.'));
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (token: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.updateUser({
        password
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      toast.success(t('Password has been reset successfully'));
      setIsLoading(false);
      return true;
    } catch (error) {
      setError(t('Password reset failed. Please try again.'));
      toast.error(t('Password reset failed. Please try again.'));
      setIsLoading(false);
      return false;
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      
      if (signInError) {
        setError(t('Current password is incorrect'));
        toast.error(t('Current password is incorrect'));
        setIsLoading(false);
        return false;
      }
      
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      toast.success(t('Password updated successfully'));
      setIsLoading(false);
      return true;
    } catch (error) {
      setError(t('Failed to update password. Please try again.'));
      toast.error(t('Failed to update password. Please try again.'));
      setIsLoading(false);
      return false;
    }
  };

  const updateEmail = async (currentPassword: string, newEmail: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword
      });
      
      if (signInError) {
        setError(t('Current password is incorrect'));
        toast.error(t('Current password is incorrect'));
        setIsLoading(false);
        return false;
      }
      
      const { data, error } = await supabase.auth.updateUser({
        email: newEmail
      });
      
      if (error) {
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ email: newEmail })
        .eq('id', user?.id);
      
      if (profileError) {
        console.error('Error updating email in profile:', profileError);
      }
      
      toast.success(t('Email updated successfully. Please check your new email to confirm the change.'));
      setIsLoading(false);
      return true;
    } catch (error) {
      setError(t('Failed to update email. Please try again.'));
      toast.error(t('Failed to update email. Please try again.'));
      setIsLoading(false);
      return false;
    }
  };

  return {
    forgotPassword,
    resetPassword,
    updatePassword,
    updateEmail,
  };
};
