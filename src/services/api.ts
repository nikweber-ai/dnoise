// Mock API service for the Replicate API interaction
// This would be replaced with actual API calls in a production app

import { v4 as uuidv4 } from 'uuid';

export interface Model {
  id: string;
  name: string;
  description?: string;
  defaultPrompt?: string;
  promptTemplates?: PromptTemplate[];
  replicateModelId?: string; // Added for Replicate
  replicateVersionId?: string; // Added for Replicate
  lora_weights?: string; // Added for flux-dev-lora
}

export interface PromptTemplate {
  id: string;
  name: string;
  prompt: string;
  negativePrompt?: string;
  modelId: string;
}

export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  seed?: number | null;
  batchSize?: number;
  model: string;
  // Replicate specific parameters
  image?: string; // For img2img
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
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  apiKey?: string; // Not required for admin
  models?: string[]; // Models the user has access to
  highlightColor?: string; // Added for user interface customization
  creditsReset?: string; // Keeping for backward compatibility
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Mock data
const mockModels: Model[] = [
  {
    id: '1',
    name: 'Flux Dev',
    description: 'General purpose image generation model',
    defaultPrompt: 'a beautiful photograph of a landscape, high quality, 8k',
    replicateModelId: 'black-forest-labs/flux-dev-lora',
    promptTemplates: [
      {
        id: '1',
        name: 'Landscape',
        prompt: 'a beautiful photograph of a landscape, high quality, 8k, detailed',
        modelId: '1'
      },
      {
        id: '2',
        name: 'Portrait',
        prompt: 'portrait of a person, detailed features, soft lighting, photorealistic',
        modelId: '1'
      },
      {
        id: '3',
        name: 'Abstract',
        prompt: 'abstract art, vibrant colors, modern design, high detail',
        modelId: '1'
      }
    ]
  },
  {
    id: '2',
    name: 'Flux 80s Cyberpunk',
    description: 'Generate images in 80s cyberpunk style',
    defaultPrompt: 'style of 80s cyberpunk, a futuristic city',
    replicateModelId: 'black-forest-labs/flux-dev-lora',
    lora_weights: 'fofr/flux-80s-cyberpunk',
    promptTemplates: [
      {
        id: '3',
        name: 'Cyberpunk Portrait',
        prompt: 'style of 80s cyberpunk, a portrait photo, neon lights',
        modelId: '2'
      },
      {
        id: '4',
        name: 'Cyberpunk City',
        prompt: 'style of 80s cyberpunk, futuristic cityscape, neon signs, rainy street',
        modelId: '2'
      }
    ]
  },
  {
    id: '3',
    name: 'Flux Pixar',
    description: 'Generate images in Pixar animation style',
    defaultPrompt: 'pixar style illustration, cute character',
    replicateModelId: 'black-forest-labs/flux-dev-lora',
    lora_weights: 'fofr/flux-pixar',
    promptTemplates: [
      {
        id: '5',
        name: 'Pixar Character',
        prompt: 'pixar style illustration, cute character, big eyes, colorful',
        modelId: '3'
      },
      {
        id: '6',
        name: 'Pixar Scene',
        prompt: 'pixar style illustration, vibrant scene, colorful background, cute characters',
        modelId: '3'
      }
    ]
  },
  {
    id: '4',
    name: 'Flux Realistic',
    description: 'Photorealistic image generation',
    defaultPrompt: 'a photorealistic image of a landscape, perfect lighting, 8k',
    replicateModelId: 'black-forest-labs/flux-dev-lora',
    promptTemplates: [
      {
        id: '7',
        name: 'Nature Shot',
        prompt: 'cinematic photography of nature, perfect lighting, ultra realistic, 8k detail',
        modelId: '4'
      },
      {
        id: '8',
        name: 'Urban Scene',
        prompt: 'photorealistic urban cityscape, golden hour lighting, perfect exposure, ultra detailed',
        modelId: '4'
      }
    ]
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    isAdmin: false,
    apiKey: '',
    models: ['1', '2'],
    highlightColor: '#9b87f5' // Default purple
  },
  {
    id: '2',
    email: 'admin@example.com',
    isAdmin: true,
    apiKey: '', // Admin doesn't need an API key by default
    models: ['1', '2', '3', '4'],
    highlightColor: '#0FA0CE' // Blue for admin
  }
];

// Mock generated images
const mockImages: GeneratedImage[] = [
  {
    id: '1',
    url: 'https://images.unsplash.com/photo-1701085608208-def01a408c0e',
    prompt: 'a beautiful mountain landscape with a lake, sunset',
    width: 1024,
    height: 1024,
    seed: 12345,
    model: '1',
    createdAt: '2023-05-15T10:30:00Z',
    userId: '1',
    isFavorite: false
  },
  {
    id: '2',
    url: 'https://images.unsplash.com/photo-1504805572947-34fad45aed93',
    prompt: 'a futuristic city with flying cars',
    width: 1024,
    height: 576,
    seed: 67890,
    model: '2',
    createdAt: '2023-05-16T14:20:00Z',
    userId: '1',
    isFavorite: true
  },
  {
    id: '3',
    url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e',
    prompt: 'a fantasy character, elf, detailed armor, in a forest',
    width: 768,
    height: 768,
    seed: 24680,
    model: '3',
    createdAt: '2023-05-17T09:15:00Z',
    userId: '2',
    isFavorite: false
  }
];

// Helper function to get mock data
const getMockData = <T>(data: T[], delayMs = 500): Promise<ApiResponse<T[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ success: true, data });
    }, delayMs);
  });
};

// API functions
export const api = {
  // Model functions
  getModels: async (): Promise<ApiResponse<Model[]>> => {
    return getMockData(mockModels);
  },

  getUserModels: async (userId: string): Promise<ApiResponse<Model[]>> => {
    // In this implementation, all users can access all models
    // In a real app, you might want to restrict access based on user role
    return getMockData(mockModels);
  },

  getPromptTemplates: async (modelId: string): Promise<ApiResponse<PromptTemplate[]>> => {
    const model = mockModels.find(m => m.id === modelId);
    if (!model) {
      return { success: false, error: 'Model not found' };
    }
    
    return { success: true, data: model.promptTemplates || [] };
  },

  // User functions
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    return getMockData(mockUsers);
  },

  getUser: async (userId: string): Promise<ApiResponse<User>> => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    return { success: true, data: user };
  },

  updateUser: async (userId: string, data: Partial<User>): Promise<ApiResponse<User>> => {
    const userIndex = mockUsers.findIndex(u => u.id === userId);
    if (userIndex === -1) {
      return { success: false, error: 'User not found' };
    }
    
    const updatedUser = { ...mockUsers[userIndex], ...data };
    mockUsers[userIndex] = updatedUser;
    
    // In a real app, this would update a database
    // For now, we'll also update localStorage for the current user
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const currentUser = JSON.parse(storedUser);
      if (currentUser.id === userId) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    }
    
    return { success: true, data: updatedUser };
  },

  // Image generation with Replicate
  generateImage: async (params: GenerationParams): Promise<ApiResponse<GeneratedImage[]>> => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const user = JSON.parse(storedUser);
    if (!user.apiKey) {
      return { success: false, error: 'Replicate API key not set. Please add your API key in your profile settings.' };
    }
    
    const selectedModel = mockModels.find(m => m.id === params.model);
    if (!selectedModel) {
      return { success: false, error: 'Selected model not found' };
    }

    // In a real implementation, this would make an actual API call to Replicate
    // For this demo, we'll simulate the response
    console.log('Would call Replicate API with:', {
      model: selectedModel.replicateModelId,
      apiKey: user.apiKey.substring(0, 5) + '...',
      input: {
        prompt: params.prompt,
        seed: params.seed,
        num_outputs: params.num_outputs || params.batchSize || 1,
        lora_weights: selectedModel.lora_weights || params.lora_weights,
        lora_scale: params.lora_scale || 1,
        aspect_ratio: params.aspect_ratio || '1:1',
        output_format: params.output_format || 'webp',
        guidance: params.guidance || 3,
        output_quality: params.output_quality || 80,
        prompt_strength: params.prompt_strength || 0.8,
        num_inference_steps: params.num_inference_steps || 28,
        go_fast: params.go_fast !== undefined ? params.go_fast : true,
        megapixels: params.megapixels || "1",
        disable_safety_checker: params.disable_safety_checker || false,
      }
    });

    // Mock image generation
    const images: GeneratedImage[] = [];
    const numOutputs = params.num_outputs || params.batchSize || 1;
    for (let i = 0; i < numOutputs; i++) {
      const randomSeed = params.seed !== null && params.seed !== undefined 
        ? params.seed 
        : Math.floor(Math.random() * 1000000);
      
      const placeholderUrls = [
        'https://images.unsplash.com/photo-1682687981907-170c06fa4941',
        'https://images.unsplash.com/photo-1682695795557-17447f919a0c',
        'https://images.unsplash.com/photo-1686937871772-476d0a92f584',
        'https://images.unsplash.com/photo-1693117030055-d923b67c5022',
        'https://images.unsplash.com/photo-1691375222952-f96e179ef391'
      ];
      
      const randomIndex = Math.floor(Math.random() * placeholderUrls.length);
      
      images.push({
        id: uuidv4(),
        url: placeholderUrls[randomIndex],
        prompt: params.prompt,
        negativePrompt: params.negativePrompt,
        width: params.width,
        height: params.height,
        seed: randomSeed,
        model: params.model,
        createdAt: new Date().toISOString(),
        userId: user.id,
        isFavorite: false
      });
    }
    
    // Save generated images to history
    const history = localStorage.getItem('generationHistory');
    const generationHistory = history ? JSON.parse(history) : [];
    generationHistory.push(...images);
    localStorage.setItem('generationHistory', JSON.stringify(generationHistory));
    
    return { success: true, data: images };
  },

  // Image history functions
  getGenerationHistory: async (userId: string): Promise<ApiResponse<GeneratedImage[]>> => {
    const history = localStorage.getItem('generationHistory');
    if (!history) {
      return { success: true, data: [] };
    }
    
    const generationHistory: GeneratedImage[] = JSON.parse(history);
    const userHistory = generationHistory.filter(img => img.userId === userId);
    
    // Sort by creation date (newest first)
    userHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { success: true, data: userHistory };
  },

  // Toggle favorite status
  toggleFavorite: async (imageId: string): Promise<ApiResponse<GeneratedImage>> => {
    const history = localStorage.getItem('generationHistory');
    if (!history) {
      return { success: false, error: 'Image not found' };
    }
    
    const generationHistory: GeneratedImage[] = JSON.parse(history);
    const imageIndex = generationHistory.findIndex(img => img.id === imageId);
    
    if (imageIndex === -1) {
      return { success: false, error: 'Image not found' };
    }
    
    // Toggle favorite status
    generationHistory[imageIndex].isFavorite = !generationHistory[imageIndex].isFavorite;
    
    // Save updated history
    localStorage.setItem('generationHistory', JSON.stringify(generationHistory));
    
    return { success: true, data: generationHistory[imageIndex] };
  },

  // Get favorite images
  getFavorites: async (userId: string): Promise<ApiResponse<GeneratedImage[]>> => {
    const history = localStorage.getItem('generationHistory');
    if (!history) {
      return { success: true, data: [] };
    }
    
    const generationHistory: GeneratedImage[] = JSON.parse(history);
    const favorites = generationHistory.filter(img => img.userId === userId && img.isFavorite);
    
    // Sort by creation date (newest first)
    favorites.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    
    return { success: true, data: favorites };
  }
};
