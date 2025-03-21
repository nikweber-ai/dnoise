
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from '@/hooks/useTranslation';

const formSchema = z.object({
  email: z.string().email("Email inválido"),
  name: z.string().min(1, "Nome é obrigatório"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  isAdmin: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

const CreateUser = () => {
  const { isAdmin, createUser } = useAuth();
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
      password: '',
      isAdmin: false,
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      const success = await createUser(
        data.email, 
        data.password, 
        data.name,
        data.isAdmin
      );
      
      if (success) {
        form.reset();
        toast.success(t('User created successfully!'));
      }
    } catch (error) {
      console.error('Error creating user:', error);
      toast.error(t('Failed to create user. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{t('Access Denied')}</CardTitle>
            <CardDescription>
              {t('You do not have permission to access this page.')}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('Create User')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('Create new users with controlled access')}
        </p>
      </div>

      <Card className="bg-card/40 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>{t('New User')}</CardTitle>
          <CardDescription>
            {t('Create a new user account with custom permissions')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('Password')}</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
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
                        {t('Administrator')}
                      </FormLabel>
                      <FormDescription>
                        {t('Grant administrative privileges to this user')}
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isSubmitting}
              >
                {isSubmitting ? t('Creating...') : t('Create User')}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateUser;
