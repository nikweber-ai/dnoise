
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, ImageIcon, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
});

type FormValues = z.infer<typeof formSchema>;

const SignIn = () => {
  const { signIn, isAuthenticated, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const { t } = useTranslation();

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Show auth errors from context
  useEffect(() => {
    if (authError) {
      setLoginError(authError);
    }
  }, [authError]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (isLoading) return; // Prevent multiple submissions
    
    setLoginError(null);
    setIsLoading(true);
    console.log("Attempting to sign in with:", data.email);
    
    try {
      // Try multiple times if initial attempt fails
      let attempts = 0;
      let success = false;
      
      while (attempts < 2 && !success) {
        attempts++;
        success = await signIn(data.email, data.password);
        
        if (success) {
          console.log("Sign-in successful!");
          navigate('/dashboard');
          return;
        } else if (attempts < 2) {
          console.log(`Sign-in attempt ${attempts} failed, retrying...`);
          // Short delay before retry
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!success) {
        console.log("All sign-in attempts failed");
        setLoginError(t('Login failed after multiple attempts. Please check your credentials.'));
      }
    } catch (error: any) {
      console.error("Sign in error:", error);
      setLoginError(typeof error === 'string' ? error : error?.message || t('An unexpected error occurred'));
      toast.error(t("An error occurred during sign in"));
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const fillDemoCredentials = () => {
    form.setValue('email', 'admin@example.com');
    form.setValue('password', 'admin123');
  };

  // Get system settings for app name
  const getSystemSettings = () => {
    const settings = localStorage.getItem('appSettings');
    if (settings) {
      try {
        return JSON.parse(settings);
      } catch (err) {
        console.error("Error parsing app settings:", err);
        return { appName: 'GenHub', logoUrl: null };
      }
    }
    return { appName: 'GenHub', logoUrl: null };
  };
  
  const systemSettings = getSystemSettings();
  const appName = systemSettings.appName || 'GenHub';
  const logoUrl = systemSettings.logoUrl;

  // If we're in a loading state, show the spinner
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin-slow text-primary">
          <div className="h-12 w-12 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-6">
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

        {loginError && (
          <Alert variant="destructive" className="mb-4 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertDescription>{loginError}</AlertDescription>
          </Alert>
        )}

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

            <Button type="submit" className="w-full" disabled={isLoading || authLoading}>
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

        {/* Demo credentials section with one-click fill */}
        <div className="mt-4 border-t pt-4">
          <p className="text-sm text-muted-foreground text-center">{t('Demo credentials (for testing only):')}</p>
          <div className="grid grid-cols-2 gap-2 mt-2 text-xs text-muted-foreground">
            <div>
              <p className="font-semibold">{t('Email:')}</p>
              <p>admin@example.com</p>
            </div>
            <div>
              <p className="font-semibold">{t('Password:')}</p>
              <p>admin123</p>
            </div>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm" 
            className="w-full mt-2 text-xs"
            onClick={fillDemoCredentials}
          >
            {t('Use demo credentials')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
