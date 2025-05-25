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

const userFormSchema = z.object({
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

type UserFormDataValues = z.infer<typeof userFormSchema>;

interface EditUserDialogProps {
  userData: User | null;
  isDialogOpen: boolean;
  onDialogClose: () => void;
  onUserSaved: () => void;
}

export const EditUserForm: React.FC<EditUserDialogProps> = ({ userData, isDialogOpen, onDialogClose, onUserSaved }) => {
  const { toast: showToastMessage } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset: resetFormFields,
    setValue: setFormFieldValue,
    formState: { errors: formValidationErrors },
  } = useForm<UserFormDataValues>({
    resolver: zodResolver(userFormSchema),
  });

  useEffect(() => {
    if (userData && isDialogOpen) {
      setFormFieldValue('username', userData.username);
      setFormFieldValue('firstName', userData.firstName);
      setFormFieldValue('lastName', userData.lastName);
      setFormFieldValue('email', userData.email || '');
      setFormFieldValue('phoneNumber', userData.phoneNumber);
      setFormFieldValue('carMake', userData.carMake);
      setFormFieldValue('carModel', userData.carModel);
      setFormFieldValue('vinCode', userData.vinCode);
      setFormFieldValue('isAdmin', userData.isAdmin || false);
      setFormFieldValue('newPassword', '');
      setErrorMessage(null);
    } else if (!isDialogOpen) {
      resetFormFields();
      setErrorMessage(null);
    }
  }, [userData, isDialogOpen, resetFormFields, setFormFieldValue]);

  const submitUserData: SubmitHandler<UserFormDataValues> = async (data) => {
    if (!userData) return;

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const userDetailsToUpdate: Partial<Omit<User, 'id' | 'password'>> = {
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

      await updateUser(userData.id, userDetailsToUpdate);

      if (data.newPassword) {
        await updateUserPassword(userData.id, data.newPassword);
      }

      showToastMessage({
        title: 'Пользователь обновлен!',
        description: `Данные пользователя "${data.username}" успешно обновлены.`,
      });
      onUserSaved();
      onDialogClose();
    } catch (error: any) {
      console.error("Ошибка обновления пользователя:", error);
      setErrorMessage(error.message || 'Не удалось обновить пользователя. Попробуйте позже.');
      showToastMessage({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить пользователя. Попробуйте позже.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!userData) return null;

  return (
    <Dialog open={isDialogOpen} onOpenChange={(open) => !open && onDialogClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Редактировать пользователя: {userData.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit(submitUserData)} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="edit-username">Логин</Label>
            <Input id="edit-username" {...register('username')} disabled={isSaving} />
            {formValidationErrors.username && <p className="text-destructive text-xs mt-1">{formValidationErrors.username.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-firstName">Имя</Label>
            <Input id="edit-firstName" {...register('firstName')} disabled={isSaving} />
            {formValidationErrors.firstName && <p className="text-destructive text-xs mt-1">{formValidationErrors.firstName.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-lastName">Фамилия</Label>
            <Input id="edit-lastName" {...register('lastName')} disabled={isSaving} />
            {formValidationErrors.lastName && <p className="text-destructive text-xs mt-1">{formValidationErrors.lastName.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-email">Email (необязательно)</Label>
            <Input id="edit-email" type="email" {...register('email')} disabled={isSaving} />
            {formValidationErrors.email && <p className="text-destructive text-xs mt-1">{formValidationErrors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-phoneNumber">Номер телефона</Label>
            <Input id="edit-phoneNumber" type="tel" {...register('phoneNumber')} disabled={isSaving} />
            {formValidationErrors.phoneNumber && <p className="text-destructive text-xs mt-1">{formValidationErrors.phoneNumber.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-carMake">Марка машины</Label>
            <Input id="edit-carMake" {...register('carMake')} disabled={isSaving} />
            {formValidationErrors.carMake && <p className="text-destructive text-xs mt-1">{formValidationErrors.carMake.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-carModel">Модель машины</Label>
            <Input id="edit-carModel" {...register('carModel')} disabled={isSaving} />
            {formValidationErrors.carModel && <p className="text-destructive text-xs mt-1">{formValidationErrors.carModel.message}</p>}
          </div>

          <div>
            <Label htmlFor="edit-vinCode">VIN-код</Label>
            <Input
              id="edit-vinCode"
              {...register('vinCode')}
              disabled={isSaving}
              maxLength={17}
              className="uppercase tracking-widest font-mono"
            />
            {formValidationErrors.vinCode && <p className="text-destructive text-xs mt-1">{formValidationErrors.vinCode.message}</p>}
          </div>

           <div>
            <Label htmlFor="edit-newPassword">Новый пароль (оставьте пустым, чтобы не менять)</Label>
            <Input id="edit-newPassword" type="password" {...register('newPassword')} disabled={isSaving} autoComplete="new-password" />
            {formValidationErrors.newPassword && <p className="text-destructive text-xs mt-1">{formValidationErrors.newPassword.message}</p>}
          </div>

          <div className="flex items-center space-x-2">
             <Checkbox
                id="edit-isAdmin"
                {...register('isAdmin')}
                 checked={!!userData?.isAdmin}
                 onCheckedChange={(checked) => setFormFieldValue('isAdmin', Boolean(checked), { shouldValidate: true })}
                disabled={isSaving}
            />
            <Label htmlFor="edit-isAdmin" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              Администратор
            </Label>
             {formValidationErrors.isAdmin && <p className="text-destructive text-xs mt-1">{formValidationErrors.isAdmin.message}</p>}
          </div>

          {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onDialogClose} disabled={isSaving}>Отмена</Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};