
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTheme } from '@/hooks/useTheme';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { CheckIcon, CopyIcon, EyeIcon, EyeOffIcon, RefreshCwIcon } from 'lucide-react';

const systemSettingsSchema = z.object({
  appName: z.string().min(2, { message: "App name is required" }),
  description: z.string().optional(),
  allowUserRegistration: z.boolean(),
  defaultModels: z.array(z.string()),
});

const apiSettingsSchema = z.object({
  adminApiKey: z.string().optional(),
  replicateModelId: z.string(),
});

const themeSettingsSchema = z.object({
  defaultHighlightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Please enter a valid hex color code (e.g. #ff653a)",
  }),
  darkModeBackground: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Please enter a valid hex color code",
  }),
  lightModeBackground: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Please enter a valid hex color code",
  }),
});

const Settings = () => {
  const { theme, applyHighlightColor } = useTheme();
  const { user, updateCurrentUser } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);

  const systemForm = useForm<z.infer<typeof systemSettingsSchema>>({
    resolver: zodResolver(systemSettingsSchema),
    defaultValues: {
      appName: 'GenHub',
      description: 'AI-powered image generation platform',
      allowUserRegistration: true,
      defaultModels: ['1', '2'],
    },
  });

  const apiForm = useForm<z.infer<typeof apiSettingsSchema>>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      adminApiKey: user?.apiKey || '',
      replicateModelId: 'black-forest-labs/flux-dev-lora',
    },
  });

  const themeForm = useForm<z.infer<typeof themeSettingsSchema>>({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: {
      defaultHighlightColor: '#ff653a',
      darkModeBackground: '#1a1a1a',
      lightModeBackground: '#f8fafc',
    },
  });

  const onSystemSubmit = (data: z.infer<typeof systemSettingsSchema>) => {
    toast.success('System settings updated successfully');
    console.log('System settings:', data);
  };

  const onApiSubmit = (data: z.infer<typeof apiSettingsSchema>) => {
    // Update the admin's API key
    if (user && user.isAdmin) {
      updateCurrentUser({
        apiKey: data.adminApiKey
      });
    }
    toast.success('API settings updated successfully');
    console.log('API settings:', data);
  };

  const onThemeSubmit = (data: z.infer<typeof themeSettingsSchema>) => {
    // Apply the highlight color immediately
    applyHighlightColor(data.defaultHighlightColor);
    
    // Update CSS variables for theme colors
    document.documentElement.style.setProperty('--background', `0 0% ${getLightness(data.lightModeBackground)}%`);
    document.documentElement.style.setProperty('--sidebar-background', `0 0% ${getLightness(data.lightModeBackground)}%`);
    
    // Set dark mode background custom property
    const darkModeValue = `220 10% ${getLightness(data.darkModeBackground)}%`;
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      .dark {
        --background: ${darkModeValue};
        --sidebar-background: ${darkModeValue};
        --card: 220 10% ${Math.max(2, getLightness(data.darkModeBackground) - 2)}%;
      }
    `;
    document.head.appendChild(styleElement);
    
    toast.success('Theme settings updated successfully');
    console.log('Theme settings:', data);
  };

  // Helper function to get lightness from hex
  const getLightness = (hex: string): number => {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2 * 100;
    
    return Math.round(l);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const generateRandomApiKey = () => {
    const randomKey = 'r8_' + Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('');
    
    apiForm.setValue('adminApiKey', randomKey);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure global application settings
        </p>
      </div>

      <Tabs defaultValue="system">
        <TabsList className="mb-6">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...systemForm}>
                <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-6">
                  <FormField
                    control={systemForm.control}
                    name="appName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Application Name</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The name of your application as displayed to users
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={systemForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormDescription>
                          A brief description of your application
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={systemForm.control}
                    name="allowUserRegistration"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Enable User Registration
                          </FormLabel>
                          <FormDescription>
                            Allow new users to register for accounts
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save System Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure API keys and connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiForm}>
                <form onSubmit={apiForm.handleSubmit(onApiSubmit)} className="space-y-6">
                  <FormField
                    control={apiForm.control}
                    name="adminApiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Admin Replicate API Key</FormLabel>
                        <div className="flex gap-2">
                          <FormControl>
                            <div className="relative w-full">
                              <Input 
                                type={showApiKey ? "text" : "password"} 
                                placeholder="r8_..."
                                className="pr-20 w-full min-w-96"
                                {...field} 
                              />
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-8 top-0 h-full"
                                onClick={() => setShowApiKey(!showApiKey)}
                              >
                                {showApiKey ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
                              </Button>
                            </div>
                          </FormControl>
                          <div className="flex-shrink-0 flex gap-2">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => copyToClipboard(field.value || '')}
                            >
                              <CopyIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={generateRandomApiKey}
                            >
                              <RefreshCwIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <FormDescription>
                          Admin API key for Replicate. Optional for admins, but required for testing image generation.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={apiForm.control}
                    name="replicateModelId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Replicate Model ID</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The default Replicate model ID used for image generation (e.g., black-forest-labs/flux-dev-lora)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save API Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="theme">
          <Card>
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Configure the appearance of your application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...themeForm}>
                <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-6">
                  <FormField
                    control={themeForm.control}
                    name="defaultHighlightColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Highlight Color</FormLabel>
                        <div className="flex space-x-4 items-center">
                          <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: field.value }} />
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </div>
                        <FormDescription>
                          The default color for buttons and interactive elements
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={themeForm.control}
                    name="darkModeBackground"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dark Mode Background</FormLabel>
                        <div className="flex space-x-4 items-center">
                          <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: field.value }} />
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </div>
                        <FormDescription>
                          The background color used in dark mode
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={themeForm.control}
                    name="lightModeBackground"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Light Mode Background</FormLabel>
                        <div className="flex space-x-4 items-center">
                          <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: field.value }} />
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </div>
                        <FormDescription>
                          The background color used in light mode
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Theme Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
