
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, User, Model } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
} from '@/components/ui/dialog';
import {
  CheckboxItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Edit, Check, X, Settings } from 'lucide-react';

const userEditSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().optional(),
  isAdmin: z.boolean(),
  highlightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  models: z.array(z.string()),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;

const Users = () => {
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [showUserEditDialog, setShowUserEditDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  const queryClient = useQueryClient();

  const { data: users, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
  });

  const { data: models, isLoading: isLoadingModels } = useQuery({
    queryKey: ['models'],
    queryFn: api.getModels,
  });

  const form = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      email: '',
      name: '',
      isAdmin: false,
      highlightColor: '#9b87f5',
      models: [],
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; userData: Partial<User> }) => {
      const response = await api.updateUser(data.userId, data.userData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update user');
      }
      return response.data;
    },
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowUserEditDialog(false);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditUserId(user.id);
    
    form.reset({
      email: user.email,
      name: user.name || '',
      isAdmin: user.isAdmin,
      highlightColor: user.highlightColor || '#9b87f5',
      models: user.models || [],
    });
    
    setShowUserEditDialog(true);
  };

  const onSubmit = (values: UserEditFormValues) => {
    if (!editUserId) return;

    updateUserMutation.mutate({
      userId: editUserId,
      userData: values,
    });
  };

  const getModelName = (modelId: string): string => {
    if (!models?.data) return `Model ${modelId}`;
    const model = models.data.find(m => m.id === modelId);
    return model ? model.name : `Model ${modelId}`;
  };

  if (isLoadingUsers || isLoadingModels) {
    return <div>Loading...</div>;
  }

  if (!users?.data || !models?.data) {
    return <div>Error loading data.</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground mt-2">
          Manage user accounts and permissions
        </p>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>User List</CardTitle>
          <CardDescription>
            View and manage user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Models</TableHead>
                <TableHead>Highlight Color</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name || 'N/A'}</TableCell>
                  <TableCell>
                    {user.models && user.models.length > 0 
                      ? user.models.map(modelId => getModelName(modelId)).join(', ')
                      : 'None'}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="h-5 w-5 rounded-full border"
                        style={{ backgroundColor: user.highlightColor || '#9b87f5' }}
                      />
                      <span>{user.highlightColor || '#9b87f5'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditClick(user)}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* User Edit Dialog */}
      <Dialog open={showUserEditDialog} onOpenChange={setShowUserEditDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit User</DialogTitle>
            <DialogDescription>
              Modify user settings and permissions
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="highlightColor"
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
                    <FormDescription>
                      Color for UI accents in the user's interface
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="isAdmin"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Administrator
                      </FormLabel>
                      <FormDescription>
                        Grant administrative privileges to this user
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel className="text-base">Model Access</FormLabel>
                <FormDescription className="text-sm mb-2">
                  Select which models this user can access
                </FormDescription>
                <div className="space-y-2">
                  {models.data.map((model) => (
                    <FormField
                      key={model.id}
                      control={form.control}
                      name="models"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                          <FormControl>
                            <Checkbox
                              checked={field.value?.includes(model.id)}
                              onCheckedChange={(checked) => {
                                const updatedModels = checked
                                  ? [...field.value, model.id]
                                  : field.value.filter((value) => value !== model.id);
                                field.onChange(updatedModels);
                              }}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel className="text-sm font-medium">
                              {model.name}
                            </FormLabel>
                            {model.description && (
                              <FormDescription className="text-xs">
                                {model.description}
                              </FormDescription>
                            )}
                          </div>
                        </FormItem>
                      )}
                    />
                  ))}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowUserEditDialog(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
