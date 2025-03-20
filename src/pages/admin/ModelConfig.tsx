
import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Model, PromptTemplate, api } from '@/services/api';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit, Trash, Save } from 'lucide-react';

const modelSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Model name is required" }),
  description: z.string().optional(),
  replicateModelId: z.string().min(2, { message: "Replicate model ID is required" }),
  lora_weights: z.string().optional(),
  defaultPrompt: z.string().optional(),
});

const promptTemplateSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, { message: "Template name is required" }),
  prompt: z.string().min(2, { message: "Prompt is required" }),
  modelId: z.string(),
});

type ModelFormValues = z.infer<typeof modelSchema>;
type PromptTemplateFormValues = z.infer<typeof promptTemplateSchema>;

const ModelConfig = () => {
  const [isNewModelDialogOpen, setIsNewModelDialogOpen] = useState(false);
  const [isEditModelDialogOpen, setIsEditModelDialogOpen] = useState(false);
  const [isNewPromptDialogOpen, setIsNewPromptDialogOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState<Model | null>(null);
  const [currentModelId, setCurrentModelId] = useState<string | null>(null);
  
  const queryClient = useQueryClient();

  const { data: models, isLoading } = useQuery({
    queryKey: ['models'],
    queryFn: async () => {
      const response = await api.getModels();
      if (!response.success) {
        toast.error(response.error || 'Failed to fetch models');
        throw new Error(response.error);
      }
      return response.data || [];
    },
  });

  const createModelMutation = useMutation({
    mutationFn: async (model: Model) => {
      // This would call the API in a real implementation
      // For now, we'll use our mock data
      const response = await api.createModel(model);
      return response;
    },
    onSuccess: () => {
      toast.success('Model created successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setIsNewModelDialogOpen(false);
      modelForm.reset({
        name: '',
        description: '',
        replicateModelId: '',
        lora_weights: '',
        defaultPrompt: '',
      });
    },
    onError: (error) => {
      toast.error(`Failed to create model: ${error.message}`);
    },
  });

  const updateModelMutation = useMutation({
    mutationFn: async (model: Model) => {
      // This would call the API in a real implementation
      const response = await api.updateModel(model.id, model);
      return response;
    },
    onSuccess: () => {
      toast.success('Model updated successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setIsEditModelDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Failed to update model: ${error.message}`);
    },
  });

  const deleteModelMutation = useMutation({
    mutationFn: async (modelId: string) => {
      // This would call the API in a real implementation
      const response = await api.deleteModel(modelId);
      return response;
    },
    onSuccess: () => {
      toast.success('Model deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete model: ${error.message}`);
    },
  });

  const createPromptTemplateMutation = useMutation({
    mutationFn: async (template: PromptTemplate) => {
      // This would call the API in a real implementation
      const response = await api.createPromptTemplate(template);
      return response;
    },
    onSuccess: () => {
      toast.success('Prompt template created successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
      setIsNewPromptDialogOpen(false);
      promptTemplateForm.reset({
        name: '',
        prompt: '',
        modelId: currentModelId || '',
      });
    },
    onError: (error) => {
      toast.error(`Failed to create prompt template: ${error.message}`);
    },
  });

  const deletePromptTemplateMutation = useMutation({
    mutationFn: async ({ modelId, templateId }: { modelId: string, templateId: string }) => {
      // This would call the API in a real implementation
      const response = await api.deletePromptTemplate(modelId, templateId);
      return response;
    },
    onSuccess: () => {
      toast.success('Prompt template deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
    onError: (error) => {
      toast.error(`Failed to delete prompt template: ${error.message}`);
    },
  });

  const modelForm = useForm<ModelFormValues>({
    resolver: zodResolver(modelSchema),
    defaultValues: {
      name: '',
      description: '',
      replicateModelId: '',
      lora_weights: '',
      defaultPrompt: '',
    },
  });

  const promptTemplateForm = useForm<PromptTemplateFormValues>({
    resolver: zodResolver(promptTemplateSchema),
    defaultValues: {
      name: '',
      prompt: '',
      modelId: '',
    },
  });

  useEffect(() => {
    if (selectedModel) {
      modelForm.reset({
        id: selectedModel.id,
        name: selectedModel.name,
        description: selectedModel.description || '',
        replicateModelId: selectedModel.replicateModelId || '',
        lora_weights: selectedModel.lora_weights || '',
        defaultPrompt: selectedModel.defaultPrompt || '',
      });
    }
  }, [selectedModel, modelForm]);

  const handleCreateModel = (data: ModelFormValues) => {
    const newModel: Model = {
      id: uuidv4(),
      name: data.name,
      description: data.description,
      replicateModelId: data.replicateModelId,
      lora_weights: data.lora_weights,
      defaultPrompt: data.defaultPrompt,
      promptTemplates: [],
    };
    
    createModelMutation.mutate(newModel);
  };

  const handleUpdateModel = (data: ModelFormValues) => {
    if (!selectedModel) return;
    
    const updatedModel: Model = {
      ...selectedModel,
      name: data.name,
      description: data.description,
      replicateModelId: data.replicateModelId,
      lora_weights: data.lora_weights,
      defaultPrompt: data.defaultPrompt,
    };
    
    updateModelMutation.mutate(updatedModel);
  };

  const handleDeleteModel = (modelId: string) => {
    if (confirm('Are you sure you want to delete this model?')) {
      deleteModelMutation.mutate(modelId);
    }
  };

  const handleCreatePromptTemplate = (data: PromptTemplateFormValues) => {
    if (!currentModelId) return;
    
    const newTemplate: PromptTemplate = {
      id: uuidv4(),
      name: data.name,
      prompt: data.prompt,
      modelId: currentModelId,
    };
    
    createPromptTemplateMutation.mutate(newTemplate);
  };

  const handleDeletePromptTemplate = (modelId: string, templateId: string) => {
    if (confirm('Are you sure you want to delete this prompt template?')) {
      deletePromptTemplateMutation.mutate({ modelId, templateId });
    }
  };

  const handleEditModel = (model: Model) => {
    setSelectedModel(model);
    setIsEditModelDialogOpen(true);
  };

  const handleAddPromptTemplate = (modelId: string) => {
    setCurrentModelId(modelId);
    promptTemplateForm.reset({
      name: '',
      prompt: '',
      modelId: modelId,
    });
    setIsNewPromptDialogOpen(true);
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Model Configuration</h1>
        <p className="text-muted-foreground mt-2">
          Configure available models and prompt templates
        </p>
      </div>

      <div className="flex justify-end">
        <Dialog open={isNewModelDialogOpen} onOpenChange={setIsNewModelDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Model</DialogTitle>
              <DialogDescription>
                Configure a new model for image generation
              </DialogDescription>
            </DialogHeader>
            
            <Form {...modelForm}>
              <form onSubmit={modelForm.handleSubmit(handleCreateModel)} className="space-y-4">
                <FormField
                  control={modelForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        The display name for the model
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
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        A short description of what this model does
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
                        The Replicate model ID (e.g., "owner/model-name")
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
                        Optional LoRA weights for the model
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
                        <Textarea {...field} />
                      </FormControl>
                      <FormDescription>
                        A default prompt to use with this model
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button type="submit">Save Model</Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6">
        {models && models.length > 0 ? (
          models.map((model) => (
            <Card key={model.id} className="bg-card/40 backdrop-blur-sm">
              <CardHeader className="flex flex-row items-start justify-between">
                <div>
                  <CardTitle>{model.name}</CardTitle>
                  <CardDescription>
                    {model.description || 'No description available'}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="icon" onClick={() => handleEditModel(model)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDeleteModel(model.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium mb-1">Replicate Model ID</h4>
                    <p className="text-sm text-muted-foreground">{model.replicateModelId || 'Not set'}</p>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium mb-1">LoRA Weights</h4>
                    <p className="text-sm text-muted-foreground">{model.lora_weights || 'Not set'}</p>
                  </div>
                </div>
                
                <div>
                  <h4 className="text-sm font-medium mb-1">Default Prompt</h4>
                  <p className="text-sm text-muted-foreground">{model.defaultPrompt || 'No default prompt'}</p>
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-medium">Prompt Templates</h3>
                    <Button variant="outline" size="sm" onClick={() => handleAddPromptTemplate(model.id)}>
                      <Plus className="mr-2 h-3 w-3" />
                      Add Template
                    </Button>
                  </div>
                  
                  {model.promptTemplates && model.promptTemplates.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[50%]">Prompt</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {model.promptTemplates.map((template) => (
                          <TableRow key={template.id}>
                            <TableCell className="font-medium">{template.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground truncate max-w-[300px]">
                              {template.prompt}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeletePromptTemplate(model.id, template.id)}
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <p className="text-sm text-muted-foreground">No prompt templates available</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No models configured yet</p>
              <Button onClick={() => setIsNewModelDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Model
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Model Dialog */}
      <Dialog open={isEditModelDialogOpen} onOpenChange={setIsEditModelDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
            <DialogDescription>
              Update model configuration
            </DialogDescription>
          </DialogHeader>
          
          <Form {...modelForm}>
            <form onSubmit={modelForm.handleSubmit(handleUpdateModel)} className="space-y-4">
              <FormField
                control={modelForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Model Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
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
                      <Textarea {...field} />
                    </FormControl>
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
                      <Input {...field} />
                    </FormControl>
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
                      <Input {...field} />
                    </FormControl>
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
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* New Prompt Template Dialog */}
      <Dialog open={isNewPromptDialogOpen} onOpenChange={setIsNewPromptDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Prompt Template</DialogTitle>
            <DialogDescription>
              Create a new example prompt for this model
            </DialogDescription>
          </DialogHeader>
          
          <Form {...promptTemplateForm}>
            <form onSubmit={promptTemplateForm.handleSubmit(handleCreatePromptTemplate)} className="space-y-4">
              <FormField
                control={promptTemplateForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Name</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="E.g., Landscape, Portrait, etc." />
                    </FormControl>
                    <FormDescription>
                      A descriptive name for this prompt template
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={promptTemplateForm.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Prompt</FormLabel>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        placeholder="Enter the prompt text here..." 
                        className="min-h-[100px]"
                      />
                    </FormControl>
                    <FormDescription>
                      The prompt text that will be used for image generation
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button type="submit">Add Template</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ModelConfig;
