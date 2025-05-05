
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { updateUser, updateUserPassword } from '@/lib/auth';
import type { User } from '@/types/user';

const userSchema = z.object({
  username: z.string().min(3, 'Логин должен содержать не менее 3 символов'),
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  email: z.string().email('Неверный формат email').optional().or(z.literal('')),
  phoneNumber: z.string().min(5, 'Неверный номер телефона'),
  carMake: z.string().min(1, 'Марка машины обязательна'),
  carModel: z.string().min(1, 'Модель машины обязательна'),
  vinCode: z.string().length(17, 'VIN должен содержать 17 символов').regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'Неверный формат VIN'),
  isAdmin: z.boolean().optional(),
  newPassword: z.string().min(8, 'Пароль должен содержать минимум 8 символов').optional().or(z.literal('')),
});

type UserFormData = z.infer<typeof userSchema>;

interface EditUserFormProps {
  user: User | null; // Now expects full User object
  isOpen: boolean;
  onClose: () => void;
  onUserUpdated: () => void;
}

export const EditUserForm: React.FC<EditUserFormProps> = ({ user, isOpen, onClose, onUserUpdated }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
  });

  useEffect(() => {
    if (user && isOpen) {
      setValue('username', user.username);
      setValue('firstName', user.firstName);
      setValue('lastName', user.lastName);
      setValue('email', user.email || '');
      setValue('phoneNumber', user.phoneNumber);
      setValue('carMake', user.carMake);
      setValue('carModel', user.carModel);
      setValue('vinCode', user.vinCode);
      setValue('isAdmin', user.isAdmin || false);
      setValue('newPassword', ''); // Clear password field on open
      setError(null);
    } else if (!isOpen) {
      reset();
      setError(null);
    }
  }, [user, isOpen, reset, setValue]);

  const onSubmit: SubmitHandler<UserFormData> = async (data) => {
    if (!user) return;

    setIsLoading(true);
    setError(null);

    try {
      // Update user details (excluding password)
      const userDataToUpdate: Partial<Omit<User, 'id' | 'password'>> = {
        username: data.username,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber,
        carMake: data.carMake,
        carModel: data.carModel,
        vinCode: data.vinCode.toUpperCase(),
        isAdmin: data.isAdmin,
      };

      await updateUser(user.id, userDataToUpdate);

      // Update password if provided
      if (data.newPassword) {
        await updateUserPassword(user.id, data.newPassword);
      }

      toast({
        title: 'Пользователь обновлен!',
        description: `Данные пользователя "${data.username}" успешно обновлены.`,
      });
      onUserUpdated();
      onClose();
    } catch (error: any) {
      console.error("Ошибка обновления пользователя:", error);
      setError(error.message || 'Не удалось обновить пользователя. Попробуйте позже.');
      toast({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить пользователя. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя: {user.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-4">
          {/* Username */}
          <div>
            <Label htmlFor="edit-username">Логин</Label>
            <Input id="edit-username" {...register('username')} disabled={isLoading} />
            {errors.username && <p className="text-destructive text-xs mt-1">{errors.username.message}</p>}
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="edit-firstName">Имя</Label>
            <Input id="edit-firstName" {...register('firstName')} disabled={isLoading} />
            {errors.firstName && <p className="text-destructive text-xs mt-1">{errors.firstName.message}</p>}
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="edit-lastName">Фамилия</Label>
            <Input id="edit-lastName" {...register('lastName')} disabled={isLoading} />
            {errors.lastName && <p className="text-destructive text-xs mt-1">{errors.lastName.message}</p>}
          </div>

          {/* Email */}
          <div>
            <Label htmlFor="edit-email">Email (необязательно)</Label>
            <Input id="edit-email" type="email" {...register('email')} disabled={isLoading} />
            {errors.email && <p className="text-destructive text-xs mt-1">{errors.email.message}</p>}
          </div>

          {/* Phone Number */}
          <div>
            <Label htmlFor="edit-phoneNumber">Номер телефона</Label>
            <Input id="edit-phoneNumber" type="tel" {...register('phoneNumber')} disabled={isLoading} />
            {errors.phoneNumber && <p className="text-destructive text-xs mt-1">{errors.phoneNumber.message}</p>}
          </div>

          {/* Car Make */}
          <div>
            <Label htmlFor="edit-carMake">Марка машины</Label>
            <Input id="edit-carMake" {...register('carMake')} disabled={isLoading} />
            {errors.carMake && <p className="text-destructive text-xs mt-1">{errors.carMake.message}</p>}
          </div>

          {/* Car Model */}
          <div>
            <Label htmlFor="edit-carModel">Модель машины</Label>
            <Input id="edit-carModel" {...register('carModel')} disabled={isLoading} />
            {errors.carModel && <p className="text-destructive text-xs mt-1">{errors.carModel.message}</p>}
          </div>

          {/* VIN Code */}
          <div>
            <Label htmlFor="edit-vinCode">VIN-код</Label>
            <Input
              id="edit-vinCode"
              {...register('vinCode')}
              disabled={isLoading}
              maxLength={17}
              className="uppercase tracking-widest font-mono"
            />
            {errors.vinCode && <p className="text-destructive text-xs mt-1">{errors.vinCode.message}</p>}
          </div>

           {/* New Password */}
           <div>
            <Label htmlFor="edit-newPassword">Новый пароль (оставьте пустым, чтобы не менять)</Label>
            <Input id="edit-newPassword" type="password" {...register('newPassword')} disabled={isLoading} autoComplete="new-password" />
            {errors.newPassword && <p className="text-destructive text-xs mt-1">{errors.newPassword.message}</p>}
          </div>

          {/* Is Admin */}
          <div className="flex items-center space-x-2">
             <Checkbox
                id="edit-isAdmin"
                {...register('isAdmin')}
                 // Explicitly check the 'checked' state from the form value
                 checked={!!user?.isAdmin} // Use the initial user data to set checked state
                 onCheckedChange={(checked) => setValue('isAdmin', Boolean(checked), { shouldValidate: true })}
                disabled={isLoading}
            />
            <Label htmlFor="edit-isAdmin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Администратор
            </Label>
             {errors.isAdmin && <p className="text-destructive text-xs mt-1">{errors.isAdmin.message}</p>}
          </div>

          {/* General form error message */}
          {error && <p className="text-destructive text-sm">{error}</p>}

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>Отмена</Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto" disabled={isLoading}>
              {isLoading ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
