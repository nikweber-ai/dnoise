
import { useQuery } from '@tanstack/react-query';
import { api, PromptTemplate } from '@/services/api';
import { toast } from 'sonner';

export const usePromptTemplates = (modelId: string) => {
  const { data: templates, isLoading, error, refetch } = useQuery({
    queryKey: ['promptTemplates', modelId],
    queryFn: async () => {
      if (!modelId) return [];
      
      const response = await api.getPromptTemplates(modelId);
      if (!response.success) {
        toast.error(response.error || 'Failed to fetch prompt templates');
        throw new Error(response.error);
      }
      return response.data || [];
    },
    enabled: !!modelId,
    staleTime: 0, // Always refetch when requested
  });

  return {
    templates,
    isLoading,
    error,
    refetch
  };
};
