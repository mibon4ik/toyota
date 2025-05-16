
"use client";

import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import type { User } from '@/types/user';

interface UserTableProps {
  usersData: User[];
  isDataLoading: boolean;
  loadingError: string | null;
  onEditUser: (user: User) => void;
}

export const UserList: React.FC<UserTableProps> = ({ usersData, isDataLoading, loadingError, onEditUser }) => {

  if (isDataLoading) {
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

  if (loadingError) {
    return (
      <div>
        <h2 className="text-xl font-semibold mb-4">Зарегистрированные пользователи:</h2>
        <p className="text-destructive text-center">{loadingError}</p>
      </div>
    );
  }

  if (usersData.length === 0) {
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
            {usersData.map((singleUser) => (
              <TableRow key={singleUser.id}>
                <TableCell className="font-medium">{singleUser.username}</TableCell>
                <TableCell>{singleUser.firstName} {singleUser.lastName}</TableCell>
                <TableCell>{singleUser.phoneNumber}</TableCell>
                <TableCell>{singleUser.carMake} {singleUser.carModel}</TableCell>
                <TableCell className="font-mono text-xs tracking-wider">{singleUser.vinCode}</TableCell>
                <TableCell>{singleUser.isAdmin ? 'Да' : 'Нет'}</TableCell>
                <TableCell className="text-xs font-mono text-muted-foreground truncate max-w-[100px]" title={singleUser.password}>
                   {singleUser.password ? `${singleUser.password.substring(0, 10)}...` : 'N/A'}
                </TableCell>
                <TableCell>
                   <Button variant="outline" size="sm" onClick={() => onEditUser(singleUser)}>Изменить</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
