"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";

const LoginPage = () => {
  const [email, setEmail] = useState('admin@admin.com');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === 'admin@admin.com' && password === 'admin') {
      localStorage.setItem('isLoggedIn', 'true');
      const user = {
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@admin.com',
      };
      localStorage.setItem('loggedInUser', JSON.stringify(user));
      toast({
        title: "Вход выполнен!",
        description: "Вы успешно вошли в систему.",
      });
      router.push(email === 'admin@admin.com' ? '/admin' : '/');
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
              <Label htmlFor="email">Адрес электронной почты</Label>
              <Input
                id="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Пароль"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Icons.shield /> : <Icons.user />}
                </Button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            <Button type="submit" className="w-full">
              Войти
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p>Еще нет аккаунта?</p>
            <Link href="/auth/register">
              <Button variant="secondary" className="bg-primary text-primary-foreground hover:bg-primary/90 italic">Зарегистрироваться</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
