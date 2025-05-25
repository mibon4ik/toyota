
'use client';

import React, { useState, useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { useToast } from '@/hooks/use-toast';
import { updateUser, updateUserPassword } from '@/lib/auth';
import type { StoredUser, User } from '@/types/user';
import { Icons } from '@/components/icons';

const profileFormSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
  email: z.string().email('Неверный формат email').optional().or(z.literal('')),
  phoneNumber: z.string().min(5, 'Неверный номер телефона'),
  carMake: z.string().min(1, 'Марка машины обязательна'),
  carModel: z.string().min(1, 'Модель машины обязательна'),
  vinCode: z.string().length(17, 'VIN должен содержать 17 символов').regex(/^[A-HJ-NPR-Z0-9]{17}$/i, 'Неверный формат VIN'),
  newPassword: z.string().optional().or(z.literal('')),
  confirmNewPassword: z.string().optional().or(z.literal('')),
}).refine(data => {
    if (data.newPassword && data.newPassword.length < 8) {
        return false;
    }
    return true;
}, {
    message: 'Новый пароль должен содержать минимум 8 символов',
    path: ['newPassword'],
}).refine(data => data.newPassword === data.confirmNewPassword, {
  message: 'Пароли не совпадают',
  path: ['confirmNewPassword'],
});

type ProfileFormDataValues = z.infer<typeof profileFormSchema>;

interface EditProfileFormProps {
  userData: StoredUser; // Use StoredUser as it's what's available client-side
  isDialogOpen: boolean;
  onDialogClose: () => void;
  onUserSaved: (updatedUser: StoredUser) => void;
}

export const EditProfileForm: React.FC<EditProfileFormProps> = ({ userData, isDialogOpen, onDialogClose, onUserSaved }) => {
  const { toast: showToastMessage } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit: handleFormSubmit,
    reset: resetFormFields,
    setValue: setFormFieldValue,
    formState: { errors: formValidationErrors },
    watch
  } = useForm<ProfileFormDataValues>({
    resolver: zodResolver(profileFormSchema),
  });

  const newPasswordValue = watch('newPassword');

  useEffect(() => {
    if (userData && isDialogOpen) {
      setFormFieldValue('firstName', userData.firstName);
      setFormFieldValue('lastName', userData.lastName);
      setFormFieldValue('email', userData.email || '');
      setFormFieldValue('phoneNumber', userData.phoneNumber);
      setFormFieldValue('carMake', userData.carMake);
      setFormFieldValue('carModel', userData.carModel);
      setFormFieldValue('vinCode', userData.vinCode);
      setFormFieldValue('newPassword', '');
      setFormFieldValue('confirmNewPassword', '');
      setErrorMessage(null);
    } else if (!isDialogOpen) {
      resetFormFields();
      setErrorMessage(null);
    }
  }, [userData, isDialogOpen, resetFormFields, setFormFieldValue]);

  const submitUserData: SubmitHandler<ProfileFormDataValues> = async (data) => {
    setIsSaving(true);
    setErrorMessage(null);

    try {
      // Prepare data for updateUser (excluding password)
      const userDetailsToUpdate: Partial<Omit<User, 'id' | 'password' | 'username' | 'role' | 'isAdmin'>> = {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email || undefined,
        phoneNumber: data.phoneNumber,
        carMake: data.carMake,
        carModel: data.carModel,
        vinCode: data.vinCode.toUpperCase(),
      };
      
      // Update basic user details (username, role, isAdmin are not editable by user here)
      const updatedUserDetails = await updateUser(userData.id, {
          ...userDetailsToUpdate,
          username: userData.username, // Keep original username
          role: userData.role,         // Keep original role
          isAdmin: userData.isAdmin    // Keep original admin status
      });

      if (data.newPassword) {
        await updateUserPassword(userData.id, data.newPassword);
      }

      showToastMessage({
        title: 'Профиль обновлен!',
        description: 'Ваши данные успешно обновлены.',
      });
      
      onUserSaved(updatedUserDetails); // Pass the fully updated user object
      onDialogClose();
    } catch (error: any) {
      console.error("Ошибка обновления профиля:", error);
      setErrorMessage(error.message || 'Не удалось обновить профиль. Попробуйте позже.');
      showToastMessage({
        title: 'Ошибка',
        description: error.message || 'Не удалось обновить профиль. Попробуйте позже.',
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
          <DialogTitle>Редактировать профиль: {userData.username}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleFormSubmit(submitUserData)} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="profile-firstName">Имя</Label>
            <Input id="profile-firstName" {...register('firstName')} disabled={isSaving} />
            {formValidationErrors.firstName && <p className="text-destructive text-xs mt-1">{formValidationErrors.firstName.message}</p>}
          </div>

          <div>
            <Label htmlFor="profile-lastName">Фамилия</Label>
            <Input id="profile-lastName" {...register('lastName')} disabled={isSaving} />
            {formValidationErrors.lastName && <p className="text-destructive text-xs mt-1">{formValidationErrors.lastName.message}</p>}
          </div>

          <div>
            <Label htmlFor="profile-email">Email</Label>
            <Input id="profile-email" type="email" {...register('email')} disabled={isSaving} />
            {formValidationErrors.email && <p className="text-destructive text-xs mt-1">{formValidationErrors.email.message}</p>}
          </div>

          <div>
            <Label htmlFor="profile-phoneNumber">Номер телефона</Label>
            <Input id="profile-phoneNumber" type="tel" {...register('phoneNumber')} disabled={isSaving} />
            {formValidationErrors.phoneNumber && <p className="text-destructive text-xs mt-1">{formValidationErrors.phoneNumber.message}</p>}
          </div>

          <div>
            <Label htmlFor="profile-carMake">Марка машины</Label>
            <Input id="profile-carMake" {...register('carMake')} disabled={isSaving} />
            {formValidationErrors.carMake && <p className="text-destructive text-xs mt-1">{formValidationErrors.carMake.message}</p>}
          </div>

          <div>
            <Label htmlFor="profile-carModel">Модель машины</Label>
            <Input id="profile-carModel" {...register('carModel')} disabled={isSaving} />
            {formValidationErrors.carModel && <p className="text-destructive text-xs mt-1">{formValidationErrors.carModel.message}</p>}
          </div>

          <div>
            <Label htmlFor="profile-vinCode">VIN-код</Label>
            <Input
              id="profile-vinCode"
              {...register('vinCode')}
              disabled={isSaving}
              maxLength={17}
              className="uppercase tracking-widest font-mono"
            />
            {formValidationErrors.vinCode && <p className="text-destructive text-xs mt-1">{formValidationErrors.vinCode.message}</p>}
          </div>

           <div>
            <Label htmlFor="profile-newPassword">Новый пароль (оставьте пустым, чтобы не менять)</Label>
            <div className="relative">
                <Input 
                    id="profile-newPassword" 
                    type={showNewPassword ? "text" : "password"} 
                    {...register('newPassword')} 
                    disabled={isSaving} 
                    autoComplete="new-password" 
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    disabled={isSaving}
                    aria-label={showNewPassword ? 'Скрыть пароль' : 'Показать пароль'}
                >
                    {showNewPassword ? <Icons.eyeOff className="h-4 w-4" /> : <Icons.eye className="h-4 w-4" />}
                </Button>
            </div>
            {formValidationErrors.newPassword && <p className="text-destructive text-xs mt-1">{formValidationErrors.newPassword.message}</p>}
          </div>
        
          {newPasswordValue && (
            <div>
                <Label htmlFor="profile-confirmNewPassword">Подтвердите новый пароль</Label>
                 <div className="relative">
                    <Input 
                        id="profile-confirmNewPassword" 
                        type={showConfirmPassword ? "text" : "password"} 
                        {...register('confirmNewPassword')} 
                        disabled={isSaving} 
                        autoComplete="new-password"
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={isSaving}
                        aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
                    >
                        {showConfirmPassword ? <Icons.eyeOff className="h-4 w-4" /> : <Icons.eye className="h-4 w-4" />}
                    </Button>
                </div>
                {formValidationErrors.confirmNewPassword && <p className="text-destructive text-xs mt-1">{formValidationErrors.confirmNewPassword.message}</p>}
            </div>
          )}


          {errorMessage && <p className="text-destructive text-sm">{errorMessage}</p>}

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onDialogClose} disabled={isSaving}>Отмена</Button>
            </DialogClose>
            <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
              {isSaving ? (<><Icons.loader className="mr-2 h-4 w-4 animate-spin" /> Сохранение...</>) : 'Сохранить изменения'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
