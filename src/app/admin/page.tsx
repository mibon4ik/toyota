
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { getCookie, deleteCookie } from 'cookies-next';
import type { StoredUser } from '@/types/user';
import { ProductManagementSection } from './sections/ProductManagementSection';
import { UserManagementSection } from './sections/UserManagementSection';
import { OrderManagementSection } from './sections/OrderManagementSection';
import { BannerManagementSection } from './sections/BannerManagementSection';
import { Skeleton } from '@/components/ui/skeleton';

const AdminPanel = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isAdminUser, setIsAdminUser] = useState(false); // Default to false
  const [authCheckInProgress, setAuthCheckInProgress] = useState(true);

  const performLogout = useCallback(async () => {
    console.log('AdminPanel Debug: performLogout called');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("AdminPanel Debug: Logout API call failed:", error);
    }
    deleteCookie('isLoggedIn', { path: '/' });
    deleteCookie('loggedInUser', { path: '/' });
    // user-session is httpOnly, cleared by API
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUser');
      window.dispatchEvent(new Event('authStateChanged')); 
    }
    router.replace('/auth/login');
  }, [router]);

  useEffect(() => {
    let isComponentMounted = true;
    console.log('AdminPanel Debug: useEffect for access verification running.');
    setAuthCheckInProgress(true);

    let userCookieString = getCookie('loggedInUser'); // This is the non-HttpOnly cookie
    let currentUserState: StoredUser | null = null;

    if (userCookieString && typeof userCookieString === 'string') {
        try {
            currentUserState = JSON.parse(userCookieString);
            console.log('AdminPanel Debug: User from "loggedInUser" cookie:', currentUserState);
        } catch (e) {
            console.error('AdminPanel Debug: Error parsing "loggedInUser" cookie:', e);
        }
    } else {
        console.log('AdminPanel Debug: "loggedInUser" cookie not found or not a string.');
    }
    
    // Fallback to localStorage for UI consistency, though middleware relies on HttpOnly cookie
    if (!currentUserState && typeof window !== 'undefined') {
        const userLocalStorageString = localStorage.getItem('loggedInUser');
        if (userLocalStorageString) {
            try {
                currentUserState = JSON.parse(userLocalStorageString);
                console.log('AdminPanel Debug: User from localStorage (fallback):', currentUserState);
            } catch (e) {
                 console.error('AdminPanel Debug: Error parsing user from localStorage:', e);
            }
        } else {
             console.log('AdminPanel Debug: "loggedInUser" not found in localStorage.');
        }
    }
    
    console.log('AdminPanel Debug: Final user object for client-side check:', currentUserState);
    const adminRightsConfirmed = currentUserState?.isAdmin === true;
    console.log('AdminPanel Debug: Client-side admin rights confirmed:', adminRightsConfirmed);

    if (isComponentMounted) {
        if (adminRightsConfirmed) {
            setIsAdminUser(true);
        } else {
            setIsAdminUser(false);
            toast({
                title: "Доступ запрещен",
                description: "У вас нет прав администратора или сессия истекла. Middleware должен был предотвратить это.",
                variant: "destructive",
            });
            // If middleware allowed access but client-side check fails,
            // it implies a desync or an issue. Logging out is a safe measure.
            performLogout(); 
        }
        setAuthCheckInProgress(false);
    }
    
    return () => {
        isComponentMounted = false;
    };
  }, [toast, performLogout]);


  if (authCheckInProgress) {
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

  if (!isAdminUser) {
      // This state should ideally not be reached if middleware is effective and client check is just a confirmation.
      // The `verifyAdminPermissions` useEffect already handles redirecting via performLogout.
      return (
            <div className="container mx-auto py-8">
               <p className="text-center text-destructive">Доступ запрещен. Перенаправление на страницу входа...</p>
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
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="orders">Заказы</TabsTrigger>
              <TabsTrigger value="banners">Баннеры</TabsTrigger>
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
            <TabsContent value="banners">
               <BannerManagementSection />
            </TabsContent>
          </Tabs>
        </CardContent>
        <div className="mt-8 flex justify-center">
          <Button onClick={performLogout} variant="outline">Выйти</Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;
