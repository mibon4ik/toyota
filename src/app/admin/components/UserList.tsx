
"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button"; // Import Button
import type { User } from '@/types/user';

interface UserListProps {
  users: Omit<User, 'password'>[];
  isLoading: boolean;
  error: string | null;
  onEdit: (user: Omit<User, 'password'>) => void; // Callback for edit action
}

export const UserList: React.FC<UserListProps> = ({ users, isLoading, error, onEdit }) => {

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Зарегистрированные пользователи:</h2>
        <div className="space-y-3">
            <Skeleton className="h-8 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
            <Skeleton className="h-10 w-full rounded-md" />
        </div>
         <p className="text-center text-muted-foreground mt-4">Загрузка пользователей...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Зарегистрированные пользователи:</h2>
        <p className="text-destructive text-center">{error}</p>
      </div>
    );
  }

  if (users.length === 0) {
    return (
       <div>
            <h2 className="text-xl font-semibold mb-4">Зарегистрированные пользователи:</h2>
            <p className="text-center text-muted-foreground">Пользователи не найдены.</p>
       </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Зарегистрированные пользователи:</h2>
      <div className="overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Логин</TableHead>
              <TableHead>Имя</TableHead>
              <TableHead>Телефон</TableHead>
              <TableHead>Марка</TableHead>
              <TableHead>Модель</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Действия</TableHead> {/* Added Actions column */}
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{user.carMake}</TableCell>
                <TableCell>{user.carModel}</TableCell>
                <TableCell className="font-mono text-xs tracking-wider">{user.vinCode}</TableCell>
                <TableCell>{user.isAdmin ? 'Да' : 'Нет'}</TableCell>
                <TableCell>
                   <Button variant="outline" size="sm" onClick={() => onEdit(user)}>
                     Изменить
                   </Button>
                 </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
