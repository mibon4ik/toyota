
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
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authCheck, setAuthCheck] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const doLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Error during logout API call
    }
    deleteCookie('isLoggedIn', { path: '/' });
    deleteCookie('loggedInUser', { path: '/' });
    deleteCookie('user-session', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUser');
      window.dispatchEvent(new Event('authStateChanged'));
    }
    router.replace('/auth/login');
  }, [router]);

  const checkPermissions = useCallback(async () => {
    if (!mounted) return;
    setAuthCheck(true);

    let userCookie = getCookie('loggedInUser');
    let activeUser: StoredUser | null = null;

    if (userCookie) {
      try {
        activeUser = JSON.parse(userCookie as string);
      } catch (e) {
        // Error parsing cookie
      }
    }
    
    if (!activeUser && typeof window !== 'undefined') {
        const localUser = localStorage.getItem('loggedInUser');
        if (localUser) {
            try {
                activeUser = JSON.parse(localUser);
            } catch (e) {
                 // Error parsing localStorage
            }
        }
    }
    
    const hasAdminRights = activeUser?.isAdmin === true;

    if (!hasAdminRights) {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав администратора или сессия истекла.",
        variant: "destructive",
      });
      setIsAdmin(false);
      doLogout(); 
    } else {
      setIsAdmin(true);
    }
    setAuthCheck(false);
  }, [mounted, toast, doLogout]);


  useEffect(() => {
    if (mounted) {
      checkPermissions();
    }
    const handleAuth = () => {
        if (mounted) {
          checkPermissions();
        }
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('authStateChanged', handleAuth);
    }
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('authStateChanged', handleAuth);
        }
    };
  }, [mounted, checkPermissions]);

   const userLogout = useCallback(() => {
    doLogout();
  }, [doLogout]);


  if (!mounted || authCheck) {
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

  if (!isAdmin) {
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
            <TabsList className="grid w-full grid-cols-4"> {/* Updated to 4 columns */}
              <TabsTrigger value="products">Товары</TabsTrigger>
              <TabsTrigger value="users">Пользователи</TabsTrigger>
              <TabsTrigger value="orders">Заказы</TabsTrigger>
              <TabsTrigger value="banners">Баннеры</TabsTrigger> {/* New Tab */}
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
            <TabsContent value="banners"> {/* New Tab Content */}
               <BannerManagementSection />
            </TabsContent>
          </Tabs>
        </CardContent>
        <div className="mt-8 flex justify-center">
          <Button onClick={userLogout} variant="outline">Выйти</Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminPanel;
