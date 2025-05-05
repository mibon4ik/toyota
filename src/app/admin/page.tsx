
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getCookie, deleteCookie, setCookie } from 'cookies-next';
import type { User } from '@/types/user';
import type { Order } from '@/types/order';
import type { AutoPart } from '@/types/autopart';
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

  const checkAdmin = useCallback(async () => {
     if (!isMounted) {
       return;
     }
    setIsLoadingAuth(true);

    const authTokenCookie = getCookie('authToken');
    const isLoggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');
    let adminStatus = false;
    let loggedInUser: User | null = null;

    if (authTokenCookie && isLoggedInCookie === 'true' && userCookie) {
      try {
        loggedInUser = JSON.parse(userCookie);
        adminStatus = !!loggedInUser?.isAdmin;
      } catch (e) {
        console.error("AdminPage: Error parsing loggedInUser cookie:", e);
        adminStatus = false;
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
      const localIsLoggedIn = typeof window !== 'undefined' ? localStorage.getItem('isLoggedIn') : null;
      const localUser = typeof window !== 'undefined' ? localStorage.getItem('loggedInUser') : null;
      if (localIsLoggedIn === 'true' && localUser) {
        try {
          loggedInUser = JSON.parse(localUser);
          adminStatus = !!loggedInUser?.isAdmin;
          if (adminStatus) {
             // Restore cookies if admin is logged in via localStorage
            const token = btoa(JSON.stringify({ id: loggedInUser.id, username: loggedInUser.username, isAdmin: loggedInUser.isAdmin }));
            const cookieOptions = { maxAge: 60 * 60 * 24 * 7, path: '/' };
            setCookie('authToken', token, cookieOptions);
            setCookie('isLoggedIn', 'true', cookieOptions);
            setCookie('loggedInUser', JSON.stringify(loggedInUser), cookieOptions);
          }
        } catch (e) {
          console.error("AdminPage: Error parsing localStorage user data:", e);
          adminStatus = false;
          if (typeof window !== 'undefined') {
             localStorage.removeItem('isLoggedIn');
             localStorage.removeItem('loggedInUser');
             window.dispatchEvent(new Event('authStateChanged'));
          }
        }
      }
    }

    if (!adminStatus) {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав для доступа к этой странице.",
        variant: "destructive",
      });
      // Ensure cookies/localStorage are cleared if access is denied
      deleteCookie('authToken', { path: '/' });
      deleteCookie('isLoggedIn', { path: '/' });
      deleteCookie('loggedInUser', { path: '/' });
       if (typeof window !== 'undefined') {
         localStorage.removeItem('isLoggedIn');
         localStorage.removeItem('loggedInUser');
         window.dispatchEvent(new Event('authStateChanged'));
      }
      router.push('/auth/login');
    }

    setIsAdmin(adminStatus);
    setIsLoadingAuth(false);
  }, [isMounted, router, toast]);

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
    }
    router.push('/auth/login');
  }, [router]);


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
               <p className="text-center text-destructive">Доступ запрещен. Перенаправление...</p>
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
