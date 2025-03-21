
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const formSchema = z.object({
  email: z.string().email({
    message: 'Please enter a valid email address',
  }),
  password: z.string().min(1, {
    message: 'Password is required',
  }),
});

type FormValues = z.infer<typeof formSchema>;

interface SignInFormProps {
  loginError: string | null;
  setLoginError: (error: string | null) => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ loginError, setLoginError }) => {
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

  return (
    <>
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? t('Signing in...') : t('Sign in')}
          </Button>
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
    </>
  );
};

export default SignInForm;
