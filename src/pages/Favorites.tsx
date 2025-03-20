
import React from 'react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { downloadImage } from '@/hooks/useImageGeneration';
import { GeneratedImage } from '@/services/api';
import { Download, Bookmark, Image } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const Favorites = () => {
  const { user } = useAuth();
  const { useFavoriteImages, toggleFavorite } = useFavorites();
  const { data: favoriteImages, isLoading } = useFavoriteImages();

  const handleDownload = (image: GeneratedImage) => {
    downloadImage(image);
  };

  const handleToggleFavorite = (imageId: string) => {
    toggleFavorite(imageId);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Favorites</h1>
        <p className="text-muted-foreground mt-2">
          Your favorite generated images
        </p>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Favorite Images</CardTitle>
          <CardDescription>
            Images you've saved to your favorites
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin-slow">
                <div className="h-8 w-8 border-3 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full" />
              </div>
            </div>
          ) : favoriteImages && favoriteImages.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {favoriteImages.map((image) => (
                <div key={image.id} className="space-y-2">
                  <div className="relative group rounded-lg overflow-hidden border bg-card shadow-sm">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full aspect-square object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDownload(image)}
                        className="rounded-full bg-white/20 hover:bg-white/40"
                      >
                        <Download className="h-5 w-5" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleToggleFavorite(image.id)}
                        className="rounded-full bg-white/20 hover:bg-white/40"
                      >
                        <Bookmark className="h-5 w-5 fill-current" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">
                    {image.prompt}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto text-muted-foreground/30" />
              <p className="text-muted-foreground mt-4">No favorite images yet</p>
              <p className="text-sm text-muted-foreground/80">
                Mark images as favorites in the Generate or History pages
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Favorites;
