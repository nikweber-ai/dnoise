
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Model } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useModels = () => {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  // Helper to get system settings
  const getSystemSettings = () => {
    const settings = localStorage.getItem('appSettings');
    if (settings) {
      return JSON.parse(settings);
    }
    return null;
  };

  // Get all models (admin only)
  const useAllModels = () => {
    return useQuery({
      queryKey: ['models'],
      queryFn: async () => {
        const response = await api.getModels();
        if (!response.success) {
          toast.error(response.error || 'Failed to fetch models');
          throw new Error(response.error);
        }
        
        // Apply global Replicate model ID if available
        const settings = getSystemSettings();
        if (settings?.replicateModelId) {
          response.data = response.data?.map(model => ({
            ...model,
            replicateModelId: settings.replicateModelId
          }));
        }
        
        return response.data || [];
      },
      enabled: !!user && user.isAdmin,
      staleTime: 0, // Always refetch when requested
    });
  };

  // Get models assigned to user
  const useUserModels = () => {
    return useQuery({
      queryKey: ['userModels', userId],
      queryFn: async () => {
        if (!userId) return [];
        
        const response = await api.getUserModels(userId);
        if (!response.success) {
          toast.error(response.error || 'Failed to fetch user models');
          throw new Error(response.error);
        }
        
        // Apply global Replicate model ID if available
        const settings = getSystemSettings();
        if (settings?.replicateModelId) {
          response.data = response.data?.map(model => ({
            ...model,
            replicateModelId: settings.replicateModelId
          }));
        }
        
        return response.data || [];
      },
      enabled: !!userId,
      staleTime: 0, // Always refetch when requested
    });
  };

  return {
    useAllModels,
    useUserModels,
  };
};

export const useModelSelection = () => {
  const { user } = useAuth();
  const { useUserModels } = useModels();
  const { data: userModels, isLoading, error, refetch } = useUserModels();

  const getDefaultModel = (): Model | undefined => {
    return userModels && userModels.length > 0 ? userModels[0] : undefined;
  };

  return {
    userModels,
    isLoading,
    error,
    getDefaultModel,
    refetch
  };
};
