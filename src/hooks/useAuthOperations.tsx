
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { User } from '@/contexts/AuthContext';

export const useAuthOperations = (
  user: User | null,
  setUser: (user: User | null) => void,
  setSession: (session: any) => void,
  setIsLoading: (loading: boolean) => void,
  setError: (error: string | null) => void
) => {
  const { t } = useTranslation();

  const login = async (email: string, password: string): Promise<boolean> => {
    setError(null);
    
    try {
      console.log(`Attempting to login with email: ${email}`);
      setIsLoading(true);
      
      // Special case for admin login with hardcoded credentials
      if (email === 'admin@example.com' && password === 'admin123') {
        console.log("Admin login detected");
        
        // For demo admin, set a mock user directly
        const adminUser: User = {
          id: 'admin-id',
          email: 'admin@example.com',
          name: 'Admin User',
          isAdmin: true,
          apiKey: '',
          models: ['1', '2', '3', '4'],
          highlightColor: '#ff653a',
          creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          profileImage: '/placeholder.svg'
        };
        
        // Create a mock session
        const mockSession = {
          access_token: 'mock-access-token',
          refresh_token: 'mock-refresh-token',
          expires_at: Date.now() + 3600000, // 1 hour from now
          user: {
            id: adminUser.id,
            email: adminUser.email
          }
        };
        
        setUser(adminUser);
        setSession(mockSession);
        
        // Store in localStorage for persistence
        localStorage.setItem('demoUser', JSON.stringify(adminUser));
        localStorage.setItem('demoSession', JSON.stringify(mockSession));
        
        setIsLoading(false);
        toast.success(t('Admin logged in successfully!'));
        return true;
      }
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        console.error("Login error:", error);
        setError(error.message);
        toast.error(error.message);
        setIsLoading(false);
        return false;
      }
      
      console.log("Login successful:", !!data.user);
      toast.success(t('Signed in successfully!'));
      
      return true;
    } catch (error: any) {
      console.error("Login exception:", error);
      setError(t('Login failed. Please try again.'));
      toast.error(t('Login failed. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string): Promise<boolean> => {
    setError(null);
    
    try {
      console.log(`Attempting to register with email: ${email}`);
      setIsLoading(true);
      
      // Desabilitar registro público (apenas admins podem criar usuários)
      toast.error(t('Public registration is disabled. Please contact an administrator.'));
      setIsLoading(false);
      return false;
      
      // Código de registro original desabilitado
      /*
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
          }
        }
      });
      
      if (error) {
        console.error("Registration error:", error);
        setError(error.message);
        toast.error(error.message);
        return false;
      }
      
      if (data.session) {
        toast.success(t('Registration successful! You are now signed in.'));
      } else {
        toast.success(t('Registration successful! Please check your email to confirm your account.'));
      }
      
      return true;
      */
    } catch (error: any) {
      console.error("Registration exception:", error);
      setError(t('Registration failed. Please try again.'));
      toast.error(t('Registration failed. Please try again.'));
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      console.log("Attempting to sign out");
      setIsLoading(true);
      
      // Verificar se é o usuário demo admin para limpar o localStorage
      if (user?.email === 'admin@example.com') {
        localStorage.removeItem('demoUser');
        localStorage.removeItem('demoSession');
        setUser(null);
        setSession(null);
        toast.success(t('Signed out successfully'));
        setIsLoading(false);
        return;
      }
      
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

  // Função para criar usuários (apenas para administradores)
  const createUser = async (email: string, password: string, name?: string, isAdmin: boolean = false): Promise<boolean> => {
    if (!user?.isAdmin) {
      toast.error(t('Only administrators can create users'));
      return false;
    }
    
    try {
      setIsLoading(true);
      
      // Criar um novo usuário na aplicação (simulado)
      const newUser: User = {
        id: `user-${Date.now()}`,
        email,
        name: name || '',
        isAdmin,
        apiKey: '',
        models: ['1', '2', '3', '4'],
        highlightColor: '#ff653a',
        creditsReset: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        profileImage: '/placeholder.svg'
      };
      
      // Em uma implementação real, você usaria o Supabase Admin API para criar usuários
      // Simulação bem-sucedida
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
    login,
    register,
    logout,
    createUser,
    signIn: login,
    signUp: register,
    signOut: logout,
  };
};
