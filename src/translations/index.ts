
import { enTranslations } from './en';
import { ptBRTranslations } from './pt-BR';

// Define languages we support
export type Language = 'en' | 'pt-BR';

// Translations object type
export interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// Available languages with labels
export const availableLanguages = [
  { value: 'en' as Language, label: 'English' },
  { value: 'pt-BR' as Language, label: 'Portuguese (Brazil)' }
];

// All translations
export const translations: Translations = {
  en: enTranslations,
  'pt-BR': ptBRTranslations
};
