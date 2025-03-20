
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useModelSelection } from '@/hooks/useModels';
import { useImageGeneration, downloadImage } from '@/hooks/useImageGeneration';
import { useAuth } from '@/hooks/useAuth';
import { Model, GeneratedImage } from '@/services/api';
import { Download, RefreshCw, Zap, Image, BookmarkPlus, Bookmark } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { useFavorites } from '@/hooks/useFavorites';
import { usePromptTemplates } from '@/hooks/usePromptTemplates';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const aspectRatioPresets = [
  { name: '1:1', value: '1:1', description: 'Square' },
  { name: '9:16', value: '9:16', description: 'Portrait (Instagram Story)' },
  { name: '16:9', value: '16:9', description: 'Landscape (HD Video)' },
  { name: '4:5', value: '4:5', description: 'Portrait (Instagram Post)' },
  { name: '3:4', value: '3:4', description: 'Portrait (Standard)' },
  { name: '2:1', value: '2:1', description: 'Landscape (Panoramic)' },
  { name: '1:2', value: '1:2', description: 'Portrait (Tall)' },
];

const formSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  model: z.string().min(1, 'Model is required'),
  aspect_ratio: z.string().default('1:1'),
  lora_scale: z.coerce.number().min(0).max(1.5),
  seed: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
  num_outputs: z.coerce.number().int().min(1).max(4),
  output_quality: z.coerce.number().int().min(0).max(100),
  num_inference_steps: z.coerce.number().int().min(1).max(50),
  randomizeSeed: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const Generate = () => {
  const { user } = useAuth();
  const { userModels, isLoading: isLoadingModels, getDefaultModel } = useModelSelection();
  const { generateImage, isGenerating } = useImageGeneration();
  const { toggleFavorite } = useFavorites();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  // Get prompt templates for the selected model
  const { templates: promptTemplates, isLoading: isLoadingTemplates } = usePromptTemplates(
    selectedModel?.id || ''
  );

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      model: '',
      aspect_ratio: '1:1',
      lora_scale: 1,
      seed: '',
      num_outputs: 1,
      output_quality: 100,
      num_inference_steps: 28,
      randomizeSeed: true,
    },
  });

  useEffect(() => {
    if (userModels && userModels.length > 0) {
      const defaultModel = getDefaultModel();
      if (defaultModel) {
        form.setValue('model', defaultModel.id);
        form.setValue('prompt', defaultModel.defaultPrompt || '');
        setSelectedModel(defaultModel);
      }
    }
  }, [userModels, getDefaultModel, form]);

  const handleModelChange = (modelId: string) => {
    const model = userModels?.find(m => m.id === modelId) || null;
    setSelectedModel(model);
    if (model?.defaultPrompt && form.getValues('prompt') === '') {
      form.setValue('prompt', model.defaultPrompt);
    }
  };

  const onSubmit = (values: FormValues) => {
    if (!user) {
      toast.error('You must be logged in to generate images');
      return;
    }

    if (!user.apiKey && !user.isAdmin) {
      toast.error('Please set your Replicate API key in your profile');
      return;
    }

    const params = {
      prompt: values.prompt,
      model: values.model,
      aspect_ratio: values.aspect_ratio,
      lora_scale: values.lora_scale,
      seed: values.randomizeSeed ? null : Number(values.seed) || null,
      num_outputs: values.num_outputs,
      output_quality: values.output_quality,
      num_inference_steps: values.num_inference_steps,
      lora_weights: selectedModel?.lora_weights || undefined,
    };

    generateImage(params, {
      onSuccess: (data) => {
        setGeneratedImages(data);
      },
    });
  };

  const handleDownload = (image: GeneratedImage) => {
    downloadImage(image);
  };

  const handleUsePrompt = (prompt: string) => {
    form.setValue('prompt', prompt);
  };

  const handleUseSeed = (seed: number) => {
    form.setValue('seed', seed);
    form.setValue('randomizeSeed', false);
  };

  const handleToggleFavorite = (imageId: string) => {
    toggleFavorite(imageId);
  };

  const handleUseTemplate = (template: { prompt: string }) => {
    form.setValue('prompt', template.prompt);
  };

  return (
    <div className="space-y-8 fade-in-element">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Images</h1>
        <p className="text-muted-foreground mt-2">
          Create AI-generated images using Replicate
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="glassmorphism">
          <CardHeader>
            <CardTitle>Generation Settings</CardTitle>
            <CardDescription>
              Configure your image generation parameters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <Select
                        disabled={isLoadingModels}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleModelChange(value);
                        }}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a model" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {userModels?.map((model) => (
                            <SelectItem key={model.id} value={model.id}>
                              {model.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedModel?.description && (
                        <FormDescription>
                          {selectedModel.description}
                        </FormDescription>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {promptTemplates && promptTemplates.length > 0 && (
                  <div className="mb-4">
                    <FormLabel className="text-sm font-medium mb-2 block">Prompt Templates</FormLabel>
                    <div className="flex flex-wrap gap-2">
                      {promptTemplates.map((template) => (
                        <Button
                          key={template.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleUseTemplate(template)}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}

                <FormField
                  control={form.control}
                  name="prompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what you want to generate..."
                          className="resize-none min-h-24"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="aspect_ratio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Aspect Ratio</FormLabel>
                      <div className="grid grid-cols-4 gap-2">
                        {aspectRatioPresets.map((preset) => (
                          <Button
                            key={preset.value}
                            type="button"
                            variant={field.value === preset.value ? "default" : "outline"}
                            size="sm"
                            onClick={() => field.onChange(preset.value)}
                            title={preset.description}
                          >
                            {preset.name}
                          </Button>
                        ))}
                      </div>
                      <FormDescription>
                        Select an aspect ratio for your generated image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lora_scale"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LoRA Strength: {field.value.toFixed(2)}</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1.5}
                          step={0.01}
                          defaultValue={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Adjust the strength of the model's style (Default: 1.0, Max: 1.5)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="randomizeSeed"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Randomize Seed</FormLabel>
                          <FormDescription>
                            Generate a random seed for each image
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={(checked) => {
                              field.onChange(checked);
                              if (checked) {
                                form.setValue('seed', '');
                              }
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="seed"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Seed</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            disabled={form.watch('randomizeSeed')}
                            onChange={(e) => {
                              if (e.target.value === '') {
                                field.onChange('');
                              } else {
                                field.onChange(e.target.value);
                              }
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          Fixed seed for reproducible results
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="num_outputs"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Batch Size: {field.value}</FormLabel>
                        <FormControl>
                          <Slider
                            min={1}
                            max={4}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Number of images to generate in one batch
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="output_quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Output Quality: {field.value}%</FormLabel>
                        <FormControl>
                          <Slider
                            min={0}
                            max={100}
                            step={1}
                            defaultValue={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                          />
                        </FormControl>
                        <FormDescription>
                          Output image quality (0-100)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="num_inference_steps"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Steps: {field.value}</FormLabel>
                      <FormControl>
                        <Slider
                          min={1}
                          max={50}
                          step={1}
                          defaultValue={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of denoising steps (1-50, more steps = higher quality but slower)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center">
                  {!user?.isAdmin && !user?.apiKey && (
                    <div className="text-sm text-red-500">
                      Please add your Replicate API key in your profile to generate images
                    </div>
                  )}
                  <Button 
                    type="submit" 
                    disabled={isGenerating || (!user?.isAdmin && !user?.apiKey)}
                    className="min-w-32"
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        Generate
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="glassmorphism">
            <CardHeader>
              <CardTitle>Generated Images</CardTitle>
              <CardDescription>
                View and download your generated images
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex flex-col items-center justify-center py-10 space-y-4">
                  <div className="animate-spin-slow">
                    <div className="h-16 w-16 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full" />
                  </div>
                  <p className="text-muted-foreground">Generating your images...</p>
                </div>
              ) : generatedImages.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {generatedImages.map((image) => (
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
                            {image.isFavorite ? 
                              <Bookmark className="h-5 w-5 fill-current" /> : 
                              <BookmarkPlus className="h-5 w-5" />
                            }
                          </Button>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleUsePrompt(image.prompt)}
                        >
                          Use Prompt
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-xs h-7"
                          onClick={() => handleUseSeed(image.seed)}
                        >
                          Use Seed: {image.seed}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-10 space-y-2 text-center">
                  <Image className="h-12 w-12 text-muted-foreground/30" />
                  <p className="text-muted-foreground">Your generated images will appear here</p>
                  <p className="text-xs text-muted-foreground/80">
                    Configure your parameters and click Generate
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Generate;
