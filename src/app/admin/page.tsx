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
  const [isAdmin, setIsAdmin] = useState(false);
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

  const checkAdmin = useCallback(async () => {
    if (!isMounted) {
      return;
    }
    setIsLoadingAuth(true);

    const authTokenCookie = getCookie('authToken');
    const isLoggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');
    let currentAdminStatus = false;
    let currentUser: User | null = null;

    if (authTokenCookie && isLoggedInCookie === 'true' && userCookie) {
      try {
        currentUser = JSON.parse(userCookie as string); // Cast to string
        currentAdminStatus = !!currentUser?.isAdmin;
      } catch (e) {
        console.error("AdminPage: Error parsing loggedInUser cookie:", e);
        currentAdminStatus = false;
        // Clear potentially corrupted cookies if parsing fails
        clearAuthStorageAndRedirect();
        setIsLoadingAuth(false);
        return;
      }
    } else {
      // If essential cookies are missing or don't indicate a logged-in state,
      // the user is not considered authenticated for admin access.
      currentAdminStatus = false;
    }

    if (!currentAdminStatus) {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав для доступа к этой странице. Вы будете перенаправлены на страницу входа.",
        variant: "destructive",
      });
      // Ensure all auth storage is cleared if access is denied
      clearAuthStorageAndRedirect();
    }

    setIsAdmin(currentAdminStatus);
    setIsLoadingAuth(false);
  }, [isMounted, toast, clearAuthStorageAndRedirect]);

  useEffect(() => {
    if (isMounted) {
      checkAdmin();
    }
  }, [checkAdmin, isMounted]);

   const handleLogout = useCallback(() => {
    deleteCookie('authToken', { path: '/' });
    deleteCookie('isLoggedIn', { path: '/' });
    deleteCookie('loggedInUser', { path: '/' });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUser');
      window.dispatchEvent(new Event('authStateChanged'));
      // Force navigation to ensure state is fully reset by browser
      window.location.assign('/auth/login');
    }
  }, []);


  // Show loading state until authentication check is complete
  if (!isMounted || isLoadingAuth) {
    return (
      <div className="container mx-auto py-8">
        <Card className="w-full p-4">
          <CardHeader>
            <CardTitle className="text-2xl text-center mb-4">Панель администратора</CardTitle>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                <Skeleton className="h-10 w-1/3 mx-auto" /> {/* Tab Skeleton */}
                <Skeleton className="h-64 w-full" /> {/* Content Skeleton */}
             </div>
            <p className="text-center text-muted-foreground mt-4">Проверка доступа...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // If not admin after check, the redirection should have happened, but as a fallback:
  if (!isAdmin) {
      return (
            <div className="container mx-auto py-8">
               <p className="text-center text-destructive">Доступ запрещен. Перенаправление на страницу входа...</p>
            </div>
      );
  }

  // Render admin panel if authenticated and admin
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