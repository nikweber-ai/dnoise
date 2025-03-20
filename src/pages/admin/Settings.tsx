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
import { toast } from 'sonner';

const apiFormSchema = z.object({
  apiEndpoint: z.string().url('Please enter a valid URL'),
  apiKey: z.string().min(1, 'API key is required'),
  defaultTimeout: z.coerce.number().int().positive('Timeout must be positive'),
});

const systemFormSchema = z.object({
  defaultCredits: z.coerce.number().int().min(0, 'Default credits cannot be negative'),
  monthlyCredits: z.coerce.number().int().min(0, 'Monthly credits cannot be negative'),
  creditRolloverEnabled: z.boolean(),
  creditResetDay: z.coerce.number().int().min(1, 'Day must be between 1 and 31').max(31, 'Day must be between 1 and 31'),
  maxImagesPerBatch: z.coerce.number().int().min(1, 'Must allow at least 1 image per batch'),
  emailNotificationsEnabled: z.boolean(),
  systemAnnouncementText: z.string().optional(),
  debugMode: z.boolean(),
});

type ApiFormValues = z.infer<typeof apiFormSchema>;
type SystemFormValues = z.infer<typeof systemFormSchema>;

const Settings = () => {
  const apiForm = useForm<ApiFormValues>({
    resolver: zodResolver(apiFormSchema),
    defaultValues: {
      apiEndpoint: 'https://api.comfydeploy.com/v1',
      apiKey: '****************************************',
      defaultTimeout: 60,
    },
  });

  const systemForm = useForm<SystemFormValues>({
    resolver: zodResolver(systemFormSchema),
    defaultValues: {
      defaultCredits: 0, // New users start with 0 credits
      monthlyCredits: 100, // Monthly rollover credits
      creditRolloverEnabled: true, // Enable credit rollover by default
      creditResetDay: 1,
      maxImagesPerBatch: 4,
      emailNotificationsEnabled: true,
      systemAnnouncementText: '',
      debugMode: false,
    },
  });

  const onApiSubmit = (data: ApiFormValues) => {
    toast.success('API settings updated successfully');
    console.log('API settings:', data);
  };

  const onSystemSubmit = (data: SystemFormValues) => {
    toast.success('System settings updated successfully');
    console.log('System settings:', data);
    
    // In a real implementation, this would update a database
    // For now, we'll save to localStorage for demo purposes
    localStorage.setItem('systemSettings', JSON.stringify(data));
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground mt-2">
          Configure application settings and API connections
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure the Comfy Deploy API connection
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
                        The base URL for the Comfy Deploy API
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={apiForm.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormDescription>
                        Your Comfy Deploy API authentication key
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
                <div className="grid gap-4 grid-cols-2">
                  <FormField
                    control={systemForm.control}
                    name="defaultCredits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Default Credits</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Initial credits for new users
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={systemForm.control}
                    name="creditResetDay"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Credit Reset Day</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} min={1} max={31} />
                        </FormControl>
                        <FormDescription>
                          Day of month to reset credits
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid gap-4 grid-cols-2">
                  <FormField
                    control={systemForm.control}
                    name="monthlyCredits"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Credits</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} />
                        </FormControl>
                        <FormDescription>
                          Credits given monthly on reset day
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={systemForm.control}
                    name="creditRolloverEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Enable Credit Rollover</FormLabel>
                          <FormDescription>
                            Automatically give credits on reset day
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
      </div>
    </div>
  );
};

export default Settings;
