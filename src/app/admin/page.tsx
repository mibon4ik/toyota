'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types/user';
import { ProductManagementSection } from './sections/ProductManagementSection';
import { UserManagementSection } from './sections/UserManagementSection';
import { OrderManagementSection } from './sections/OrderManagementSection';
import { Skeleton } from '@/components/ui/skeleton';

const AdminPage = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [isAdminUser, setIsAdminUser] = useState(false); // Renamed for clarity
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const clearAuthStorageAndRedirect = useCallback(() => {
    deleteCookie('authToken', { path: '/' });
    deleteCookie('isLoggedIn', { path: '/' });
    deleteCookie('loggedInUser', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUser');
      window.dispatchEvent(new Event('authStateChanged'));
    }
    router.replace('/auth/login');
  }, [router]);

  const checkAdminStatus = useCallback(async () => {
    if (!isMounted) return;
    setIsLoadingAuth(true);

    const authToken = getCookie('authToken');
    const isLoggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');
    let currentUser: User | null = null;
    let currentIsAdmin = false;

    if (authToken && isLoggedInCookie === 'true') {
        if (userCookie) {
            try {
                currentUser = JSON.parse(userCookie as string);
                currentIsAdmin = currentUser?.isAdmin === true; // Explicitly check for true
            } catch (e) {
                console.error("AdminPage: Error parsing loggedInUser cookie:", e);
                // Proceed to clear auth as cookie is corrupted
            }
        }
        // If userCookie is missing or parsing failed, but other auth cookies exist,
        // it's an inconsistent state. It's safer to treat as not logged in or not admin.
        if (!currentUser || !currentIsAdmin) {
            console.warn("AdminPage: User not admin or user data missing/corrupted. User:", currentUser);
            toast({
                title: "Доступ запрещен",
                description: "У вас нет прав администратора или проблема с сессией.",
                variant: "destructive",
            });
            setIsAdminUser(false); // Ensure state reflects non-admin status
            // Don't clear auth here, let main-nav handle full logout if necessary on redirect
            // This prevents a loop if this check runs before main-nav's auth sync
            router.replace('/'); // Redirect to home for non-admins or if data is faulty
            setIsLoadingAuth(false);
            return;
        }
    } else {
        // Not logged in based on cookies
        console.log("AdminPage: User not logged in. Redirecting to login.");
        toast({
            title: "Доступ запрещен",
            description: "Пожалуйста, войдите как администратор.",
            variant: "destructive",
        });
        // No need to clear here, middleware should handle unauthenticated access
        setIsAdminUser(false);
        router.replace('/auth/login');
        setIsLoadingAuth(false);
        return;
    }
    
    // If we reach here, user is logged in AND is an admin
    setIsAdminUser(true);
    setIsLoadingAuth(false);
  }, [isMounted, toast, router]);


  useEffect(() => {
    if (isMounted) {
      checkAdminStatus();
    }
    const handleAuthStateChanged = () => {
        if (isMounted) {
          checkAdminStatus();
        }
    };
    window.addEventListener('authStateChanged', handleAuthStateChanged);
    return () => {
        window.removeEventListener('authStateChanged', handleAuthStateChanged);
    };
  }, [checkAdminStatus, isMounted]);

   const handleLogout = useCallback(() => {
    clearAuthStorageAndRedirect();
  }, [clearAuthStorageAndRedirect]);


  if (!isMounted || isLoadingAuth) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-2xl text-center mb-4">Панель администратора</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" />
                <Skeleton className="h-64 w-full" />
             </div>
            <p className="text-center text-muted-foreground mt-4">Проверка доступа...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdminUser) { // Use the clearer state variable name
      // Message already shown by checkAdminStatus, this is a fallback if redirect hasn't completed
      return (
            <div className="container mx-auto py-8">
               <p className="text-center text-destructive">Доступ запрещен. Перенаправление...</p>
            </div>
      );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="w-full p-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center mb-6">Панель администратора</CardTitle>
        </CardHeader>
        <CardContent className="space-y-12">
          <Tabs defaultValue="products" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="orders">Заказы</TabsTrigger>
            </TabsList>
            <TabsContent value="products">
              <ProductManagementSection />
            </TabsContent>
            <TabsContent value="users">
               <UserManagementSection />
            </TabsContent>
            <TabsContent value="orders">
               <OrderManagementSection />
            </TabsContent>
          </Tabs>
        </CardContent>
        <div className="mt-8 flex justify-center">
          <Button onClick={handleLogout} variant="outline">Выйти</Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminPage;
