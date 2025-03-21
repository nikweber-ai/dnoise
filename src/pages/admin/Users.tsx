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
  CardFooter,
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Edit, Check, X, Settings, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';

const userEditSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().optional(),
  isAdmin: z.boolean(),
  highlightColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  models: z.array(z.string()),
});

const userCreateSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
  isAdmin: z.boolean().default(false),
});

type UserEditFormValues = z.infer<typeof userEditSchema>;
type UserCreateFormValues = z.infer<typeof userCreateSchema>;

const Users = () => {
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [showUserEditDialog, setShowUserEditDialog] = useState(false);
  const [showUserCreateDialog, setShowUserCreateDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const { t } = useTranslation();
  const { createUser } = useAuth();
  
  const queryClient = useQueryClient();

  // Fetch Supabase users directly
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);

  // Fetch users from Supabase
  const fetchUsers = async () => {
    setIsLoadingUsers(true);
    try {
      // Get users from Supabase Auth (requires admin privileges)
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Error fetching users:", authError);
        toast.error(t("Error fetching users"));
        
        // Fallback to mock API if admin access fails
        const mockUsersResponse = await api.getUsers();
        if (mockUsersResponse.success && mockUsersResponse.data) {
          setUsers(mockUsersResponse.data);
        }
        return;
      }
      
      if (authUsers) {
        // Fetch corresponding profiles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*');
          
        if (profilesError) {
          console.error("Error fetching profiles:", profilesError);
        }
        
        // Map auth users to our User type, enriching with profile data
        const mappedUsers = authUsers.users.map(authUser => {
          const profile = profiles?.find(p => p.id === authUser.id);
          
          return {
            id: authUser.id,
            email: authUser.email || '',
            name: profile?.name || authUser.user_metadata?.name || '',
            isAdmin: profile?.is_admin || authUser.email?.includes('admin') || false,
            apiKey: profile?.api_key || '',
            models: profile?.models || ['1', '2'],
            highlightColor: profile?.highlight_color || '#ff653a',
            profileImage: profile?.profile_image || '/placeholder.svg'
          };
        });
        
        setUsers(mappedUsers);
      }
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      toast.error(t("Failed to load users"));
      
      // Fallback to mock API
      const mockUsersResponse = await api.getUsers();
      if (mockUsersResponse.success && mockUsersResponse.data) {
        setUsers(mockUsersResponse.data);
      }
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const { data: models, isLoading: isLoadingModels } = useQuery({
    queryKey: ['models'],
    queryFn: api.getModels,
  });

  const editForm = useForm<UserEditFormValues>({
    resolver: zodResolver(userEditSchema),
    defaultValues: {
      email: '',
      name: '',
      isAdmin: false,
      highlightColor: '#ff653a',
      models: [],
    },
  });

  const createForm = useForm<UserCreateFormValues>({
    resolver: zodResolver(userCreateSchema),
    defaultValues: {
      email: '',
      password: '',
      name: '',
      isAdmin: false,
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: async (data: { userId: string; userData: Partial<User> }) => {
      // Try to update in Supabase first
      try {
        // Update user in auth if needed
        const { error: authUpdateError } = await supabase.auth.admin.updateUserById(
          data.userId,
          {
            email: data.userData.email,
            user_metadata: {
              name: data.userData.name,
              is_admin: data.userData.isAdmin
            }
          }
        );
        
        if (authUpdateError) throw authUpdateError;
        
        // Update profile
        const { error: profileUpdateError } = await supabase
          .from('profiles')
          .upsert({
            id: data.userId,
            email: data.userData.email,
            name: data.userData.name,
            is_admin: data.userData.isAdmin,
            highlight_color: data.userData.highlightColor,
            models: data.userData.models,
            updated_at: new Date().toISOString()
          });
          
        if (profileUpdateError) throw profileUpdateError;
        
        // If successful, refresh users
        await fetchUsers();
        return data.userData;
      } catch (error) {
        console.error("Supabase update error:", error);
        
        // Fallback to mock API
        const response = await api.updateUser(data.userId, data.userData);
        if (!response.success) {
          throw new Error(response.error || 'Failed to update user');
        }
        return response.data;
      }
    },
    onSuccess: () => {
      toast.success(t('User updated successfully'));
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setShowUserEditDialog(false);
    },
    onError: (error: any) => {
      toast.error(error.message || t('Failed to update user'));
    },
  });

  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setEditUserId(user.id);
    
    editForm.reset({
      email: user.email,
      name: user.name || '',
      isAdmin: user.isAdmin,
      highlightColor: user.highlightColor || '#ff653a',
      models: user.models || [],
    });
    
    setShowUserEditDialog(true);
  };

  const onEditSubmit = (values: UserEditFormValues) => {
    if (!editUserId) return;

    updateUserMutation.mutate({
      userId: editUserId,
      userData: values,
    });
  };

  const onCreateSubmit = async (values: UserCreateFormValues) => {
    try {
      const success = await createUser(
        values.email, 
        values.password, 
        values.name, 
        values.isAdmin
      );
      
      if (success) {
        toast.success(t('User created successfully'));
        createForm.reset();
        setShowUserCreateDialog(false);
        
        // Refresh user list
        fetchUsers();
      }
    } catch (error) {
      console.error("Error creating user:", error);
      toast.error(t('Failed to create user'));
    }
  };

  const getModelName = (modelId: string): string => {
    if (!models?.data) return `Model ${modelId}`;
    const model = models.data.find(m => m.id === modelId);
    return model ? model.name : `Model ${modelId}`;
  };

  if (isLoadingUsers || isLoadingModels) {
    return <div>{t('Loading...')}</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t('Users')}</h1>
          <p className="text-muted-foreground mt-2">
            {t('Manage user accounts and permissions')}
          </p>
        </div>
        <Button onClick={() => setShowUserCreateDialog(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          {t('Add User')}
        </Button>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('User List')}</CardTitle>
          <CardDescription>
            {t('View and manage user accounts')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('Email')}</TableHead>
                <TableHead>{t('Name')}</TableHead>
                <TableHead>{t('Models')}</TableHead>
                <TableHead>{t('Highlight Color')}</TableHead>
                <TableHead>{t('Admin')}</TableHead>
                <TableHead>{t('Actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.name || t('N/A')}</TableCell>
                  <TableCell>
                    {user.models && user.models.length > 0 
                      ? user.models.map(modelId => getModelName(modelId)).join(', ')
                      : t('None')}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <div 
                        className="h-5 w-5 rounded-full border"
                        style={{ backgroundColor: user.highlightColor || '#ff653a' }}
                      />
                      <span>{user.highlightColor || '#ff653a'}</span>
                    </div>
                  </TableCell>
                  <TableCell>{user.isAdmin ? t('Yes') : t('No')}</TableCell>
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
            <DialogTitle>{t('Edit User')}</DialogTitle>
            <DialogDescription>
              {t('Modify user settings and permissions')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Email')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="highlightColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Highlight Color')}</FormLabel>
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
                      {t('Color for UI accents in the user\'s interface')}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
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
                        {t('Administrator')}
                      </FormLabel>
                      <FormDescription>
                        {t('Grant administrative privileges to this user')}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <div>
                <FormLabel className="text-base">{t('Model Access')}</FormLabel>
                <FormDescription className="text-sm mb-2">
                  {t('Select which models this user can access')}
                </FormDescription>
                <div className="space-y-2">
                  {models?.data.map((model) => (
                    <FormField
                      key={model.id}
                      control={editForm.control}
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
                  {t('Cancel')}
                </Button>
                <Button type="submit">{t('Save Changes')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* User Create Dialog */}
      <Dialog open={showUserCreateDialog} onOpenChange={setShowUserCreateDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t('Create User')}</DialogTitle>
            <DialogDescription>
              {t('Add a new user to the system')}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...createForm}>
            <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
              <FormField
                control={createForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Email')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Password')}</FormLabel>
                    <FormControl>
                      <Input {...field} type="password" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Name')}</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={createForm.control}
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
                        {t('Administrator')}
                      </FormLabel>
                      <FormDescription>
                        {t('Grant administrative privileges to this user')}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowUserCreateDialog(false)}
                >
                  {t('Cancel')}
                </Button>
                <Button type="submit">{t('Create User')}</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
