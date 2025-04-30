
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types/user';
import { UserList } from './components/UserList';
import { AddProductForm } from './components/AddProductForm';
import { getAllUsers } from '@/lib/auth';

const AdminPage = () => {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("AdminPage: Mounted.");
  }, []);

  const checkAdminAndFetch = useCallback(async () => {
    if (!isMounted) {
      console.log("AdminPage: Skipping fetch on server.");
      return;
    }
     console.log("AdminPage: Running auth check and user fetch (client-side).");
     setIsLoading(true);
     setError(null);

     const authTokenCookie = getCookie('authToken');
     const isLoggedInCookie = getCookie('isLoggedIn');
     const userCookie = getCookie('loggedInUser');
     let isAdmin = false;
     let loggedInUser: User | null = null;

     if (authTokenCookie && isLoggedInCookie === 'true' && userCookie) {
         console.log("AdminPage: Found auth cookies.");
         try {
             loggedInUser = JSON.parse(userCookie);

             isAdmin = !!loggedInUser?.isAdmin;
             if (!isAdmin) console.log("AdminPage: User from cookie is not admin.");
         } catch (e) {
             console.error("AdminPage: Error parsing loggedInUser cookie:", e);
             isAdmin = false;
             deleteCookie('authToken', { path: '/' });
             deleteCookie('isLoggedIn', { path: '/' });
             deleteCookie('loggedInUser', { path: '/' });
              if (typeof window !== 'undefined') {
                localStorage.removeItem('isLoggedIn');
                localStorage.removeItem('loggedInUser');
                window.dispatchEvent(new Event('authStateChanged'));
             }
         }
     } else {
         console.log("AdminPage: Auth cookies not found or incomplete.");
         const localIsLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') : null;
         const localUser = typeof window !== 'undefined' ? localStorage.getItem('loggedInUser') : null;
         if (localIsLoggedIn === 'true' && localUser) {
             console.log("AdminPage: Attempting login state restoration from localStorage.");
              try {
                 loggedInUser = JSON.parse(localUser);
                 isAdmin = !!loggedInUser?.isAdmin;
                  if (isAdmin) {
                     console.log("AdminPage: Restored admin session from localStorage.");

                  } else {
                     console.log("AdminPage: User from localStorage is not admin.");
                  }
              } catch (e) {
                  console.error("AdminPage: Error parsing localStorage user data:", e);
                  isAdmin = false;
                   if (typeof window !== 'undefined') {
                     localStorage.removeItem('isLoggedIn');
                     localStorage.removeItem('loggedInUser');
                     window.dispatchEvent(new Event('authStateChanged'));
                   }
              }
         }
     }


     if (!isAdmin) {
         console.log("AdminPage: User is not admin or not logged in. Redirecting to login.");
          toast({
             title: "Доступ запрещен",
             description: "У вас нет прав для доступа к этой странице.",
             variant: "destructive",
         });
          deleteCookie('authToken', { path: '/' });
          deleteCookie('isLoggedIn', { path: '/' });
          deleteCookie('loggedInUser', { path: '/' });
           if (typeof window !== 'undefined') {
             localStorage.removeItem('isLoggedIn');
             localStorage.removeItem('loggedInUser');
             window.dispatchEvent(new Event('authStateChanged'));
          }
          router.push('/auth/login');

          setIsLoading(false);
          return;
     }


     console.log("AdminPage: Admin access confirmed. Fetching users...");
     try {
         const fetchedUsers = await getAllUsers();
         console.log("AdminPage: Fetched users:", fetchedUsers.length);
         setUsers(fetchedUsers);
     } catch (fetchError) {
         console.error("AdminPage: Failed to fetch users:", fetchError);
         setError("Не удалось загрузить список пользователей.");
         toast({
            title: "Ошибка загрузки",
            description: "Не удалось загрузить список пользователей. Попробуйте позже.",
            variant: "destructive",
        });
     } finally {
         setIsLoading(false);
         console.log("AdminPage: Finished fetching users or encountered error, loading state set to false.");
     }
  }, [isMounted, router, toast]);

  useEffect(() => {
    checkAdminAndFetch();
  }, [checkAdminAndFetch]);


  const handleLogout = useCallback(() => {
      console.log("AdminPage: Logout initiated.");

      deleteCookie('authToken', { path: '/' });
      deleteCookie('isLoggedIn', { path: '/' });
      deleteCookie('loggedInUser', { path: '/' });
      console.log("AdminPage: Cookies cleared.");


      if (typeof window !== 'undefined') {
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('loggedInUser');
          console.log("AdminPage: localStorage cleared.");

          window.dispatchEvent(new Event('authStateChanged'));
          console.log("AdminPage: authStateChanged event dispatched.");
      } else {
           console.warn("AdminPage: window object not available during logout.");
      }
      console.log("AdminPage: Redirecting to login after logout.");
      router.push('/auth/login');
  }, [router]);


   if (!isMounted || isLoading) {

        return (
            <div className="container mx-auto py-8">
                <Card className="w-full p-4">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Панель администратора</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">Загрузка данных...</p>

                    </CardContent>
                </Card>
            </div>
        );
    }


  return (
    <div className="container mx-auto py-8">
      <Card className="w-full p-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center mb-6">Панель администратора</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
           <UserList users={users} isLoading={false} error={error} />

           <AddProductForm />


            {/* <div>
                <h2 className="text-xl font-semibold mb-4">Управление заказами:</h2>

                <p className="text-muted-foreground">Функционал управления заказами будет добавлен позже.</p>
            </div> */}

        </CardContent>
          <div className="mt-8 flex justify-center">
            <Button onClick={handleLogout} variant="outline">Выйти</Button>
          </div>
      </Card>
    </div>
  );
};

export default AdminPage;
