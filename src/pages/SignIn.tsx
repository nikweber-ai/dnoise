
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ImageIcon } from 'lucide-react';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z.string().min(6, {
    message: 'Password must be at least 6 characters',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const SignIn = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    
    // Special case for admin account with default password
    if (data.email.includes('admin') && data.password === 'adminadmin') {
      // Attempt to sign in with admin credentials
      const success = await signIn(data.email, data.password);
      if (success) {
        navigate('/');
      } else {
        // If failed, it could be that the admin account doesn't exist yet
        // You might want to handle this scenario differently in a real app
      }
      setIsLoading(false);
      return;
    }
    
    // Regular sign in
    const success = await signIn(data.email, data.password);
    if (success) {
      navigate('/');
    }
    setIsLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Get system settings for app name
  const getSystemSettings = () => {
    const settings = localStorage.getItem('appSettings');
    if (settings) {
      return JSON.parse(settings);
    }
    return { appName: 'GenHub', logoUrl: null };
  };
  
  const systemSettings = getSystemSettings();
  const appName = systemSettings.appName || 'GenHub';
  const logoUrl = systemSettings.logoUrl;

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="mx-auto flex justify-center">
            {logoUrl ? (
              <img src={logoUrl} alt="Logo" className="h-12 w-12" />
            ) : (
              <div className="bg-primary/10 p-2 rounded-full">
                <ImageIcon className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          <h2 className="mt-4 text-3xl font-bold tracking-tight">{t('Sign in')}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t('Sign in to your account to continue')}
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Email')}</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="email" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('Password')}</FormLabel>
                  <div className="relative">
                    <FormControl>
                      <Input
                        {...field}
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={togglePasswordVisibility}
                      className="absolute right-2 top-0 h-full"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  {t('Forgot your password?')}
                </Link>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? t('Signing in...') : t('Sign in')}
            </Button>

            <div className="text-center text-sm">
              {t("Don't have an account?")}{' '}
              <Link
                to="/sign-up"
                className="font-medium text-primary hover:underline"
              >
                {t('Sign up')}
              </Link>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default SignIn;
