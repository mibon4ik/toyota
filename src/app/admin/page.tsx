'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getAllUsers } from '@/lib/auth'; // Import the function to get users
import { getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types/user'; // Import User type

const AdminPage = () => {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]); // State to hold users (password omitted)
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkAdminStatusAndFetchUsers = async () => {
        const loggedInUserCookie = getCookie('loggedInUser');
        let isAdmin = false;

        if (loggedInUserCookie) {
            try {
                const loggedInUser: User = JSON.parse(loggedInUserCookie);
                isAdmin = loggedInUser.isAdmin === true;
            } catch (e) {
                console.error("Error parsing loggedInUser cookie:", e);
            }
        }

        if (!isAdmin) {
            router.push('/auth/login');
            return; // Stop execution if not admin
        }

        // Fetch users if admin
        try {
            const fetchedUsers = await getAllUsers();
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("Failed to fetch users:", error);
            // Optionally show an error message to the user
        } finally {
            setIsLoading(false);
        }
    };

    checkAdminStatusAndFetchUsers();
}, [router]);


  const handleLogout = () => {
    deleteCookie('authToken');
    deleteCookie('isLoggedIn');
    deleteCookie('loggedInUser');
    router.push('/auth/login');
  };

  return (
    <div className="flex justify-center items-start min-h-screen pt-8">
      <Card className="w-full max-w-4xl p-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Панель администратора</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Зарегистрированные пользователи:</h2>
          {isLoading ? (
            <p>Загрузка пользователей...</p>
          ) : users.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Имя</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Марка</TableHead>
                    <TableHead>Модель</TableHead>
                    <TableHead>VIN</TableHead>
                    <TableHead>Admin</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>{user.carMake}</TableCell>
                      <TableCell>{user.carModel}</TableCell>
                      <TableCell>{user.vinCode}</TableCell>
                      <TableCell>{user.isAdmin ? 'Да' : 'Нет'}</TableCell>
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
