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
        let isAdmin = false;

        // Prioritize checking cookies for auth state
        const authTokenCookie = getCookie('authToken');
        const isLoggedInCookie = getCookie('isLoggedIn');
        const userCookie = getCookie('loggedInUser');

        if (authTokenCookie && isLoggedInCookie === 'true' && userCookie) {
            try {
                const loggedInUser: User = JSON.parse(userCookie);
                isAdmin = loggedInUser.isAdmin === true;
            } catch (e) {
                console.error("Admin Page: Error parsing loggedInUser cookie:", e);
                // If cookie is invalid, treat as not admin and potentially clear cookies
                 deleteCookie('authToken');
                 deleteCookie('isLoggedIn');
                 deleteCookie('loggedInUser');
                 localStorage.removeItem('isLoggedIn'); // Clear localStorage too
                 localStorage.removeItem('loggedInUser');
                 window.dispatchEvent(new Event('authStateChanged'));
                 router.push('/auth/login');
                 return;
            }
        } else {
            // Fallback to localStorage check ONLY if cookies are missing/invalid
            const loggedInLocalStorage = localStorage.getItem('isLoggedIn');
            const userLocalStorage = localStorage.getItem('loggedInUser');

            if (loggedInLocalStorage === 'true' && userLocalStorage) {
                try {
                    const loggedInUser: User = JSON.parse(userLocalStorage);
                    isAdmin = loggedInUser.isAdmin === true;
                     // If localStorage is valid but cookies were missing, maybe redirect to login
                     // to force cookie setting, or proceed if admin status is confirmed here.
                     if (!isAdmin) {
                        console.log("Admin Page: User logged in via localStorage but not admin.");
                     } else {
                         console.log("Admin Page: Admin status confirmed via localStorage fallback.");
                     }
                } catch (e) {
                    console.error("Admin Page: Error parsing loggedInUser localStorage:", e);
                    // If localStorage is also invalid, definitely redirect
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('loggedInUser');
                    window.dispatchEvent(new Event('authStateChanged'));
                    router.push('/auth/login');
                    return;
                }
            }
        }


        if (!isAdmin) {
            console.log("Admin Page: User is not admin or not logged in. Redirecting.");
            router.push('/auth/login');
            return; // Stop execution if not admin
        }

        // Fetch users ONLY if admin status is confirmed
        console.log("Admin Page: Admin access granted. Fetching users...");
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
      // Clear cookies first
      deleteCookie('authToken');
      deleteCookie('isLoggedIn');
      deleteCookie('loggedInUser');

      // Clear localStorage
      if (typeof window !== 'undefined') {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('loggedInUser');
          // Dispatch event immediately
          window.dispatchEvent(new Event('authStateChanged'));
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
