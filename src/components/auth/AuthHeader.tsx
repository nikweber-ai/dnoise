
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { ImageIcon } from 'lucide-react';

interface AuthHeaderProps {
  appName: string;
  logoUrl: string | null;
}

const AuthHeader: React.FC<AuthHeaderProps> = ({ appName, logoUrl }) => {
  const { t } = useTranslation();

  return (
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
  );
};

export default AuthHeader;
