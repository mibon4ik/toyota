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
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
        setIsMounted(true); // Indicate component has mounted on client
    }, []);

  useEffect(() => {
    if (!isMounted) return; // Don't run on server

    const checkAdminStatusAndFetchUsers = async () => {
        let loggedInUserCookie: string | undefined;
        let isAdmin = false;

        if (typeof window !== 'undefined') {
            loggedInUserCookie = getCookie('loggedInUser');
        }


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
  }, [router, isMounted]); // Depend on isMounted


  const handleLogout = () => {
    if (typeof window !== 'undefined') {
        deleteCookie('authToken');
        deleteCookie('isLoggedIn');
        deleteCookie('loggedInUser');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
        window.dispatchEvent(new Event('authStateChanged')); // Notify nav bar
    }
    router.push('/auth/login');
  };

   // Prevent rendering on server to avoid hydration errors
    if (!isMounted) {
        return null;
    }


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
                    <TableHead>Логин</TableHead> {/* Changed from Email */}
                    <TableHead>Имя</TableHead>
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
                      <TableCell>{user.username}</TableCell> {/* Display username */}
                      <TableCell>{user.firstName} {user.lastName}</TableCell>
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
