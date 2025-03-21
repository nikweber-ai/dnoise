
import { useTranslationContext, TranslationProvider } from './useTranslationContext';
import { Language, availableLanguages } from '../translations';

// Re-export the provider
export { TranslationProvider };

// Re-export the Language type
export type { Language };

// Hook for using the translation context
export const useTranslation = () => {
  return useTranslationContext();
};
