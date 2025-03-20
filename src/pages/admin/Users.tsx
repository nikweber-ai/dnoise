import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, User } from '@/services/api';
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
import { toast } from 'sonner';
import { Edit, Check, X } from 'lucide-react';

const userFormSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  name: z.string().optional(),
  isAdmin: z.boolean(),
  credits: z.coerce.number().int().min(0, 'Credits cannot be negative'),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const Users = () => {
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [editCredits, setEditCredits] = useState<string>('');
  const queryClient = useQueryClient();

  const { data: users, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: api.getUsers,
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
      setEditUserId(null);
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user');
    },
  });

  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: '',
      name: '',
      isAdmin: false,
      credits: 0,
    },
  });

  useEffect(() => {
    if (editUserId && users && users.data) {
      const userToEdit = users.data.find((user) => user.id === editUserId);
      if (userToEdit) {
        setEditCredits(userToEdit.credits !== undefined ? userToEdit.credits.toString() : '0');
      }
    }
  }, [editUserId, users]);

  const onSubmit = (userId: string) => {
    return async () => {
      if (!editCredits) {
        toast.error('Credits cannot be empty');
        return;
      }

      const updatedUser = { 
        credits: Number(editCredits) || 0,
      };

      updateUserMutation.mutate({ userId, userData: updatedUser });
    };
  };

  const handleEditClick = (userId: string) => {
    setEditUserId(userId);
  };

  const handleCancelClick = () => {
    setEditUserId(null);
  };

  const getModelName = (modelId: string) => {
    // Replace this with your actual logic to fetch model names based on modelId
    return `Model ${modelId}`;
  };

  const renderUserRow = (user: User) => (
    <TableRow key={user.id}>
      <TableCell>{user.id}</TableCell>
      <TableCell>{user.email}</TableCell>
      <TableCell>{user.name || 'N/A'}</TableCell>
      <TableCell>
        <span className="font-medium">
          {user.credits !== undefined ? user.credits : 'N/A'}
        </span>
      </TableCell>
      <TableCell>
        {user.models && user.models.length > 0 
          ? user.models.map(modelId => getModelName(modelId)).join(', ')
          : 'None'}
      </TableCell>
      <TableCell>{user.isAdmin ? 'Yes' : 'No'}</TableCell>
      <TableCell className="flex items-center space-x-2">
        {editUserId === user.id ? (
          <>
            <Input
              type="number"
              value={editCredits}
              onChange={(e) => setEditCredits(e.target.value)}
              className="w-24"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onSubmit(user.id)}
              disabled={updateUserMutation.isPending}
            >
              <Check className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleCancelClick}>
              <X className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <Button variant="ghost" size="icon" onClick={() => handleEditClick(user.id)}>
            <Edit className="h-4 w-4" />
          </Button>
        )}
      </TableCell>
    </TableRow>
  );

  if (isLoading) {
    return <div>Loading users...</div>;
  }

  if (isError || !users || !users.data) {
    return <div>Error loading users.</div>;
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
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Models</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.data.map(renderUserRow)}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Users;
