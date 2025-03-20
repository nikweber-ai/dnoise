
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { CopyIcon, CheckIcon, RefreshCwIcon, EyeIcon, EyeOffIcon } from 'lucide-react';

const profileFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  apiKey: z.string().optional(),
  highlightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Please enter a valid hex color code (e.g. #ff653a)",
  }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

const Profile = () => {
  const { user, updateCurrentUser } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      apiKey: user?.apiKey || '',
      highlightColor: user?.highlightColor || '#ff653a',
    },
  });

  // Apply the highlight color immediately on component mount
  useEffect(() => {
    if (user?.highlightColor) {
      applyHighlightColor(user.highlightColor);
    }
  }, [user?.highlightColor]);

  const onSubmit = (data: ProfileFormValues) => {
    updateCurrentUser({
      name: data.name,
      apiKey: data.apiKey,
      highlightColor: data.highlightColor,
    });
    
    // Apply the highlight color immediately
    applyHighlightColor(data.highlightColor);
    
    toast.success('Profile updated successfully');
  };

  const applyHighlightColor = (color: string) => {
    // Convert hex to hsl
    const r = parseInt(color.slice(1, 3), 16) / 255;
    const g = parseInt(color.slice(3, 5), 16) / 255;
    const b = parseInt(color.slice(5, 7), 16) / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      
      h = Math.round(h * 60);
      if (h < 0) h += 360;
    }
    
    s = Math.round(s * 100);
    l = Math.round(l * 100);
    
    // Set the CSS variables
    document.documentElement.style.setProperty('--primary', `${h} ${s}% ${l}%`);
    // We also set the sidebar-primary to maintain color consistency
    document.documentElement.style.setProperty('--sidebar-primary', `${h} ${s}% ${l}%`);
    
    // Store the current highlighted color in localStorage
    localStorage.setItem('userHighlightColor', color);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  const generateRandomApiKey = () => {
    const randomKey = 'r8_' + Array.from({ length: 32 }, () => 
      Math.floor(Math.random() * 36).toString(36)
    ).join('');
    
    form.setValue('apiKey', randomKey);
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">
          Manage your account settings and preferences
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="api">API Settings</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Information</CardTitle>
              <CardDescription>
                Update your account details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Your name" {...field} />
                        </FormControl>
                        <FormDescription>
                          This is the name that will be displayed on your profile
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
                          <Input readOnly {...field} />
                        </FormControl>
                        <FormDescription>
                          Your email address is used for login and notifications
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Changes</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure your Replicate API key for image generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="apiKey"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Replicate API Key</FormLabel>
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
                          You need a Replicate API key to generate images. Get one at <a href="https://replicate.com/account/api-tokens" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">replicate.com</a>
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save API Key</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize your interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="highlightColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Highlight Color</FormLabel>
                        <div className="flex space-x-4 items-center">
                          <div className="h-10 w-10 rounded-md border" style={{ backgroundColor: field.value }} />
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                        </div>
                        <FormDescription>
                          This color will be used for buttons and interactive elements in the interface
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Save Appearance</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
