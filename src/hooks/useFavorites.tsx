
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { GeneratedImage } from '@/hooks/useImageGeneration';

export const useFavorites = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Toggle favorite status
  const toggleFavoriteMutation = useMutation({
    mutationFn: async (imageId: string) => {
      if (!user) throw new Error('You must be logged in');
      
      // First, get the current favorite status
      const { data: image, error: fetchError } = await supabase
        .from('generated_images')
        .select('is_favorite')
        .eq('id', imageId)
        .eq('user_id', user.id)
        .single();
        
      if (fetchError) {
        toast.error('Failed to fetch image');
        throw fetchError;
      }
      
      // Toggle the favorite status
      const newStatus = !image.is_favorite;
      
      const { data, error: updateError } = await supabase
        .from('generated_images')
        .update({ is_favorite: newStatus })
        .eq('id', imageId)
        .eq('user_id', user.id)
        .select();
        
      if (updateError) {
        toast.error('Failed to update favorite status');
        throw updateError;
      }
      
      return {
        id: data[0].id,
        url: data[0].url,
        prompt: data[0].prompt,
        negativePrompt: data[0].negative_prompt,
        width: data[0].width,
        height: data[0].height,
        seed: data[0].seed,
        model: data[0].model,
        createdAt: data[0].created_at,
        userId: data[0].user_id,
        isFavorite: data[0].is_favorite
      };
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
        
        const { data, error } = await supabase
          .from('generated_images')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_favorite', true)
          .order('created_at', { ascending: false });
          
        if (error) {
          toast.error('Failed to fetch favorites');
          throw error;
        }
        
        return data?.map(img => ({
          id: img.id,
          url: img.url,
          prompt: img.prompt,
          negativePrompt: img.negative_prompt,
          width: img.width,
          height: img.height,
          seed: img.seed,
          model: img.model,
          createdAt: img.created_at,
          userId: img.user_id,
          isFavorite: img.is_favorite
        })) || [];
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
