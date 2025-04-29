"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Link from "next/link";

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === 'admin' && password === 'admin') {
      localStorage.setItem('isLoggedIn', 'true');
      router.push('/');
    } else {
      setError('Неверные учетные данные');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Войти</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Имя пользователя</Label>
              <Input
                id="email"
                type="text"
                placeholder="Имя пользователя"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p>Еще нет аккаунта?</p>
            <Link href="/auth/register">
              <Button variant="secondary">Зарегистрироваться</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
