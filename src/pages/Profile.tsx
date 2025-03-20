
import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
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
import { useModelSelection } from '@/hooks/useModels';

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email('Please enter a valid email'),
});

type FormValues = z.infer<typeof formSchema>;

const Profile = () => {
  const { user } = useAuth();
  const { userModels, isLoading: isLoadingModels } = useModelSelection();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
    },
  });

  const onSubmit = (data: FormValues) => {
    // In a real app, this would call an API to update the user profile
    toast.success('Profile updated successfully');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
                <Button type="submit">Save changes</Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="bg-card/40 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Subscription Details</CardTitle>
              <CardDescription>
                Information about your current plan
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium">Account Type</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.isAdmin ? 'Administrator Account' : 'Standard Account'}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Current Credits</h3>
                <p className="text-sm text-muted-foreground">{user?.credits || 0} credits</p>
              </div>
              <div>
                <h3 className="text-sm font-medium">Next Credit Reset</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.creditsReset ? formatDate(user.creditsReset) : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

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
    </div>
  );
};

export default Profile;
