
interface SystemSettings {
  appName: string;
  logoUrl: string | null;
}

export const getSystemSettings = (): SystemSettings => {
  const settings = localStorage.getItem('appSettings');
  if (settings) {
    try {
      return JSON.parse(settings);
    } catch (err) {
      console.error("Error parsing app settings:", err);
      return { appName: 'GenHub', logoUrl: null };
    }
  }
  return { appName: 'GenHub', logoUrl: null };
};
