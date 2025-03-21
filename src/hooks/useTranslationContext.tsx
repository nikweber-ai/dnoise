
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language, translations, availableLanguages } from '../translations';

// Translation context
interface TranslationContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, ...args: any[]) => string;
  availableLanguages: { value: Language, label: string }[];
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

// Provider component
export const TranslationProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get from localStorage or default to 'en'
    const savedLang = localStorage.getItem('language');
    return (savedLang as Language) || 'en';
  });

  // Set language and save to localStorage
  const setLanguage = (lang: Language) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  // Translation function
  const t = (key: string, ...args: any[]) => {
    let translation = translations[language]?.[key] || key;
    
    // Replace placeholders like {0}, {1}, etc. with arguments
    if (args.length > 0) {
      args.forEach((arg, index) => {
        translation = translation.replace(`{${index}}`, arg.toString());
      });
    }
    
    return translation;
  };

  useEffect(() => {
    // Set html lang attribute
    document.documentElement.lang = language;
  }, [language]);

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, availableLanguages }}>
      {children}
    </TranslationContext.Provider>
  );
};

// Hook for using the translation context
export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
};
