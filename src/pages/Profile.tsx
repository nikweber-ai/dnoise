
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, ExternalLink, Eye, EyeOff } from 'lucide-react';
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
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useModelSelection } from '@/hooks/useModels';

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email'),
});

const apiKeySchema = z.object({
  apiKey: z.string().min(1, 'API key is required'),
});

type FormValues = z.infer<typeof formSchema>;
type ApiKeyFormValues = z.infer<typeof apiKeySchema>;

const Profile = () => {
  const { user, updateCurrentUser } = useAuth();
  const { userModels, isLoading: isLoadingModels } = useModelSelection();
  const [showApiKey, setShowApiKey] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const apiKeyForm = useForm<ApiKeyFormValues>({
    resolver: zodResolver(apiKeySchema),
    defaultValues: {
      apiKey: user?.apiKey || '',
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: Partial<FormValues>) => {
      if (!user) throw new Error('User not authenticated');
      const response = await api.updateUser(user.id, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update profile');
      }
      return response.data;
    },
    onSuccess: (data) => {
      updateCurrentUser(data);
      toast.success('Profile updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update profile');
    },
  });

  const updateApiKeyMutation = useMutation({
    mutationFn: async (data: ApiKeyFormValues) => {
      if (!user) throw new Error('User not authenticated');
      const response = await api.updateUser(user.id, { apiKey: data.apiKey });
      if (!response.success) {
        throw new Error(response.error || 'Failed to update API key');
      }
      return response.data;
    },
    onSuccess: (data) => {
      updateCurrentUser(data);
      toast.success('API key updated successfully');
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update API key');
    },
  });

  const onSubmit = (data: FormValues) => {
    updateUserMutation.mutate(data);
  };

  const onApiKeySubmit = (data: ApiKeyFormValues) => {
    updateApiKeyMutation.mutate(data);
  };

  const toggleApiKeyVisibility = () => {
    setShowApiKey(!showApiKey);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account information and settings
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>
              Update your personal information
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your display name
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormDescription>
                        This is your registered email address
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button 
                  type="submit" 
                  disabled={updateUserMutation.isPending}
                >
                  {updateUserMutation.isPending ? 'Saving...' : 'Save changes'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {!user?.isAdmin && (
          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Replicate API Key</CardTitle>
              <CardDescription>
                Configure your API key for image generation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Important</AlertTitle>
                <AlertDescription>
                  You need a Replicate API key to generate images. The API key will be stored securely in your browser.
                </AlertDescription>
              </Alert>
              
              <div className="text-sm space-y-2">
                <p>To get your API key:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Create an account on <a href="https://replicate.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center">
                    Replicate <ExternalLink className="h-3 w-3 ml-1" />
                  </a></li>
                  <li>Go to your account settings</li>
                  <li>Create a new API token</li>
                  <li>Copy the token and paste it below</li>
                </ol>
              </div>
              
              <Form {...apiKeyForm}>
                <form onSubmit={apiKeyForm.handleSubmit(onApiKeySubmit)} className="space-y-4">
                  <FormField
                    control={apiKeyForm.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <div className="flex space-x-2">
                          <FormControl>
                            <div className="relative w-full">
                              <Input 
                                type={showApiKey ? "text" : "password"} 
                                {...field} 
                                placeholder="r8_..." 
                                className="pr-10"
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-0 top-0 h-full px-3"
                                onClick={toggleApiKeyVisibility}
                              >
                                {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                        </div>
                        <FormDescription>
                          Your Replicate API key starting with "r8_"
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button 
                    type="submit"
                    disabled={updateApiKeyMutation.isPending}
                  >
                    {updateApiKeyMutation.isPending ? 'Saving...' : 'Save API Key'}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Your Models</CardTitle>
            <CardDescription>
              Models you have access to
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingModels ? (
              <div className="py-4 flex justify-center">
                <div className="animate-spin-slow">
                  <div className="h-5 w-5 border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full" />
                </div>
              </div>
            ) : userModels && userModels.length > 0 ? (
              <ul className="space-y-2">
                {userModels.map((model) => (
                  <li key={model.id} className="border rounded-md p-3">
                    <div className="font-medium">{model.name}</div>
                    {model.description && (
                      <div className="text-sm text-muted-foreground mt-1">{model.description}</div>
                    )}
                    {model.lora_weights && (
                      <div className="text-xs text-muted-foreground mt-1">
                        LoRA: {model.lora_weights}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground text-center py-4">
                You don't have access to any models
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
