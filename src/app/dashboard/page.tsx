
'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import type { StoredUser } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Icons } from '@/components/icons';

const UserDashboard = () => {
  const routerInstance = useRouter();
  const [activeUser, setActiveUser] = useState<StoredUser | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [pageIsMounted, setPageIsMounted] = useState(false);

  useEffect(() => {
    setPageIsMounted(true);
  }, []);

  useEffect(() => {
    if (pageIsMounted) {
      let userFromStorage: StoredUser | null = null;
      const userCookieData = getCookie('loggedInUser');

      if (userCookieData && typeof userCookieData === 'string') {
        try {
          userFromStorage = JSON.parse(userCookieData) as StoredUser;
        } catch (e) {
          // console.warn("Dashboard: Error parsing user cookie", e);
        }
      } else {
        const lsUserData = localStorage.getItem('loggedInUser');
        if (lsUserData) {
            try {
                userFromStorage = JSON.parse(lsUserData) as StoredUser;
            } catch (e) {
                // console.warn("Dashboard: Error parsing user from localStorage", e);
            }
        }
      }

      if (userFromStorage && userFromStorage.id) {
        setActiveUser(userFromStorage);
      } else {
        routerInstance.replace('/auth/login');
      }
      setIsLoadingData(false);
    }
  }, [pageIsMounted, routerInstance]);

  if (!pageIsMounted || isLoadingData) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-10 w-1/3 mb-8 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-7 w-1/2 mb-2 rounded-md" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-5 w-full rounded-md" />)}
            </CardContent>
          </Card>
          <div className="space-y-6">
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

        <div className="space-y-6">
          <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                  <CardTitle className="text-lg">История заказов</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">Здесь будет отображаться история ваших заказов.</p>
                  <Button variant="outline" disabled>Посмотреть заказы (Скоро)</Button>
              </CardContent>
          </Card>
          <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                  <CardTitle className="text-lg">Редактировать профиль</CardTitle>
              </CardHeader>
              <CardContent>
                  <p className="text-muted-foreground text-sm mb-3">Измените вашу личную информацию.</p>
                  <Button variant="outline" disabled>Изменить данные (Скоро)</Button>
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
    </div>
  );
};

export default UserDashboard;

