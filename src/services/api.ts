
// Mock API service for the Comfy Deploy API interaction
// This would be replaced with actual API calls in a production app

import { v4 as uuidv4 } from 'uuid';

export interface Model {
  id: string;
  name: string;
  description?: string;
  defaultPrompt?: string;
}

export interface GenerationParams {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  loraStrength?: number;
  seed?: number | null;
  batchSize: number;
  model: string;
}

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  seed: number;
  model: string;
  createdAt: string;
  userId: string;
}

export interface User {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
  credits: number;
  creditsReset: string;
  models: string[];
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
    name: 'Flux Dev 1.0',
    description: 'General purpose image generation model',
    defaultPrompt: 'a beautiful photograph of a landscape, high quality, 8k'
  },
  {
    id: '2',
    name: 'Flux Dev 2.0',
    description: 'Enhanced image generation with better coherence',
    defaultPrompt: 'a detailed portrait of a person, professional lighting, studio quality'
  },
  {
    id: '3',
    name: 'Flux Character',
    description: 'Specialized in character creation',
    defaultPrompt: 'character concept art, full body, detailed features, high quality'
  },
  {
    id: '4',
    name: 'Flux Landscape',
    description: 'Optimized for landscapes and environments',
    defaultPrompt: 'epic landscape scene, volumetric lighting, detailed, 8k, cinematic'
  }
];

const mockUsers: User[] = [
  {
    id: '1',
    email: 'user@example.com',
    credits: 100,
    creditsReset: '2023-06-01',
    isAdmin: false,
    models: ['1', '2']
  },
  {
    id: '2',
    email: 'admin@example.com',
    credits: 500,
    creditsReset: '2023-06-01',
    isAdmin: true,
    models: ['1', '2', '3', '4']
  }
];

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
    userId: '1'
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
    userId: '1'
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
    userId: '2'
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
    const user = mockUsers.find(u => u.id === userId);
    if (!user) {
      return { success: false, error: 'User not found' };
    }
    
    const userModels = mockModels.filter(model => user.models.includes(model.id));
    return getMockData(userModels);
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
    
    return { success: true, data: updatedUser };
  },

  // Image generation functions
  generateImage: async (params: GenerationParams): Promise<ApiResponse<GeneratedImage[]>> => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      return { success: false, error: 'User not authenticated' };
    }
    
    const user = JSON.parse(storedUser);
    if (user.credits <= 0) {
      return { success: false, error: 'Insufficient credits' };
    }
    
    // Mock image generation
    const images: GeneratedImage[] = [];
    for (let i = 0; i < params.batchSize; i++) {
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
        userId: user.id
      });
    }
    
    // Deduct credits (1 credit per image)
    const updatedCredits = user.credits - params.batchSize;
    user.credits = updatedCredits;
    localStorage.setItem('user', JSON.stringify(user));
    
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
  }
};
