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
        console.log("AdminPage: Component mounting...");
        setIsMounted(true); // Indicate component has mounted on client
        console.log("AdminPage: Component mounted.");
    }, []);

  useEffect(() => {
    if (!isMounted) {
      console.log("AdminPage: Skipping effect run on server.");
      return; // Don't run on server
    }
    console.log("AdminPage: Running auth check effect (client-side).");

    const checkAdminStatusAndFetchUsers = async () => {
        console.log("AdminPage: Starting admin status check...");
        let isAdmin = false;
        let loggedInUser: User | null = null; // Define here for broader scope

        // --- Cookie Check (Primary) ---
        const authTokenCookie = getCookie('authToken');
        const isLoggedInCookie = getCookie('isLoggedIn');
        const userCookie = getCookie('loggedInUser');

        console.log("AdminPage: Cookie values - authToken:", !!authTokenCookie, "isLoggedIn:", isLoggedInCookie, "userCookie:", !!userCookie);

        if (authTokenCookie && isLoggedInCookie === 'true' && userCookie) {
            console.log("AdminPage: Found auth cookies.");
            try {
                loggedInUser = JSON.parse(userCookie);
                if (loggedInUser && typeof loggedInUser === 'object' && loggedInUser.isAdmin === true) {
                    isAdmin = true;
                    console.log("AdminPage: User is admin (from cookie).", loggedInUser);
                } else {
                    console.log("AdminPage: User found in cookie, but not admin or invalid data.", loggedInUser);
                     isAdmin = false; // Ensure isAdmin is false if validation fails
                }
            } catch (e) {
                console.error("AdminPage: Error parsing loggedInUser cookie:", e);
                // If cookie is invalid, treat as not admin and clear cookies
                 deleteCookie('authToken', { path: '/' });
                 deleteCookie('isLoggedIn', { path: '/' });
                 deleteCookie('loggedInUser', { path: '/' });
                 if (typeof window !== 'undefined') {
                    localStorage.removeItem('isLoggedIn'); // Clear localStorage too
                    localStorage.removeItem('loggedInUser');
                    window.dispatchEvent(new Event('authStateChanged'));
                 }
                 console.log("AdminPage: Redirecting to login due to invalid user cookie.");
                 router.push('/auth/login');
                 return;
            }
        } else {
             console.log("AdminPage: Auth cookies not found or incomplete.");
             // Consider localStorage as a fallback ONLY if cookies are missing/invalid,
             // but generally rely on cookies set by login.
             // If middleware relies on cookies, this fallback might be less relevant.
              console.log("AdminPage: Skipping localStorage check for now, relying on cookie state.");
        }

        // --- Decision & Action ---
        if (!isAdmin) {
            console.log("AdminPage: User is not admin or not logged in based on cookie check. Redirecting to login.");
             // Clear potentially inconsistent storage just in case
             deleteCookie('authToken', { path: '/' });
             deleteCookie('isLoggedIn', { path: '/' });
             deleteCookie('loggedInUser', { path: '/' });
             if (typeof window !== 'undefined') {
                 localStorage.removeItem('isLoggedIn');
                 localStorage.removeItem('loggedInUser');
                 window.dispatchEvent(new Event('authStateChanged'));
             }
             router.push('/auth/login');
            return; // Stop execution if not admin
        }

        // --- Fetch Users (Only if Admin) ---
        console.log("AdminPage: Admin access granted. Fetching users...");
        try {
            const fetchedUsers = await getAllUsers();
            console.log("AdminPage: Fetched users:", fetchedUsers.length);
            setUsers(fetchedUsers);
        } catch (error) {
            console.error("AdminPage: Failed to fetch users:", error);
            // Optionally show an error message to the user via toast or state
             setError("Не удалось загрузить список пользователей."); // Assuming setError state exists
        } finally {
            setIsLoading(false);
             console.log("AdminPage: Finished fetching users, loading state set to false.");
        }
    };

    checkAdminStatusAndFetchUsers();
  }, [router, isMounted]); // Depend on router and isMounted


  const handleLogout = () => {
      console.log("AdminPage: Logout initiated.");
      // Clear cookies first
      deleteCookie('authToken', { path: '/' });
      deleteCookie('isLoggedIn', { path: '/' });
      deleteCookie('loggedInUser', { path: '/' });
      console.log("AdminPage: Cookies cleared.");

      // Clear localStorage
      if (typeof window !== 'undefined') {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('loggedInUser');
           console.log("AdminPage: localStorage cleared.");
          // Dispatch event immediately
          window.dispatchEvent(new Event('authStateChanged'));
           console.log("AdminPage: authStateChanged event dispatched.");
      }
      console.log("AdminPage: Redirecting to login after logout.");
      router.push('/auth/login');
  };

   // Prevent rendering on server to avoid hydration errors
    if (!isMounted) {
        console.log("AdminPage: Not mounted, returning null for SSR.");
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
