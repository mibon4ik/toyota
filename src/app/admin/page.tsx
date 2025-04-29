'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  carMake: string;
  carModel: string;
  vinCode: string;
  password?: string;
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is admin
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser || JSON.parse(loggedInUser).email !== 'admin@admin.com') {
      router.push('/auth/login');
    }

    const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
          setUsers(JSON.parse(storedUsers));
      }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    router.push('/auth/login');
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-4xl p-4 mt-8">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Панель администратора</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Зарегистрированные пользователи:</h2>
          {users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Номер телефона</TableHead>
                    <TableHead>Марка машины</TableHead>
                    <TableHead>Модель машины</TableHead>
                    <TableHead>VIN-код</TableHead>
                    <TableHead>Пароль</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user, index) => (
                    <TableRow key={index}>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>{user.carMake}</TableCell>
                      <TableCell>{user.carModel}</TableCell>
                      <TableCell>{user.vinCode}</TableCell>
                      <TableCell>{user.password}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p>Пользователи не найдены.</p>
          )}
        </CardContent>
          <div className="mt-4 flex justify-center">
            <Button onClick={handleLogout}>Выйти</Button>
          </div>
      </Card>
    </div>
  );
};

export default AdminPage;
