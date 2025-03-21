
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define languages we support
export type Language = 'en' | 'pt-BR';

// Translations object type
interface Translations {
  [key: string]: {
    [key: string]: string;
  };
}

// All translations
const translations: Translations = {
  en: {
    // Auth
    'Sign in': 'Sign in',
    'Sign up': 'Sign up',
    'Email': 'Email',
    'Password': 'Password',
    'Login': 'Login',
    'Logout': 'Logout',
    'Register': 'Register',
    'Forgot password': 'Forgot your password?',
    'No account': 'Don\'t have an account?',
    'Sign in info': 'Sign in to your account to continue',
    'Signing in': 'Signing in...',
    'Loading': 'Loading',
    
    // Navigation
    'Dashboard': 'Dashboard',
    'Generate': 'Generate',
    'History': 'History',
    'Favorites': 'Favorites',
    'Profile': 'Profile',
    'Settings': 'Settings',
    'Users': 'Users',
    'Models': 'Models',
    'Main': 'Main',
    'Admin': 'Admin',
    
    // Generation
    'Login required': 'You must be logged in to generate images',
    'Profile fetch error': 'Failed to fetch your profile. Please try again.',
    'API key required': 'Replicate API key not set. Please add your API key in your profile settings.',
    'Generation failed message': 'Image generation failed',
    'Generated one': 'Generated {0} image',
    'Generated many': 'Generated {0} images',
    'Generation error': 'Generation failed',
    'History fetch error': 'Failed to fetch generation history',
    
    // Profile
    'General information': 'General Information',
    'Update account': 'Update your account details',
    'Name': 'Name',
    'Name description': 'This is the name that will be displayed on your profile',
    'Change': 'Change',
    'Email description': 'Your email address is used for login and notifications',
    'Save changes': 'Save Changes',
    'API settings': 'API Settings',
    'Configure API': 'Configure your Replicate API key for image generation',
    'Replicate API key': 'Replicate API Key',
    'API key desc': 'You need a Replicate API key to generate images',
    'Save API key': 'Save API Key',
    'Appearance': 'Appearance',
    'Customize interface': 'Customize your interface',
    'Highlight color': 'Highlight Color',
    'Color description': 'This color will be used for buttons and interactive elements in the interface',
    'Save appearance': 'Save Appearance',
    'Security': 'Security',
    'Update security': 'Update your password and security settings',
    'Change password text': 'Change your password',
    'Change password button': 'Change Password',
    'Language': 'Language',
    'Choose language': 'Choose your language',
    
    // Languages
    'English': 'English',
    'Portuguese': 'Portuguese (Brazil)',
  },
  'pt-BR': {
    // Auth
    'Sign in': 'Entrar',
    'Sign up': 'Cadastrar',
    'Email': 'Email',
    'Password': 'Senha',
    'Login': 'Entrar',
    'Logout': 'Sair',
    'Register': 'Cadastrar',
    'Forgot password': 'Esqueceu sua senha?',
    'No account': 'Não tem uma conta?',
    'Sign in info': 'Entre na sua conta para continuar',
    'Signing in': 'Entrando...',
    'Loading': 'Carregando',
    
    // Navigation
    'Dashboard': 'Painel',
    'Generate': 'Gerar',
    'History': 'Histórico',
    'Favorites': 'Favoritos',
    'Profile': 'Perfil',
    'Settings': 'Configurações',
    'Users': 'Usuários',
    'Models': 'Modelos',
    'Main': 'Principal',
    'Admin': 'Admin',
    
    // Generation
    'Login required': 'Você precisa estar logado para gerar imagens',
    'Profile fetch error': 'Falha ao buscar seu perfil. Por favor, tente novamente.',
    'API key required': 'Chave da API Replicate não configurada. Por favor, adicione sua chave API nas configurações do perfil.',
    'Generation failed message': 'Falha na geração de imagem',
    'Generated one': 'Gerada {0} imagem',
    'Generated many': 'Geradas {0} imagens',
    'Generation error': 'Falha na geração',
    'History fetch error': 'Falha ao buscar histórico de geração',
    
    // Profile
    'General information': 'Informações Gerais',
    'Update account': 'Atualize os detalhes da sua conta',
    'Name': 'Nome',
    'Name description': 'Este é o nome que será exibido no seu perfil',
    'Change': 'Alterar',
    'Email description': 'Seu endereço de email é usado para login e notificações',
    'Save changes': 'Salvar Alterações',
    'API settings': 'Configurações da API',
    'Configure API': 'Configure sua chave da API Replicate para geração de imagens',
    'Replicate API key': 'Chave da API Replicate',
    'API key desc': 'Você precisa de uma chave da API Replicate para gerar imagens',
    'Save API key': 'Salvar Chave da API',
    'Appearance': 'Aparência',
    'Customize interface': 'Personalize sua interface',
    'Highlight color': 'Cor de Destaque',
    'Color description': 'Esta cor será usada para botões e elementos interativos na interface',
    'Save appearance': 'Salvar Aparência',
    'Security': 'Segurança',
    'Update security': 'Atualize sua senha e configurações de segurança',
    'Change password text': 'Altere sua senha',
    'Change password button': 'Alterar Senha',
    'Language': 'Idioma',
    'Choose language': 'Escolha seu idioma',
    
    // Languages
    'English': 'Inglês',
    'Portuguese': 'Português (Brasil)',
  }
};

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

  // Available languages
  const availableLanguages = [
    { value: 'en' as Language, label: 'English' },
    { value: 'pt-BR' as Language, label: 'Portuguese (Brazil)' }
  ];

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
export const useTranslation = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
};
