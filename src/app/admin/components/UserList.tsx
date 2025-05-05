
"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { User } from '@/types/user';

interface UserListProps {
  users: User[]; // Now expects full User object including password
  isLoading: boolean;
  error: string | null;
  onEdit: (user: User) => void; // Expects full User object
}

export const UserList: React.FC<UserListProps> = ({ users, isLoading, error, onEdit }) => {

  if (isLoading) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Зарегистрированные пользователи:</h2>
        <div className="space-y-3">
            <Skeleton className="h-8 w-full rounded-md" />
            {[...Array(3)].map((_, i) => (
                 <Skeleton key={i} className="h-10 w-full rounded-md" />
            ))}
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
              <TableHead>Машина</TableHead>
              <TableHead>VIN</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Пароль (Hash)</TableHead>
              <TableHead>Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              // Ensure no extra whitespace inside the TableRow mapping or between TableCells
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>{user.firstName} {user.lastName}</TableCell>
                <TableCell>{user.phoneNumber}</TableCell>
                <TableCell>{user.carMake} {user.carModel}</TableCell>
                <TableCell className="font-mono text-xs tracking-wider">{user.vinCode}</TableCell>
                <TableCell>{user.isAdmin ? 'Да' : 'Нет'}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[100px]" title={user.password}>
                   {user.password ? `${user.password.substring(0, 10)}...` : 'N/A'}
                </TableCell>
                <TableCell>
                   <Button variant="outline" size="sm" onClick={() => onEdit(user)}>Изменить</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

