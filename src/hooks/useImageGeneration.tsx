
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { v4 as uuidv4 } from 'uuid';

export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number | null;
  batchSize?: number;
  model: string;
  lora_weights?: string;
  lora_scale?: number;
  num_outputs?: number;
  aspect_ratio?: string;
  output_format?: string;
  guidance?: number;
  output_quality?: number;
  prompt_strength?: number;
  num_inference_steps?: number;
  go_fast?: boolean;
  megapixels?: string;
  disable_safety_checker?: boolean;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number;
  model: string;
  createdAt: string;
  userId: string;
  isFavorite?: boolean;
  generationParams?: GenerationParams;
}

export const useImageGeneration = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // Generate images
  const generateMutation = useMutation({
    mutationFn: async (params: GenerationParams) => {
      // Check if user is admin (doesn't need API key) or has an API key
      if (!user) {
        throw new Error('You must be logged in to generate images');
      }
      
      // Get the user's API key from the profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('api_key')
        .eq('id', user.id)
        .single();
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        throw new Error('Failed to fetch your profile. Please try again.');
      }
      
      if (!user.isAdmin && !profile.api_key) {
        throw new Error('Replicate API key not set. Please add your API key in your profile settings.');
      }
      
      // Call the Replicate edge function
      const { data, error } = await supabase.functions.invoke('replicate', {
        body: {
          prompt: params.prompt,
          negativePrompt: params.negativePrompt,
          width: params.width,
          height: params.height,
          seed: params.seed,
          model: params.model,
          numOutputs: params.num_outputs || params.batchSize || 1,
          aspectRatio: params.aspect_ratio || "1:1",
          loraWeights: params.lora_weights,
          loraScale: params.lora_scale || 1
        }
      });
      
      if (error || !data.success) {
        const errorMessage = error || data.error || 'Image generation failed';
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }
      
      // Save the generated images to the database
      if (data.data && data.data.length > 0) {
        const generatedImages = data.data;
        const dbInserts = await Promise.all(generatedImages.map(async (img) => {
          const { data: insertData, error: insertError } = await supabase
            .from('generated_images')
            .insert({
              user_id: user.id,
              url: img.url,
              prompt: img.prompt,
              negative_prompt: img.negativePrompt,
              seed: img.seed,
              model: img.model,
              width: img.width,
              height: img.height,
              is_favorite: false
            })
            .select();
            
          if (insertError) {
            console.error('Error inserting generated image:', insertError);
          }
          
          return {
            id: uuidv4(),
            url: img.url,
            prompt: img.prompt,
            negativePrompt: img.negativePrompt,
            width: img.width,
            height: img.height,
            seed: img.seed,
            model: img.model,
            createdAt: new Date().toISOString(),
            userId: user.id,
            isFavorite: false
          };
        }));
        
        return dbInserts;
      }
      
      return [];
    },
    onSuccess: (data) => {
      toast.success(`Generated ${data.length} image${data.length !== 1 ? 's' : ''}`);
      queryClient.invalidateQueries({ queryKey: ['generationHistory', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['favorites', user?.id] });
    },
    onError: (error) => {
      console.error('Generation error:', error);
      toast.error(`Generation failed: ${error.message}`);
    },
  });

  // Get generation history
  const useGenerationHistory = () => {
    return useQuery({
      queryKey: ['generationHistory', user?.id],
      queryFn: async () => {
        if (!user?.id) return [];
        
        const { data, error } = await supabase
          .from('generated_images')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
          
        if (error) {
          toast.error('Failed to fetch generation history');
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
