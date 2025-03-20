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
  CardFooter,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  CopyIcon, 
  CheckIcon, 
  RefreshCwIcon, 
  EyeIcon, 
  EyeOffIcon, 
  KeyIcon, 
  MailIcon,
  Upload,
  Camera
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const profileFormSchema = z.object({
  name: z.string().optional(),
  email: z.string().email(),
  apiKey: z.string().optional(),
  highlightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, {
    message: "Please enter a valid hex color code (e.g. #ff653a)",
  }),
});

const passwordFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Current password is required" }),
  newPassword: z.string().min(6, { message: "Password must be at least 6 characters" }),
  confirmPassword: z.string().min(6),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

const emailFormSchema = z.object({
  currentPassword: z.string().min(6, { message: "Current password is required" }),
  newEmail: z.string().email({ message: "Please enter a valid email address" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;
type PasswordFormValues = z.infer<typeof passwordFormSchema>;
type EmailFormValues = z.infer<typeof emailFormSchema>;

const Profile = () => {
  const { user, updateCurrentUser, updatePassword, updateEmail, forgotPassword, updateProfileImage } = useAuth();
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(user?.profileImage || null);
  
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      apiKey: user?.apiKey || '',
      highlightColor: user?.highlightColor || '#ff653a',
    },
  });

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const emailForm = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      currentPassword: '',
      newEmail: '',
    },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || '',
        email: user.email || '',
        apiKey: user.apiKey || '',
        highlightColor: user.highlightColor || '#ff653a',
      });
    }
  }, [user, form]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      updateProfileImage(imageUrl);
    }
  };

  const onSubmit = (data: ProfileFormValues) => {
    updateCurrentUser({
      name: data.name,
      apiKey: data.apiKey,
      highlightColor: data.highlightColor,
    });
  };

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    const success = await updatePassword(data.currentPassword, data.newPassword);
    if (success) {
      passwordForm.reset();
      setShowPasswordDialog(false);
    }
  };

  const onEmailSubmit = async (data: EmailFormValues) => {
    const success = await updateEmail(data.currentPassword, data.newEmail);
    if (success) {
      emailForm.reset();
      setShowEmailDialog(false);
      form.setValue('email', data.newEmail);
    }
  };

  const handleForgotPassword = () => {
    if (user?.email) {
      forgotPassword(user.email);
      toast.success(`Password reset link sent to ${user.email}`);
    }
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
          <TabsTrigger value="security">Security</TabsTrigger>
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
              <div className="mb-6 flex flex-col items-center">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-2 border-primary">
                    {imagePreview ? (
                      <AvatarImage src={imagePreview} alt={user?.email || 'User'} />
                    ) : (
                      <AvatarFallback className="text-xl">
                        {user?.email?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <label 
                    className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    htmlFor="profile-image"
                  >
                    <Camera className="h-6 w-6 text-white" />
                  </label>
                  <input 
                    type="file" 
                    id="profile-image" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleImageUpload}
                  />
                </div>
                <p className="text-sm text-muted-foreground mt-2">Click to upload profile picture</p>
              </div>

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
                        <div className="flex gap-2">
                          <FormControl>
                            <Input readOnly {...field} />
                          </FormControl>
                          <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline">
                                <MailIcon className="h-4 w-4 mr-2" />
                                Change
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Change Email</DialogTitle>
                                <DialogDescription>
                                  Update your email address. You'll need to confirm your current password.
                                </DialogDescription>
                              </DialogHeader>
                              <Form {...emailForm}>
                                <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="space-y-4">
                                  <FormField
                                    control={emailForm.control}
                                    name="currentPassword"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>Current Password</FormLabel>
                                        <FormControl>
                                          <Input type="password" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                      </FormItem>
                                    )}
                                  />
                                  <FormField
                                    control={emailForm.control}
                                    name="newEmail"
                                    render={({ field }) => (
                                      <FormItem>
                                        <FormLabel>New Email</FormLabel>
                                        <FormControl>
                                          <Input type="email" {...field} />
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
                        </div>
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

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Update your password and security settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Password</h3>
                  <p className="text-sm text-muted-foreground">
                    Change your password
                  </p>
                </div>
                <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <KeyIcon className="h-4 w-4 mr-2" />
                      Change Password
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Change Password</DialogTitle>
                      <DialogDescription>
                        Enter your current password and a new password to update your credentials.
                      </DialogDescription>
                    </DialogHeader>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <Button type="button" variant="link" className="px-0" onClick={handleForgotPassword}>
                          Forgot your password?
                        </Button>
                        <DialogFooter>
                          <Button type="submit">Update Password</Button>
                        </DialogFooter>
                      </form>
                    </Form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;
