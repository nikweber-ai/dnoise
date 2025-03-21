
import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ImageIcon, Paintbrush, History, Star, Settings } from 'lucide-react';

const AppInfo: React.FC = () => {
  const { t, language } = useTranslation();
  
  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-primary" />
          <CardTitle>GenHub - AI Image Generation Platform</CardTitle>
        </div>
        <CardDescription>
          Generate, manage, and share AI-powered images with powerful models
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="about">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="features">Features</TabsTrigger>
            <TabsTrigger value="models">Models</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about" className="space-y-4">
            <p>
              GenHub is a powerful image generation platform that leverages the latest AI models to create high-quality images from text prompts. 
              Whether you're an artist looking for inspiration, a designer needing quick visualizations, or just curious about AI image generation, 
              GenHub provides an intuitive interface for creating and managing your AI-generated images.
            </p>
            <p>
              With support for multiple languages, customizable themes, and a user-friendly interface, GenHub makes AI image generation accessible to everyone.
            </p>
          </TabsContent>
          
          <TabsContent value="features" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FeatureCard 
                icon={<Paintbrush className="h-5 w-5 text-primary" />}
                title="Image Generation"
                description="Create images from text prompts using state-of-the-art AI models"
              />
              <FeatureCard 
                icon={<History className="h-5 w-5 text-primary" />}
                title="Generation History"
                description="Keep track of all your generated images and their parameters"
              />
              <FeatureCard 
                icon={<Star className="h-5 w-5 text-primary" />}
                title="Favorites System"
                description="Save your best generations for quick access later"
              />
              <FeatureCard 
                icon={<Settings className="h-5 w-5 text-primary" />}
                title="Advanced Settings"
                description="Fine-tune generation parameters for perfect results"
              />
            </div>
          </TabsContent>
          
          <TabsContent value="models">
            <div className="space-y-4">
              <p>
                GenHub features multiple image generation models with different styles and capabilities:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Flux Dev:</strong> General purpose image generation model</li>
                <li><strong>Flux 80s Cyberpunk:</strong> Specialized for creating cyberpunk-styled images</li>
                <li><strong>Flux Pixar:</strong> Create images in the iconic Pixar animation style</li>
                <li><strong>Flux Realistic:</strong> Photorealistic image generation with incredible detail</li>
              </ul>
              <p className="mt-4">
                Each model can be further customized with prompt templates and generation parameters to achieve exactly the look you want.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ icon, title, description }) => (
  <div className="flex items-start p-4 rounded-lg border">
    <div className="mr-4 mt-1">{icon}</div>
    <div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  </div>
);

export default AppInfo;
