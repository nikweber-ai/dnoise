
import React, { useState, useRef } from 'react';
import { useImageGeneration, downloadImage } from '@/hooks/useImageGeneration';
import { Download, Info, Search, Trash, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from 'sonner';
import { GeneratedImage } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { api } from '@/services/api';

const History = () => {
  const { useGenerationHistory } = useImageGeneration();
  const { data: generationHistory, isLoading } = useGenerationHistory();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const downloadRef = useRef<HTMLAnchorElement>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredHistory = generationHistory?.filter(image => 
    image.prompt.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenDetails = (image: GeneratedImage) => {
    setSelectedImage(image);
    setDialogOpen(true);
  };

  const handleDownload = (image: GeneratedImage) => {
    downloadImage(image);
  };

  const deleteImageMutation = useMutation({
    mutationFn: async (imageId: string) => {
      const response = await api.deleteImage(imageId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete image');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('Image deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['generationHistory'] });
      setDeleteDialogOpen(false);
      setDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to delete image: ${error.message}`);
    },
  });

  const handleDeleteImage = () => {
    if (selectedImage) {
      deleteImageMutation.mutate(selectedImage.id);
    }
  };

  const handleConfirmDelete = (image: GeneratedImage) => {
    setSelectedImage(image);
    setDeleteDialogOpen(true);
  };

  const handleLoadInGenerator = (image: GeneratedImage) => {
    // Store the generation parameters in session storage
    if (image.generationParams) {
      sessionStorage.setItem('generationParams', JSON.stringify(image.generationParams));
      toast.success('Image settings loaded');
      navigate('/generate');
    } else {
      // Fallback if we don't have the full params
      const params = {
        prompt: image.prompt,
        model: image.model,
        seed: image.seed,
        width: image.width,
        height: image.height,
      };
      sessionStorage.setItem('generationParams', JSON.stringify(params));
      toast.success('Basic image settings loaded');
      navigate('/generate');
    }
  };

  return (
    <div className="space-y-8 fade-in-element">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generation History</h1>
        <p className="text-muted-foreground mt-2">
          View and manage your previously generated images
        </p>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Images</CardTitle>
              <CardDescription>
                {generationHistory?.length || 0} images generated
              </CardDescription>
            </div>
            <div className="relative w-full max-w-xs">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by prompt..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearch}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin-slow">
                <div className="h-8 w-8 border-3 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full" />
              </div>
            </div>
          ) : filteredHistory && filteredHistory.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredHistory.map((image) => (
                <div key={image.id} className="space-y-2">
                  <div className="relative group rounded-lg overflow-hidden border shadow-sm aspect-square">
                    <img
                      src={image.url}
                      alt={image.prompt}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleOpenDetails(image)}
                        className="rounded-full bg-white/20 hover:bg-white/40"
                      >
                        <Info className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleDownload(image)}
                        className="rounded-full bg-white/20 hover:bg-white/40"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleLoadInGenerator(image)}
                        className="rounded-full bg-white/20 hover:bg-white/40"
                      >
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleConfirmDelete(image)}
                        className="rounded-full bg-white/20 hover:bg-white/40"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-xs line-clamp-2 text-muted-foreground">
                    {image.prompt}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No images found</p>
              {searchTerm ? (
                <p className="text-sm mt-2">Try adjusting your search terms</p>
              ) : (
                <p className="text-sm mt-2">Go to the Generate page to create new images</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Image Details</DialogTitle>
            <DialogDescription>
              Information about this generated image
            </DialogDescription>
          </DialogHeader>
          
          {selectedImage && (
            <div className="space-y-4">
              <div className="rounded-md overflow-hidden border">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.prompt}
                  className="w-full h-auto"
                />
              </div>
              
              <div className="space-y-2">
                <div>
                  <h4 className="text-sm font-medium">Prompt</h4>
                  <p className="text-sm text-muted-foreground">{selectedImage.prompt}</p>
                </div>
                
                {selectedImage.negativePrompt && (
                  <div>
                    <h4 className="text-sm font-medium">Negative Prompt</h4>
                    <p className="text-sm text-muted-foreground">{selectedImage.negativePrompt}</p>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div>
                    <h4 className="text-sm font-medium">Dimensions</h4>
                    <p className="text-sm text-muted-foreground">{selectedImage.width} × {selectedImage.height}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Seed</h4>
                    <p className="text-sm text-muted-foreground">{selectedImage.seed}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Model</h4>
                    <p className="text-sm text-muted-foreground">{selectedImage.model}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium">Created</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(selectedImage.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleConfirmDelete(selectedImage)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleLoadInGenerator(selectedImage)}
                >
                  <ArrowUpRight className="mr-2 h-4 w-4" />
                  Use in Generator
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleDownload(selectedImage)}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Image</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this image? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteImage} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <a ref={downloadRef} style={{ display: 'none' }} />
    </div>
  );
};

export default History;
