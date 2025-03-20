
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, GenerationParams, GeneratedImage } from '@/services/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';

export const useImageGeneration = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Generate images
  const generateMutation = useMutation({
    mutationFn: async (params: GenerationParams) => {
      const response = await api.generateImage(params);
      if (!response.success) {
        toast.error(response.error || 'Image generation failed');
        throw new Error(response.error);
      }
      return response.data || [];
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.length} image${data.length !== 1 ? 's' : ''}`);
      queryClient.invalidateQueries({ queryKey: ['generationHistory', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
    onError: (error) => {
      console.error('Generation error:', error);
    },
  });

  // Get generation history
  const useGenerationHistory = () => {
    return useQuery({
      queryKey: ['generationHistory', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        
        const response = await api.getGenerationHistory(user.id);
        if (!response.success) {
          toast.error(response.error || 'Failed to fetch generation history');
          throw new Error(response.error);
        }
        return response.data || [];
      },
      enabled: !!user?.id,
    });
  };

  return {
    generateImage: generateMutation.mutate,
    isGenerating: generateMutation.isPending,
    generationError: generateMutation.error,
    useGenerationHistory,
  };
};

export const downloadImage = async (image: GeneratedImage) => {
  try {
    const response = await fetch(image.url);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `generated-image-${image.id}.png`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    toast.success('Image downloaded successfully');
  } catch (error) {
    console.error('Error downloading image:', error);
    toast.error('Failed to download image');
  }
};
