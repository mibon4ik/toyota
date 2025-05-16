
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { UserList } from '../components/UserList';
import { EditUserForm } from '../components/EditUserForm';
import type { User } from '@/types/user';
import { getAllUsers } from '@/lib/auth';
import { useToast } from "@/hooks/use-toast";

export const UserManagementSection: React.FC = () => {
  const [userAccounts, setUserAccounts] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [currentUserToEdit, setCurrentUserToEdit] = useState<User | null>(null);
  const { toast: showAppToast } = useToast();

  const fetchUserAccounts = useCallback(async () => {
    setLoadingUsers(true);
    setUsersError(null);
    try {
      const accounts = await getAllUsers();
      setUserAccounts(accounts);
    } catch (error) {
      console.error("UserManagementSection: Failed to fetch users:", error);
      setUsersError("Не удалось загрузить список пользователей.");
      showAppToast({
        title: "Ошибка загрузки пользователей",
        description: "Не удалось загрузить список пользователей. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setLoadingUsers(false);
    }
  }, [showAppToast]);

  useEffect(() => {
    fetchUserAccounts();
  }, [fetchUserAccounts]);

  const startEditUser = (userToEdit: User) => {
    setCurrentUserToEdit(userToEdit);
    setIsEditingUser(true);
  };

  const finishEditUser = () => {
    setIsEditingUser(false);
    setCurrentUserToEdit(null);
  };

  const refreshUserList = useCallback(() => {
    fetchUserAccounts();
  }, [fetchUserAccounts]);

  return (
    <div className="space-y-8 mt-6">
      <UserList
        usersData={userAccounts}
        isDataLoading={loadingUsers}
        loadingError={usersError}
        onEditUser={startEditUser}
      />
      <EditUserForm
        userData={currentUserToEdit}
        isDialogOpen={isEditingUser}
        onDialogClose={finishEditUser}
        onUserSaved={refreshUserList}
      />
    </div>
  );
};
