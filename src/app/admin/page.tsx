
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types/user'; // Import User type
import { UserList } from './components/UserList'; // Import UserList component
import { AddProductForm } from './components/AddProductForm'; // Import AddProductForm component
import { getAllUsers } from '@/lib/auth';

const AdminPage = () => {
  const [users, setUsers] = useState<Omit<User, 'password'>[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start loading until checks complete
  const [error, setError] = useState<string | null>(null); // For displaying errors
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    console.log("AdminPage: Mounted.");
  }, []);

  // Check admin status and fetch users
  const checkAdminAndFetch = useCallback(async () => {
    if (!isMounted) {
      console.log("AdminPage: Skipping fetch on server.");
      return;
    }
     console.log("AdminPage: Running auth check and user fetch (client-side).");
     setIsLoading(true); // Set loading at the start
     setError(null); // Clear previous errors

     // --- Cookie Check (Primary) ---
     const authTokenCookie = getCookie('authToken');
     const isLoggedInCookie = getCookie('isLoggedIn');
     const userCookie = getCookie('loggedInUser');
     let isAdmin = false;
     let loggedInUser: User | null = null;

     if (authTokenCookie && isLoggedInCookie === 'true' && userCookie) {
         console.log("AdminPage: Found auth cookies.");
         try {
             loggedInUser = JSON.parse(userCookie);
             // Explicitly check isAdmin property for true
             isAdmin = !!loggedInUser?.isAdmin;
             if (!isAdmin) console.log("AdminPage: User from cookie is not admin.");
         } catch (e) {
             console.error("AdminPage: Error parsing loggedInUser cookie:", e);
             isAdmin = false; // Treat parse error as not admin
             // Clear potentially corrupted cookies
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
         // Optionally check localStorage as a backup for session restoration if cookies are missing
         const localIsLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') : null;
         const localUser = typeof window !== 'undefined' ? localStorage.getItem('loggedInUser') : null;
         if (localIsLoggedIn === 'true' && localUser) {
             console.log("AdminPage: Attempting login state restoration from localStorage.");
              try {
                 loggedInUser = JSON.parse(localUser);
                 isAdmin = !!loggedInUser?.isAdmin;
                  if (isAdmin) {
                     console.log("AdminPage: Restored admin session from localStorage.");
                     // Optionally re-set cookies if missing but localStorage is valid
                     // setCookie(...)
                  } else {
                     console.log("AdminPage: User from localStorage is not admin.");
                  }
              } catch (e) {
                  console.error("AdminPage: Error parsing localStorage user data:", e);
                  isAdmin = false;
                  // Clear potentially corrupted localStorage
                   if (typeof window !== 'undefined') {
                     localStorage.removeItem('isLoggedIn');
                     localStorage.removeItem('loggedInUser');
                     window.dispatchEvent(new Event('authStateChanged'));
                   }
              }
         }
     }

     // --- Decision & Action ---
     if (!isAdmin) {
         console.log("AdminPage: User is not admin or not logged in. Redirecting to login.");
          toast({
             title: "Доступ запрещен",
             description: "У вас нет прав для доступа к этой странице.",
             variant: "destructive",
         });
          // Clear any potentially inconsistent storage
          deleteCookie('authToken', { path: '/' });
          deleteCookie('isLoggedIn', { path: '/' });
          deleteCookie('loggedInUser', { path: '/' });
           if (typeof window !== 'undefined') {
             localStorage.removeItem('isLoggedIn');
             localStorage.removeItem('loggedInUser');
             window.dispatchEvent(new Event('authStateChanged'));
          }
          router.push('/auth/login');
          // Stop loading after redirect decision, even if it's an error case for non-admins
          setIsLoading(false);
          return; // Stop execution if not admin
     }

     // --- Fetch Users (Only if Admin) ---
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
  }, [isMounted, router, toast]); // Dependencies for the callback

  // Run the check on mount and when isMounted changes
  useEffect(() => {
    checkAdminAndFetch();
  }, [checkAdminAndFetch]); // Depend on the memoized function


  const handleLogout = useCallback(() => {
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
          // Dispatch event immediately after clearing
          window.dispatchEvent(new Event('authStateChanged'));
          console.log("AdminPage: authStateChanged event dispatched.");
      } else {
           console.warn("AdminPage: window object not available during logout.");
      }
      console.log("AdminPage: Redirecting to login after logout.");
      router.push('/auth/login');
  }, [router]); // Only depends on router


   // Show loading state until client-side checks are complete
   if (!isMounted || isLoading) {
        // console.log("AdminPage: Not mounted or loading, returning loading state for SSR/initial render/fetch.");
        return (
            <div className="container mx-auto py-8">
                <Card className="w-full p-4">
                    <CardHeader>
                        <CardTitle className="text-2xl text-center">Панель администратора</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-center text-muted-foreground">Загрузка данных...</p>
                         {/* Optionally add more specific skeleton here if UserList takes time */}
                    </CardContent>
                </Card>
            </div>
        );
    }


  return (
    <div className="container mx-auto py-8"> {/* Use container for consistent padding */}
      <Card className="w-full p-4"> {/* Remove max-w-4xl to use full container width */}
        <CardHeader>
          <CardTitle className="text-2xl text-center mb-6">Панель администратора</CardTitle>
        </CardHeader>
        <CardContent className="space-y-8"> {/* Add spacing between sections */}
           {/* User List Section */}
           <UserList users={users} isLoading={false} error={error} />

           {/* Add Product Form Section */}
           <AddProductForm />

           {/* TODO: Add Order Management Section */}
            {/* <div>
                <h2 className="text-xl font-semibold mb-4">Управление заказами:</h2>
                 Display orders list/management components here
                <p className="text-muted-foreground">Функционал управления заказами будет добавлен позже.</p>
            </div> */}

        </CardContent>
          <div className="mt-8 flex justify-center"> {/* Increased margin-top */}
            <Button onClick={handleLogout} variant="outline">Выйти</Button>
          </div>
      </Card>
    </div>
  );
};

export default AdminPage;
