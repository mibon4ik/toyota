'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import type { StoredUser } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
      } else {
        routerInstance.replace('/auth/login');
      }
      setIsLoadingData(false);
    }
  }, [pageIsMounted, routerInstance]);

  if (!pageIsMounted || isLoadingData) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-1/2 mb-6 rounded-md" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full rounded-md" />
            <Skeleton className="h-6 w-2/3 rounded-md" />
            <Skeleton className="h-6 w-full rounded-md" />
             <p className="text-center text-muted-foreground mt-4 flex items-center justify-center">
                <Icons.loader className="mr-2 h-5 w-5 animate-spin" />
                Загрузка данных пользователя...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeUser) {
    return <div className="container mx-auto py-8 text-center">Пожалуйста, войдите для доступа к личному кабинету. Перенаправление...</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>
      <Card className="shadow-lg rounded-lg">
        <CardHeader>
          <CardTitle className="text-2xl">Добро пожаловать, {activeUser.firstName || activeUser.username}!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-muted-foreground">Это ваш личный кабинет. Здесь вы можете управлять своими данными и просматривать информацию.</p>
          
          <Card>
            <CardHeader>
                <CardTitle className="text-xl">Ваши данные:</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
                <p><strong>Имя:</strong> {activeUser.firstName} {activeUser.lastName}</p>
                <p><strong>Логин:</strong> {activeUser.username}</p>
                <p><strong>Email:</strong> {activeUser.email || 'Не указан'}</p>
                <p><strong>Телефон:</strong> {activeUser.phoneNumber}</p>
                <p><strong>Автомобиль:</strong> {activeUser.carMake} {activeUser.carModel}</p>
                <p><strong>VIN:</strong> <span className="font-mono tracking-wider">{activeUser.vinCode}</span></p>
                <p><strong>Роль:</strong> {activeUser.isAdmin ? 'Администратор' : 'Пользователь'}</p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
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
          </div>
          
          {activeUser.isAdmin && (
            <div className="mt-8 border-t pt-6">
                <h3 className="text-xl font-semibold mb-3">Быстрый доступ для администратора</h3>
                <Link href="/admin" passHref legacyBehavior={false}>
                    <Button className="w-full sm:w-auto">Перейти в Админ панель</Button>
                </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;