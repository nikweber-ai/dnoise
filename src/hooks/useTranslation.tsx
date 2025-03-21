
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
    'Forgot your password?': 'Forgot your password?',
    'Don\'t have an account?': 'Don\'t have an account?',
    'Sign in to your account to continue': 'Sign in to your account to continue',
    'Signing in...': 'Signing in...',
    'Admin logged in successfully!': 'Admin logged in successfully!',
    'Signed in successfully!': 'Signed in successfully!',
    'Login failed. Please try again.': 'Login failed. Please try again.',
    'Public registration is disabled. Please contact an administrator.': 'Public registration is disabled. Please contact an administrator.',
    'Registration failed. Please try again.': 'Registration failed. Please try again.',
    'Signed out successfully': 'Signed out successfully',
    'Failed to sign out. Please try again.': 'Failed to sign out. Please try again.',
    'Only administrators can create users': 'Only administrators can create users',
    'User created successfully': 'User created successfully',
    'Failed to create user. Please try again.': 'Failed to create user. Please try again.',
    'User created successfully!': 'User created successfully!',
    'Access Denied': 'Access Denied',
    'You do not have permission to access this page.': 'You do not have permission to access this page.',
    'Create User': 'Create User',
    'Create new users with controlled access': 'Create new users with controlled access',
    'New User': 'New User',
    'Create a new user account with custom permissions': 'Create a new user account with custom permissions',
    'Name': 'Name',
    'Administrator': 'Administrator',
    'Grant administrative privileges to this user': 'Grant administrative privileges to this user',
    'Creating...': 'Creating...',
    
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
    'Create Users': 'Create Users',
    
    // Generation
    'You must be logged in to generate images': 'You must be logged in to generate images',
    'Failed to fetch your profile. Please try again.': 'Failed to fetch your profile. Please try again.',
    'Replicate API key not set. Please add your API key in your profile settings.': 'Replicate API key not set. Please add your API key in your profile settings.',
    'Image generation failed': 'Image generation failed',
    'Generated {0} image': 'Generated {0} image',
    'Generated {0} images': 'Generated {0} images',
    'Generation failed': 'Generation failed',
    'Failed to fetch generation history': 'Failed to fetch generation history',
    
    // Profile
    'General Information': 'General Information',
    'Update your account details': 'Update your account details',
    'This is the name that will be displayed on your profile': 'This is the name that will be displayed on your profile',
    'Change': 'Change',
    'Your email address is used for login and notifications': 'Your email address is used for login and notifications',
    'Save Changes': 'Save Changes',
    'API Settings': 'API Settings',
    'Configure your Replicate API key for image generation': 'Configure your Replicate API key for image generation',
    'Replicate API Key': 'Replicate API Key',
    'You need a Replicate API key to generate images': 'You need a Replicate API key to generate images',
    'Save API Key': 'Save API Key',
    'Appearance': 'Appearance',
    'Customize your interface': 'Customize your interface',
    'Highlight Color': 'Highlight Color',
    'This color will be used for buttons and interactive elements in the interface': 'This color will be used for buttons and interactive elements in the interface',
    'Save Appearance': 'Save Appearance',
    'Security': 'Security',
    'Update your password and security settings': 'Update your password and security settings',
    'Change your password': 'Change your password',
    'Change Password': 'Change Password',
    'Language': 'Language',
    'Choose your language': 'Choose your language',
    
    // Languages
    'English': 'English',
    'Portuguese (Brazil)': 'Portuguese (Brazil)',
    
    // User Management
    'User List': 'User List',
    'View and manage user accounts': 'View and manage user accounts',
    'Actions': 'Actions',
    'Edit User': 'Edit User',
    'Modify user settings and permissions': 'Modify user settings and permissions',
    'Save': 'Save',
    'Cancel': 'Cancel',
    'Save Changes': 'Save Changes',
    'Add User': 'Add User',
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
    'Forgot your password?': 'Esqueceu sua senha?',
    'Don\'t have an account?': 'Não tem uma conta?',
    'Sign in to your account to continue': 'Entre na sua conta para continuar',
    'Signing in...': 'Entrando...',
    'Admin logged in successfully!': 'Administrador conectado com sucesso!',
    'Signed in successfully!': 'Conectado com sucesso!',
    'Login failed. Please try again.': 'Falha no login. Por favor, tente novamente.',
    'Public registration is disabled. Please contact an administrator.': 'Registro público desativado. Entre em contato com um administrador.',
    'Registration failed. Please try again.': 'Falha no registro. Por favor, tente novamente.',
    'Signed out successfully': 'Desconectado com sucesso',
    'Failed to sign out. Please try again.': 'Falha ao sair. Por favor, tente novamente.',
    'Only administrators can create users': 'Apenas administradores podem criar usuários',
    'User created successfully': 'Usuário criado com sucesso',
    'Failed to create user. Please try again.': 'Falha ao criar usuário. Por favor, tente novamente.',
    'User created successfully!': 'Usuário criado com sucesso!',
    'Access Denied': 'Acesso Negado',
    'You do not have permission to access this page.': 'Você não tem permissão para acessar esta página.',
    'Create User': 'Criar Usuário',
    'Create new users with controlled access': 'Crie novos usuários com acesso controlado',
    'New User': 'Novo Usuário',
    'Create a new user account with custom permissions': 'Crie uma nova conta de usuário com permissões personalizadas',
    'Name': 'Nome',
    'Administrator': 'Administrador',
    'Grant administrative privileges to this user': 'Conceder privilégios administrativos a este usuário',
    'Creating...': 'Criando...',
    
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
    'Create Users': 'Criar Usuários',
    
    // Generation
    'You must be logged in to generate images': 'Você precisa estar logado para gerar imagens',
    'Failed to fetch your profile. Please try again.': 'Falha ao buscar seu perfil. Por favor, tente novamente.',
    'Replicate API key not set. Please add your API key in your profile settings.': 'Chave da API Replicate não configurada. Por favor, adicione sua chave API nas configurações do perfil.',
    'Image generation failed': 'Falha na geração de imagem',
    'Generated {0} image': 'Gerada {0} imagem',
    'Generated {0} images': 'Geradas {0} imagens',
    'Generation failed': 'Falha na geração',
    'Failed to fetch generation history': 'Falha ao buscar histórico de geração',
    
    // Profile
    'General Information': 'Informações Gerais',
    'Update your account details': 'Atualize os detalhes da sua conta',
    'This is the name that will be displayed on your profile': 'Este é o nome que será exibido no seu perfil',
    'Change': 'Alterar',
    'Your email address is used for login and notifications': 'Seu endereço de email é usado para login e notificações',
    'Save Changes': 'Salvar Alterações',
    'API Settings': 'Configurações da API',
    'Configure your Replicate API key for image generation': 'Configure sua chave da API Replicate para geração de imagens',
    'Replicate API Key': 'Chave da API Replicate',
    'You need a Replicate API key to generate images': 'Você precisa de uma chave da API Replicate para gerar imagens',
    'Save API Key': 'Salvar Chave da API',
    'Appearance': 'Aparência',
    'Customize your interface': 'Personalize sua interface',
    'Highlight Color': 'Cor de Destaque',
    'This color will be used for buttons and interactive elements in the interface': 'Esta cor será usada para botões e elementos interativos na interface',
    'Save Appearance': 'Salvar Aparência',
    'Security': 'Segurança',
    'Update your password and security settings': 'Atualize sua senha e configurações de segurança',
    'Change your password': 'Altere sua senha',
    'Change Password': 'Alterar Senha',
    'Language': 'Idioma',
    'Choose your language': 'Escolha seu idioma',
    
    // Languages
    'English': 'Inglês',
    'Portuguese (Brazil)': 'Português (Brasil)',
    
    // User Management
    'User List': 'Lista de Usuários',
    'View and manage user accounts': 'Visualize e gerencie contas de usuários',
    'Actions': 'Ações',
    'Edit User': 'Editar Usuário',
    'Modify user settings and permissions': 'Modificar configurações e permissões do usuário',
    'Save': 'Salvar',
    'Cancel': 'Cancelar',
    'Save Changes': 'Salvar Alterações',
    'Add User': 'Adicionar Usuário',
    
    // General UI
    'Use Admin Account': 'Usar Conta de Admin',
    'Use User Account': 'Usar Conta de Usuário',
    'Save': 'Salvar',
    'Cancel': 'Cancelar',
    'Loading...': 'Carregando...',
    'Error loading data.': 'Erro ao carregar dados.',
    'Yes': 'Sim',
    'No': 'Não',
    'None': 'Nenhum',
    'Add': 'Adicionar',
    'Edit': 'Editar',
    'Delete': 'Excluir',
    'Submit': 'Enviar',
    'Reset': 'Redefinir',
    'Search': 'Buscar',
    'Filter': 'Filtrar',
    'Create': 'Criar',
    'Update': 'Atualizar',
    'Back': 'Voltar',
    'Next': 'Próximo',
    'Previous': 'Anterior',
    'Select': 'Selecionar',
    'Choose': 'Escolher',
    'Upload': 'Enviar',
    'Download': 'Baixar',
    'View': 'Visualizar',
    'Details': 'Detalhes',
    'Success': 'Sucesso',
    'Error': 'Erro',
    'Warning': 'Aviso',
    'Info': 'Informação',
    'Confirm': 'Confirmar',
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
