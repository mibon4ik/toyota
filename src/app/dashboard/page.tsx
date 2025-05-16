
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie } from 'cookies-next';
import type { StoredUser } from '@/types/user';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

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
      const userCookieData = getCookie('loggedInUser');
      if (userCookieData) {
        try {
          const parsedUserData = JSON.parse(userCookieData as string) as StoredUser;
          setActiveUser(parsedUserData);
        } catch (e) {
          console.error("Dashboard: Error parsing user cookie", e);
          routerInstance.push('/auth/login');
        }
      } else {
      }
      setIsLoadingData(false);
    }
  }, [pageIsMounted, routerInstance]);

  if (!pageIsMounted || isLoadingData) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-12 w-1/2 mb-6" />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3 mb-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-6 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!activeUser) {
    return <div className="container mx-auto py-8 text-center">Пожалуйста, войдите для доступа к личному кабинету.</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Личный кабинет</h1>
      <Card>
        <CardHeader>
          <CardTitle>Добро пожаловать, {activeUser.firstName || activeUser.username}!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>Это ваш личный кабинет. Здесь вы можете управлять своими данными и заказами.</p>
          <div>
            <h3 className="text-lg font-semibold">Ваши данные:</h3>
            <p><strong>Имя:</strong> {activeUser.firstName} {activeUser.lastName}</p>
            <p><strong>Логин:</strong> {activeUser.username}</p>
            <p><strong>Email:</strong> {activeUser.email || 'Не указан'}</p>
            <p><strong>Телефон:</strong> {activeUser.phoneNumber}</p>
            <p><strong>Автомобиль:</strong> {activeUser.carMake} {activeUser.carModel}</p>
            <p><strong>VIN:</strong> {activeUser.vinCode}</p>
            <p><strong>Роль:</strong> {activeUser.role === 'admin' ? 'Администратор' : 'Пользователь'}</p>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
};

export default UserDashboard;
