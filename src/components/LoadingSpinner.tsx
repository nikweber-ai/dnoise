
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
  textClassName?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  showText = true,
  className,
  textClassName,
}) => {
  const { t } = useTranslation();
  
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className={cn('flex items-center justify-center', className)}>
      <div className="animate-spin text-primary">
        <div className={cn(
          'border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full',
          sizeClasses[size]
        )} />
      </div>
      {showText && (
        <span className={cn('ml-3 text-primary font-medium', textClassName)}>
          {t('Loading')}...
        </span>
      )}
    </div>
  );
};

export default LoadingSpinner;
