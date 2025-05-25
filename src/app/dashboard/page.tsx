
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import type { StoredUser } from '@/types/user';
import type { Order } from '@/types/order';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Icons } from '@/components/icons';
import { OrderList } from '@/app/admin/components/OrderList'; // Reusing admin's OrderList
import { getOrdersByCustomerEmail } from '@/services/orders';
import { EditProfileForm } from './components/EditProfileForm'; // Will create this next
import { useToast } from '@/hooks/use-toast';

const UserDashboard = () => {
  const routerInstance = useRouter();
  const { toast } = useToast();
  const [activeUser, setActiveUser] = useState<StoredUser | null>(null);
  const [userOrders, setUserOrders] = useState<Order[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);
  const [pageIsMounted, setPageIsMounted] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  useEffect(() => {
    setPageIsMounted(true);
  }, []);

  const fetchUserDataAndOrders = useCallback(async () => {
    setIsLoadingData(true);
    let userFromStorage: StoredUser | null = null;
    const userCookieData = getCookie('loggedInUser');

    if (userCookieData && typeof userCookieData === 'string') {
      try {
        userFromStorage = JSON.parse(userCookieData) as StoredUser;
      } catch (e) {
        console.warn("Dashboard: Error parsing user cookie", e);
      }
    } else {
      const lsUserData = localStorage.getItem('loggedInUser');
      if (lsUserData) {
        try {
          userFromStorage = JSON.parse(lsUserData) as StoredUser;
        } catch (e) {
          console.warn("Dashboard: Error parsing user from localStorage", e);
        }
      }
    }

    if (userFromStorage && userFromStorage.id) {
      setActiveUser(userFromStorage);
      if (userFromStorage.email) {
        setIsLoadingOrders(true);
        setOrdersError(null);
        try {
          const orders = await getOrdersByCustomerEmail(userFromStorage.email);
          setUserOrders(orders);
        } catch (err) {
          setOrdersError("Не удалось загрузить историю заказов.");
          toast({ title: "Ошибка", description: "Не удалось загрузить историю заказов.", variant: "destructive" });
        } finally {
          setIsLoadingOrders(false);
        }
      }
    } else {
      routerInstance.replace('/auth/login');
    }
    setIsLoadingData(false);
  }, [routerInstance, toast]);

  useEffect(() => {
    if (pageIsMounted) {
      fetchUserDataAndOrders();
    }
  }, [pageIsMounted, fetchUserDataAndOrders]);
  
  const handleProfileUpdate = (updatedUser: StoredUser) => {
    setActiveUser(updatedUser); // Update displayed user info
    // Also update MainNav if needed by dispatching authStateChanged or directly updating localStorage/cookies
    if (typeof window !== 'undefined') {
      localStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
      // Potentially update 'loggedInUser' cookie if it's client-writable and used by MainNav
      window.dispatchEvent(new Event('authStateChanged'));
    }
  };


  if (!pageIsMounted || isLoadingData) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-1/3 mb-8 rounded-md" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-7 w-1/2 mb-2 rounded-md" />
              <Skeleton className="h-5 w-3/4 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-full rounded-md" />)}
            </CardContent>
          </Card>
          <div className="space-y-6 lg:col-span-1">
            <Card>
              <CardHeader><Skeleton className="h-7 w-3/4 rounded-md" /></CardHeader>
              <CardContent><Skeleton className="h-10 w-1/2 rounded-md" /></CardContent>
            </Card>
             <Card>
              <CardHeader><Skeleton className="h-7 w-3/4 rounded-md" /></CardHeader>
              <CardContent><Skeleton className="h-10 w-1/2 rounded-md" /></CardContent>
            </Card>
          </div>
        </div>
        <div className="mt-8">
            <Skeleton className="h-8 w-1/4 mb-4 rounded-md" />
            <Skeleton className="h-40 w-full rounded-md" />
        </div>
        <p className="text-center text-muted-foreground mt-6 flex items-center justify-center">
            <Icons.loader className="mr-2 h-5 w-5 animate-spin" />
            Загрузка данных пользователя...
        </p>
      </div>
    );
  }

  if (!activeUser) {
    return <div className="container mx-auto py-8 text-center">Пожалуйста, войдите для доступа к личному кабинету. Перенаправление...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 shadow-lg rounded-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Добро пожаловать, {activeUser.firstName || activeUser.username}!</CardTitle>
            <CardDescription>Здесь вы можете управлять своими данными и просматривать информацию.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <h3 className="text-lg font-semibold mb-2 text-foreground">Ваши данные:</h3>
            <p><strong className="text-muted-foreground">Имя:</strong> {activeUser.firstName} {activeUser.lastName}</p>
            <p><strong className="text-muted-foreground">Логин:</strong> {activeUser.username}</p>
            <p><strong className="text-muted-foreground">Email:</strong> {activeUser.email || 'Не указан'}</p>
            <p><strong className="text-muted-foreground">Телефон:</strong> {activeUser.phoneNumber}</p>
            <p><strong className="text-muted-foreground">Автомобиль:</strong> {activeUser.carMake} {activeUser.carModel}</p>
            <p><strong className="text-muted-foreground">VIN:</strong> <span className="font-mono tracking-wider">{activeUser.vinCode}</span></p>
            <p><strong className="text-muted-foreground">Роль:</strong> {activeUser.isAdmin ? 'Администратор' : 'Пользователь'}</p>
          </CardContent>
        </Card>

        <div className="space-y-6 lg:col-span-1">
          <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                  <CardTitle className="text-lg">Редактировать профиль</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">Измените вашу личную информацию.</p>
                  <Button variant="outline" onClick={() => setIsEditProfileOpen(true)}>Изменить данные</Button>
              </CardContent>
          </Card>
          {activeUser.isAdmin && (
            <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                    <CardTitle className="text-lg text-primary">Доступ для администратора</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground text-sm mb-3">У вас есть права администратора.</p>
                    <Link href="/admin" passHref legacyBehavior={false}>
                        <Button className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">Перейти в Админ панель</Button>
                    </Link>
                </CardContent>
            </Card>
          )}
        </div>
      </div>

      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">История заказов</CardTitle>
          </CardHeader>
          <CardContent>
            <OrderList
              orderData={userOrders}
              isLoadingStatus={isLoadingOrders}
              errorMessage={ordersError}
            />
          </CardContent>
        </Card>
      </div>
      
      {activeUser && (
        <EditProfileForm
            userData={activeUser}
            isDialogOpen={isEditProfileOpen}
            onDialogClose={() => setIsEditProfileOpen(false)}
            onUserSaved={handleProfileUpdate}
        />
      )}
    </div>
  );
};

export default UserDashboard;
