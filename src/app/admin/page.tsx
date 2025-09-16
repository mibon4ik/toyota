
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
import { Icons } from '@/components/icons';

const AdminPanel = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(true);

  const performLogout = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error("AdminPanel: Logout API call failed:", error);
    }
    
    deleteCookie('isLoggedIn', { path: '/' });
    deleteCookie('loggedInUser', { path: '/' });
    deleteCookie('user-session', { path: '/' }); // Ensure server session cookie is also cleared from client perspective if possible
    
    window.dispatchEvent(new Event('authStateChanged')); 
    router.replace('/auth/login');
    router.refresh(); 
  }, [router]);

  useEffect(() => {
    let isComponentMounted = true;
    setAuthCheckInProgress(true);
    console.log("AdminPanel: useEffect for auth check triggered.");

    let userCookieString = getCookie('loggedInUser'); 
    let currentUserState: StoredUser | null = null;

    if (userCookieString && typeof userCookieString === 'string') {
        try {
            currentUserState = JSON.parse(userCookieString);
        } catch (e) {
            console.warn('AdminPanel Debug: Error parsing "loggedInUser" cookie:', e);
        }
    } else if (typeof window !== 'undefined') { 
        const userLocalStorageString = localStorage.getItem('loggedInUser');
        if (userLocalStorageString) {
            try {
                currentUserState = JSON.parse(userLocalStorageString);
            } catch (e) {
                 console.warn('AdminPanel Debug: Error parsing user from localStorage:', e);
            }
        }
    }
    
    console.log("AdminPanel Debug: Current user state from cookie/localStorage:", currentUserState);
    const adminRightsConfirmed = currentUserState?.isAdmin === true;
    console.log("AdminPanel Debug: Admin rights confirmed:", adminRightsConfirmed);


    if (isComponentMounted) {
        if (adminRightsConfirmed) {
            setIsAdminUser(true);
        } else {
            setIsAdminUser(false);
            toast({
                title: "Доступ запрещен",
                description: "У вас нет прав администратора или ваша сессия истекла. Пожалуйста, войдите как администратор.",
                variant: "destructive",
            });
            // Wait for toast to show before logging out to avoid race condition
            setTimeout(() => {
                 if (isComponentMounted) performLogout(); 
            }, 1000);
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
            <p className="text-center text-muted-foreground mt-4 flex items-center justify-center">
                <Icons.loader className="mr-2 h-5 w-5 animate-spin" />
                Проверка доступа...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!isAdminUser) {
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
            <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
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
