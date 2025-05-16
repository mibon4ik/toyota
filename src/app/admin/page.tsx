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
import { Skeleton } from '@/components/ui/skeleton';

const AdminDashboardPage = () => {
  const pageRouter = useRouter();
  const { toast: showAppToast } = useToast();
  const [componentMounted, setComponentMounted] = useState(false);
  const [isCurrentUserAdmin, setIsCurrentUserAdmin] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    setComponentMounted(true);
  }, []);

  const performLogoutAndRedirect = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Error during logout API call, can be logged if necessary
    }
    deleteCookie('isLoggedIn', { path: '/' });
    deleteCookie('loggedInUser', { path: '/' });
    deleteCookie('user-session', { path: '/' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUser');
      window.dispatchEvent(new Event('authStateChanged'));
    }
    pageRouter.replace('/auth/login');
  }, [pageRouter]);

  const verifyAdminRole = useCallback(async () => {
    if (!componentMounted) return;
    setCheckingAuth(true);

    const userCookieData = getCookie('loggedInUser');
    let activeUser: StoredUser | null = null;

    if (userCookieData) {
      try {
        activeUser = JSON.parse(userCookieData as string);
      } catch (e) {
        // Error parsing loggedInUser cookie
      }
    }
    
    if (!activeUser && typeof window !== 'undefined') {
        const localStorageUser = localStorage.getItem('loggedInUser');
        if (localStorageUser) {
            try {
                activeUser = JSON.parse(localStorageUser);
            } catch (e) {
                 // Error parsing loggedInUser from localStorage
            }
        }
    }
    
    const isAdmin = activeUser?.isAdmin === true;

    if (!isAdmin) {
      showAppToast({
        title: "Доступ запрещен",
        description: "У вас нет прав администратора или сессия истекла.",
        variant: "destructive",
      });
      setIsCurrentUserAdmin(false);
      performLogoutAndRedirect(); 
    } else {
      setIsCurrentUserAdmin(true);
    }
    setCheckingAuth(false);
  }, [componentMounted, showAppToast, performLogoutAndRedirect]);


  useEffect(() => {
    if (componentMounted) {
      verifyAdminRole();
    }
    const handleAuthUpdate = () => {
        if (componentMounted) {
          verifyAdminRole();
        }
    };
    if (typeof window !== 'undefined') {
        window.addEventListener('authStateChanged', handleAuthUpdate);
    }
    return () => {
        if (typeof window !== 'undefined') {
            window.removeEventListener('authStateChanged', handleAuthUpdate);
        }
    };
  }, [componentMounted, verifyAdminRole]);

   const logoutUser = useCallback(() => {
    performLogoutAndRedirect();
  }, [performLogoutAndRedirect]);


  if (!componentMounted || checkingAuth) {
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

  if (!isCurrentUserAdmin) {
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
          <Button onClick={logoutUser} variant="outline">Выйти</Button>
        </div>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
