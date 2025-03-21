
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';

interface AuthLinksProps {
  type: 'signin' | 'signup' | 'forgot-password';
}

const AuthLinks: React.FC<AuthLinksProps> = ({ type }) => {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col space-y-4">
      {type === 'signin' && (
        <>
          <div className="flex items-center">
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-primary hover:underline"
            >
              {t('Forgot your password?')}
            </Link>
          </div>
          <div className="text-center text-sm">
            {t("Don't have an account?")}{' '}
            <Link
              to="/sign-up"
              className="font-medium text-primary hover:underline"
            >
              {t('Sign up')}
            </Link>
          </div>
        </>
      )}

      {type === 'signup' && (
        <div className="text-center text-sm">
          {t('Already have an account?')}{' '}
          <Link
            to="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            {t('Sign in')}
          </Link>
        </div>
      )}

      {type === 'forgot-password' && (
        <div className="text-center text-sm">
          {t('Remember your password?')}{' '}
          <Link
            to="/sign-in"
            className="font-medium text-primary hover:underline"
          >
            {t('Sign in')}
          </Link>
        </div>
      )}
    </div>
  );
};

export default AuthLinks;
