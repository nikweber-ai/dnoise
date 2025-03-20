import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, Model, PromptTemplate } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Edit, Trash, Plus, Save } from 'lucide-react';

const modelFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  replicateModelId: z.string().min(1, 'Replicate model ID is required'),
  defaultPrompt: z.string().optional(),
  lora_weights: z.string().optional(),
});

const promptTemplateSchema = z.object({
  name: z.string().min(1, 'Template name is required'),
  prompt: z.string().min(1, 'Prompt is required'),
  negativePrompt: z.string().optional(),
});

type ModelFormValues = z.infer<typeof modelFormSchema>;
type PromptTemplateFormValues = z.infer<typeof promptTemplateSchema>;

const Models = () => {
  const [editModelId, setEditModelId] = useState<string | null>(null);
  const [showModelForm, setShowModelForm] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [showPromptForm, setShowPromptForm] = useState(false);
  
  const queryClient = useQueryClient();

  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: api.getModels,
  });

  const modelForm = useForm<ModelFormValues>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      name: '',
      description: '',
      replicateModelId: 'black-forest-labs/flux-dev-lora',
      defaultPrompt: '',
      lora_weights: '',
    },
  });

  const promptForm = useForm<PromptTemplateFormValues>({
    resolver: zodResolver(promptTemplateSchema),
    defaultValues: {
      name: '',
      prompt: '',
      negativePrompt: '',
    },
  });

  const createModelMutation = useMutation({
    mutationFn: async (data: ModelFormValues) => {
      console.log('Creating model:', data);
      const newModel: Model = { 
        id: String(Date.now()),
        name: data.name,
        description: data.description || '',
        replicateModelId: data.replicateModelId,
        defaultPrompt: data.defaultPrompt || '',
        lora_weights: data.lora_weights || '',
        promptTemplates: [],
      };
      return newModel;
    },
    onSuccess: () => {
      toast.success('Model created successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setShowModelForm(false);
      modelForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to create model');
      console.error(error);
    },
  });

  const updateModelMutation = useMutation({
    mutationFn: async (data: { id: string; formData: ModelFormValues }) => {
      console.log('Updating model:', data);
      const updatedModel: Model = {
        id: data.id,
        name: data.formData.name,
        description: data.formData.description || '',
        replicateModelId: data.formData.replicateModelId,
        defaultPrompt: data.formData.defaultPrompt || '',
        lora_weights: data.formData.lora_weights || '',
        promptTemplates: models?.data?.find(m => m.id === data.id)?.promptTemplates || [],
      };
      return updatedModel;
    },
    onSuccess: () => {
      toast.success('Model updated successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setEditModelId(null);
      modelForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to update model');
      console.error(error);
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      console.log('Deleting model:', modelId);
      return modelId;
    },
    onSuccess: () => {
      toast.success('Model deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
    onError: (error) => {
      toast.error('Failed to delete model');
      console.error(error);
    },
  });

  const createPromptTemplateMutation = useMutation({
    mutationFn: async ({ modelId, data }: { modelId: string, data: PromptTemplateFormValues }) => {
      console.log('Creating prompt template for model:', modelId, data);
      const newTemplate: PromptTemplate = {
        id: String(Date.now()),
        modelId: modelId,
        name: data.name,
        prompt: data.prompt,
        negativePrompt: data.negativePrompt,
      };
      return { modelId, template: newTemplate };
    },
    onSuccess: () => {
      toast.success('Prompt template created successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setShowPromptForm(false);
      promptForm.reset();
    },
    onError: (error) => {
      toast.error('Failed to create prompt template');
      console.error(error);
    },
  });

  const handleEditModel = (model: Model) => {
    setEditModelId(model.id);
    modelForm.reset({
      name: model.name,
      description: model.description || '',
      replicateModelId: model.replicateModelId || 'black-forest-labs/flux-dev-lora',
      defaultPrompt: model.defaultPrompt || '',
      lora_weights: model.lora_weights || '',
    });
    setShowModelForm(true);
  };

  const handleAddPromptTemplate = (model: Model) => {
    setSelectedModel(model);
    promptForm.reset();
    setShowPromptForm(true);
  };

  const onModelSubmit = (data: ModelFormValues) => {
    if (editModelId) {
      updateModelMutation.mutate({
        id: editModelId,
        formData: data
      });
    } else {
      createModelMutation.mutate(data);
    }
  };

  const onPromptTemplateSubmit = (data: PromptTemplateFormValues) => {
    if (!selectedModel) return;
    
    createPromptTemplateMutation.mutate({
      modelId: selectedModel.id,
      data: data
    });
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Models</h1>
        <p className="text-muted-foreground mt-2">
          Configure the models available for image generation
        </p>
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => {
            setEditModelId(null);
            modelForm.reset({
              name: '',
              description: '',
              replicateModelId: 'black-forest-labs/flux-dev-lora',
              defaultPrompt: '',
              lora_weights: '',
            });
            setShowModelForm(true);
          }}
        >
          <Plus className="mr-2 h-4 w-4" /> Add Model
        </Button>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Available Models</CardTitle>
          <CardDescription>
            Manage models for image generation
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-4 text-center">Loading models...</div>
          ) : !models?.data || models.data.length === 0 ? (
            <div className="py-4 text-center">No models configured. Add your first model to get started.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Replicate Model ID</TableHead>
                  <TableHead>LoRA Weights</TableHead>
                  <TableHead>Prompt Templates</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.data.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{model.name}</div>
                        {model.description && (
                          <div className="text-sm text-muted-foreground">{model.description}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{model.replicateModelId || 'black-forest-labs/flux-dev-lora'}</TableCell>
                    <TableCell>{model.lora_weights || 'None'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {model.promptTemplates?.map((template) => (
                          <div 
                            key={template.id} 
                            className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs"
                            title={template.prompt}
                          >
                            {template.name}
                          </div>
                        ))}
                        {(!model.promptTemplates || model.promptTemplates.length < 3) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAddPromptTemplate(model)}
                          >
                            <Plus className="h-3 w-3 mr-1" /> Add Template
                          </Button>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditModel(model)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this model?')) {
                              deleteModelMutation.mutate(model.id);
                            }
                          }}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={showModelForm} onOpenChange={setShowModelForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editModelId ? 'Edit Model' : 'Add New Model'}</DialogTitle>
            <DialogDescription>
              Configure the model settings for image generation
            </DialogDescription>
          </DialogHeader>
          <Form {...modelForm}>
            <form onSubmit={modelForm.handleSubmit(onModelSubmit)} className="space-y-4">
              <FormField
                control={modelForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Flux Realistic" />
                    </FormControl>
                    <FormDescription>
                      Display name for the model
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={modelForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Photorealistic image generation" />
                    </FormControl>
                    <FormDescription>
                      Brief description of what this model is best for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={modelForm.control}
                name="replicateModelId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Replicate Model ID</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="black-forest-labs/flux-dev-lora" />
                    </FormControl>
                    <FormDescription>
                      The model ID used in Replicate API calls (e.g., "black-forest-labs/flux-dev-lora")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={modelForm.control}
                name="lora_weights"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LoRA Weights</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="fofr/flux-80s-cyberpunk" />
                    </FormControl>
                    <FormDescription>
                      Optional LoRA weights to apply (e.g., "fofr/flux-80s-cyberpunk")
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={modelForm.control}
                name="defaultPrompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Prompt</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="a beautiful photograph of a landscape, high quality, 8k" />
                    </FormControl>
                    <FormDescription>
                      Default prompt to use when selecting this model
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowModelForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editModelId ? 'Update Model' : 'Create Model'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={showPromptForm} onOpenChange={setShowPromptForm}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Prompt Template</DialogTitle>
            <DialogDescription>
              Add a new prompt template for {selectedModel?.name}
            </DialogDescription>
          </DialogHeader>
          <Form {...promptForm}>
            <form onSubmit={promptForm.handleSubmit(onPromptTemplateSubmit)} className="space-y-4">
              <FormField
                control={promptForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Landscape" />
                    </FormControl>
                    <FormDescription>
                      Short name for this prompt template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={promptForm.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="a beautiful photograph of a landscape, high quality, 8k, detailed" />
                    </FormControl>
                    <FormDescription>
                      The full prompt text
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowPromptForm(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  Add Template
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Models;
