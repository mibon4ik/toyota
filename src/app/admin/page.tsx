
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
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [authCheckInProgress, setAuthCheckInProgress] = useState(true);

  useEffect(() => {
    setMounted(true);
  }, []);

  const performLogout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      // Error during logout API call, already handled client-side
    }
    deleteCookie('isLoggedIn', { path: '/' });
    deleteCookie('loggedInUser', { path: '/' });
    // user-session is httpOnly, cleared by API
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('loggedInUser');
      window.dispatchEvent(new Event('authStateChanged')); // Notify other parts of UI
    }
    router.replace('/auth/login');
  }, [router]);

  const verifyAdminPermissions = useCallback(async () => {
    if (!mounted) return;
    setAuthCheckInProgress(true);

    let userFromCookie = getCookie('loggedInUser');
    let currentUser: StoredUser | null = null;

    if (userFromCookie) {
      try {
        currentUser = JSON.parse(userFromCookie as string);
        console.log('AdminPanel Debug: User from cookie:', currentUser);
      } catch (e) {
        console.error('AdminPanel Debug: Error parsing user cookie:', e);
      }
    }
    
    if (!currentUser && typeof window !== 'undefined') {
        const userFromLocalStorage = localStorage.getItem('loggedInUser');
        if (userFromLocalStorage) {
            try {
                currentUser = JSON.parse(userFromLocalStorage);
                console.log('AdminPanel Debug: User from localStorage:', currentUser);
            } catch (e) {
                 console.error('AdminPanel Debug: Error parsing user localStorage:', e);
            }
        }
    }
    
    console.log('AdminPanel Debug: Final current user for permission check:', currentUser);
    const adminRightsConfirmed = currentUser?.isAdmin === true;
    console.log('AdminPanel Debug: Admin rights confirmed:', adminRightsConfirmed);

    if (!adminRightsConfirmed) {
      toast({
        title: "Доступ запрещен",
        description: "У вас нет прав администратора или сессия истекла.",
        variant: "destructive",
      });
      setIsAdminUser(false);
      performLogout(); 
    } else {
      setIsAdminUser(true);
    }
    setAuthCheckInProgress(false);
  }, [mounted, toast, performLogout]);


  useEffect(() => {
    if (mounted) {
      verifyAdminPermissions();
    }
    // Removed 'authStateChanged' listener to simplify and rely on middleware + initial check
  }, [mounted, verifyAdminPermissions]);


  if (!mounted || authCheckInProgress) {
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
      // This part should ideally not be reached if middleware is effective,
      // but serves as a fallback if client-side check fails after middleware pass.
      // The verifyAdminPermissions function already handles redirecting to login.
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
