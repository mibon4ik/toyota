
'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { UserList } from '../components/UserList';
import { EditUserForm } from '../components/EditUserForm';
import type { User } from '@/types/user';
import { getAllUsers } from '@/lib/auth';
import { useToast } from "@/hooks/use-toast";

export const UserManagementSection: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]); // State now holds full User objects
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null); // State now holds full User object or null
  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    setIsLoadingUsers(true);
    setErrorUsers(null);
    try {
      const fetchedUsers = await getAllUsers();
      setUsers(fetchedUsers);
    } catch (fetchError) {
      console.error("UserManagementSection: Failed to fetch users:", fetchError);
      setErrorUsers("Не удалось загрузить список пользователей.");
      toast({
        title: "Ошибка загрузки пользователей",
        description: "Не удалось загрузить список пользователей. Попробуйте позже.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingUsers(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleEditUser = (user: User) => { // Accepts full User object
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = useCallback(() => {
    fetchUsers(); // Refetch users after update
  }, [fetchUsers]);

  return (
    <div className="space-y-8 mt-6">
      <UserList
        users={users} // Pass full user objects
        isLoading={isLoadingUsers}
        error={errorUsers}
        onEdit={handleEditUser}
      />
      <EditUserForm
        user={selectedUser} // Pass full selected user object
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onUserUpdated={handleUserUpdated}
      />
    </div>
  );
};
