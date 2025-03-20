
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Model } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useModels = () => {
  const { user } = useAuth();
  const userId = user?.id;

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
        return response.data || [];
      },
      enabled: !!user && user.isAdmin,
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
        return response.data || [];
      },
      enabled: !!userId,
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
  const { data: userModels, isLoading, error } = useUserModels();

  const getDefaultModel = (): Model | undefined => {
    return userModels && userModels.length > 0 ? userModels[0] : undefined;
  };

  return {
    userModels,
    isLoading,
    error,
    getDefaultModel,
  };
};
