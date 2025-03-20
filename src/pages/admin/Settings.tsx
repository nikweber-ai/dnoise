import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

const themeFormSchema = z.object({
  lightModeBackground: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  lightModeHighlight: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  darkModeBackground: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  darkModeHighlight: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  defaultHighlightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
});

const apiFormSchema = z.object({
  apiEndpoint: z.string().url('Please enter a valid URL'),
  defaultTimeout: z.coerce.number().int().positive('Timeout must be positive'),
});

const systemFormSchema = z.object({
  maxImagesPerBatch: z.coerce.number().int().min(1, 'Must allow at least 1 image per batch'),
  emailNotificationsEnabled: z.boolean(),
  systemAnnouncementText: z.string().optional(),
  debugMode: z.boolean(),
});

type ThemeFormValues = z.infer<typeof themeFormSchema>;
type ApiFormValues = z.infer<typeof apiFormSchema>;
type SystemFormValues = z.infer<typeof systemFormSchema>;

const Settings = () => {
  const themeForm = useForm<ThemeFormValues>({
    resolver: zodResolver(themeFormSchema),
    defaultValues: {
      lightModeBackground: '#FFFFFF',
      lightModeHighlight: '#ff653a',
      darkModeBackground: '#1A1A1A',
      darkModeHighlight: '#ff653a',
      defaultHighlightColor: '#ff653a',
    },
  });

  const apiForm = useForm<ApiFormValues>({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      apiEndpoint: 'https://api.replicate.com/v1',
      defaultTimeout: 60,
    },
  });

  const systemForm = useForm<SystemFormValues>({
    resolver: zodResolver(systemFormSchema),
    defaultValues: {
      maxImagesPerBatch: 4,
      emailNotificationsEnabled: true,
      systemAnnouncementText: '',
      debugMode: false,
    },
  });

  const onThemeSubmit = (data: ThemeFormValues) => {
    toast.success('Theme settings updated successfully');
    console.log('Theme settings:', data);
    
    // In a real implementation, this would update a database
    localStorage.setItem('themeSettings', JSON.stringify(data));
  };

  const onApiSubmit = (data: ApiFormValues) => {
    toast.success('API settings updated successfully');
    console.log('API settings:', data);
  };

  const onSystemSubmit = (data: SystemFormValues) => {
    toast.success('System settings updated successfully');
    console.log('System settings:', data);
    
    // In a real implementation, this would update a database
    localStorage.setItem('systemSettings', JSON.stringify(data));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure application settings and appearance
        </p>
      </div>

      <Tabs defaultValue="system">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="system">System</TabsTrigger>
          <TabsTrigger value="api">API Configuration</TabsTrigger>
          <TabsTrigger value="theme">Theme</TabsTrigger>
        </TabsList>
        
        <TabsContent value="system">
          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>System Configuration</CardTitle>
              <CardDescription>
                General application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...systemForm}>
                <form onSubmit={systemForm.handleSubmit(onSystemSubmit)} className="space-y-4">
                  <FormField
                    control={systemForm.control}
                    name="maxImagesPerBatch"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Max Images Per Batch</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximum number of images users can generate in one batch
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={systemForm.control}
                    name="systemAnnouncementText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>System Announcement</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter a system-wide announcement message..." 
                            className="resize-none"
                            {...field} 
                          />
                        </FormControl>
                        <FormDescription>
                          This message will be displayed to all users
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 grid-cols-2">
                    <FormField
                      control={systemForm.control}
                      name="emailNotificationsEnabled"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Email Notifications</FormLabel>
                            <FormDescription>
                              Send email notifications to users
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

                    <FormField
                      control={systemForm.control}
                      name="debugMode"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Debug Mode</FormLabel>
                            <FormDescription>
                              Enable verbose logging
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
                  </div>

                  <Button type="submit">Save System Settings</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure the Replicate API connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...apiForm}>
                <form onSubmit={apiForm.handleSubmit(onApiSubmit)} className="space-y-4">
                  <FormField
                    control={apiForm.control}
                    name="apiEndpoint"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Endpoint</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          The base URL for the Replicate API
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={apiForm.control}
                    name="defaultTimeout"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Request Timeout (seconds)</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Maximum time to wait for API responses
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
          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Theme Settings</CardTitle>
              <CardDescription>
                Configure the application appearance and color scheme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...themeForm}>
                <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-4">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Light Mode</h3>
                      <div className="space-y-4">
                        <FormField
                          control={themeForm.control}
                          name="lightModeBackground"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Background Color</FormLabel>
                              <div className="flex space-x-2">
                                <div 
                                  className="h-10 w-10 rounded-md border"
                                  style={{ backgroundColor: field.value }}
                                />
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={themeForm.control}
                          name="lightModeHighlight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Highlight Color</FormLabel>
                              <div className="flex space-x-2">
                                <div 
                                  className="h-10 w-10 rounded-md border"
                                  style={{ backgroundColor: field.value }}
                                />
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-medium mb-4">Dark Mode</h3>
                      <div className="space-y-4">
                        <FormField
                          control={themeForm.control}
                          name="darkModeBackground"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Background Color</FormLabel>
                              <div className="flex space-x-2">
                                <div 
                                  className="h-10 w-10 rounded-md border"
                                  style={{ backgroundColor: field.value }}
                                />
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={themeForm.control}
                          name="darkModeHighlight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Highlight Color</FormLabel>
                              <div className="flex space-x-2">
                                <div 
                                  className="h-10 w-10 rounded-md border"
                                  style={{ backgroundColor: field.value }}
                                />
                                <FormControl>
                                  <Input {...field} />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>

                  <FormField
                    control={themeForm.control}
                    name="defaultHighlightColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default User Highlight Color</FormLabel>
                        <div className="flex space-x-2">
                          <div 
                            className="h-10 w-10 rounded-md border"
                            style={{ backgroundColor: field.value }}
                          />
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </div>
                        <FormDescription>
                          Default highlight color for new users
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
