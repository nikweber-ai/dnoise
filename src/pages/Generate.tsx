
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useModelSelection } from '@/hooks/useModels';
import { useImageGeneration, downloadImage } from '@/hooks/useImageGeneration';
import { useAuth } from '@/hooks/useAuth';
import { Model, GeneratedImage } from '@/services/api';
import { Download, RefreshCw, Zap, Image } from 'lucide-react';
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

const formSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
  negativePrompt: z.string().optional(),
  model: z.string().min(1, 'Model is required'),
  width: z.coerce.number().int().min(128).max(2048),
  height: z.coerce.number().int().min(128).max(2048),
  loraStrength: z.coerce.number().min(0).max(1),
  seed: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
  batchSize: z.coerce.number().int().min(1).max(4),
  randomizeSeed: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const Generate = () => {
  const { user } = useAuth();
  const { userModels, isLoading: isLoadingModels, getDefaultModel } = useModelSelection();
  const { generateImage, isGenerating } = useImageGeneration();
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      prompt: '',
      negativePrompt: '',
      model: '',
      width: 512,
      height: 512,
      loraStrength: 0.8,
      seed: '',
      batchSize: 1,
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

    if (user.credits <= 0) {
      toast.error('You do not have enough credits to generate images');
      return;
    }

    if (user.credits < values.batchSize) {
      toast.error(`You only have ${user.credits} credits, but this generation requires ${values.batchSize}`);
      return;
    }

    const params = {
      prompt: values.prompt,
      negativePrompt: values.negativePrompt,
      model: values.model,
      width: values.width,
      height: values.height,
      loraStrength: values.loraStrength,
      seed: values.randomizeSeed ? null : Number(values.seed) || null,
      batchSize: values.batchSize,
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
    // The form schema expects seed to be either a number or an empty string
    // We need to set it as a number directly, not as a string
    form.setValue('seed', seed);
    form.setValue('randomizeSeed', false);
  };

  const aspectRatioPresets = [
    { name: 'Square', width: 512, height: 512 },
    { name: 'Portrait', width: 512, height: 768 },
    { name: 'Landscape', width: 768, height: 512 },
    { name: 'Widescreen', width: 832, height: 512 },
  ];

  const setAspectRatio = (width: number, height: number) => {
    form.setValue('width', width);
    form.setValue('height', height);
  };

  return (
    <div className="space-y-8 fade-in-element">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Generate Images</h1>
        <p className="text-muted-foreground mt-2">
          Create AI-generated images using your Flux Dev models
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
                  name="negativePrompt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Negative Prompt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe what you want to avoid..."
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Elements to exclude from the generation
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-6 sm:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="width"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Width</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Height</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div>
                  <FormLabel className="text-sm font-medium mb-2 block">Aspect Ratio Presets</FormLabel>
                  <div className="flex flex-wrap gap-2">
                    {aspectRatioPresets.map((preset) => (
                      <Button
                        key={preset.name}
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setAspectRatio(preset.width, preset.height)}
                      >
                        {preset.name}
                      </Button>
                    ))}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="loraStrength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LoRA Strength: {field.value.toFixed(2)}</FormLabel>
                      <FormControl>
                        <Slider
                          min={0}
                          max={1}
                          step={0.01}
                          defaultValue={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <FormDescription>
                        Adjust the strength of the model's style
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

                <FormField
                  control={form.control}
                  name="batchSize"
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
                        Number of images to generate (consumes {field.value} credits)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Credits available: <span className="font-medium">{user?.credits || 0}</span>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={isGenerating || (user?.credits || 0) < form.watch('batchSize')}
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
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleDownload(image)}
                            className="rounded-full bg-white/20 hover:bg-white/40"
                          >
                            <Download className="h-5 w-5" />
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
