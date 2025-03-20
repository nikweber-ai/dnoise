
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, GeneratedImage } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const response = await api.toggleFavorite(imageId);
      if (!response.success) {
        toast.error(response.error || 'Failed to toggle favorite status');
        throw new Error(response.error);
      }
      return response.data;
    },
    onSuccess: (data) => {
      // Update the image in the cache
      queryClient.invalidateQueries({ queryKey: ['generationHistory', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
      const favoriteStatus = data.isFavorite ? 'added to' : 'removed from';
      toast.success(`Image ${favoriteStatus} favorites`);
    },
    onError: (error) => {
      console.error('Error toggling favorite:', error);
    },
  });

  // Get favorite images
  const useFavoriteImages = () => {
    return useQuery({
      queryKey: ['favorites', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        
        const response = await api.getFavorites(user.id);
        if (!response.success) {
          toast.error(response.error || 'Failed to fetch favorites');
          throw new Error(response.error);
        }
        return response.data || [];
      },
      enabled: !!user?.id,
    });
  };

  return {
    toggleFavorite: toggleFavoriteMutation.mutate,
    isToggling: toggleFavoriteMutation.isPending,
    useFavoriteImages,
  };
};
