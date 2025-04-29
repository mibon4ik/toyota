'use client';

import React, {useEffect, useState} from 'react';
import {useRouter} from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  carMake: string;
  carModel: string;
  vinCode: string;
}

const AdminPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in and is admin
    const loggedInUser = localStorage.getItem('loggedInUser');
    if (!loggedInUser || JSON.parse(loggedInUser).email !== 'admin@admin.com') {
      router.push('/auth/login');
    }

    // Load users from localStorage
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      setUsers(JSON.parse(storedUsers));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    router.push('/auth/login');
  };

  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-4xl p-4">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Панель администратора</CardTitle>
        </CardHeader>
        <CardContent>
          <h2 className="text-xl font-semibold mb-4">Зарегистрированные пользователи:</h2>
          {users.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {users.map((user, index) => (
                <Card key={index} className="p-4">
                  <CardHeader>
                    <CardTitle>{user.firstName} {user.lastName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p>Email: {user.email}</p>
                    <p>Номер телефона: {user.phoneNumber}</p>
                    <p>Марка машины: {user.carMake}</p>
                    <p>Модель машины: {user.carModel}</p>
                    <p>VIN-код: {user.vinCode}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p>Пользователи не найдены.</p>
          )}
          <Button className="mt-4" onClick={handleLogout}>Выйти</Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminPage;
