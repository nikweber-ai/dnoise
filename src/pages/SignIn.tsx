
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import SignInForm from '@/components/auth/SignInForm';
import AuthHeader from '@/components/auth/AuthHeader';
import AuthLinks from '@/components/auth/AuthLinks';
import AuthLayout from '@/components/auth/AuthLayout';
import { getSystemSettings } from '@/utils/appSettings';
import { Skeleton } from '@/components/ui/skeleton';

const SignIn = () => {
  const { isAuthenticated, loading: authLoading, error: authError } = useAuth();
  const navigate = useNavigate();
  const [loginError, setLoginError] = useState<string | null>(null);
  const { t } = useTranslation();
  
  // Get system settings for app name
  const systemSettings = getSystemSettings();
  const appName = systemSettings.appName || 'GenHub';
  const logoUrl = systemSettings.logoUrl;

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
    <AuthLayout>
      <AuthHeader appName={appName} logoUrl={logoUrl} />
      <SignInForm loginError={loginError} setLoginError={setLoginError} />
      <AuthLinks type="signin" />
    </AuthLayout>
  );
};

export default SignIn;
