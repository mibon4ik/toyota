"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { setCookie } from 'cookies-next';
import { verifyPassword } from '@/lib/auth';
import type { StoredUser } from '@/types/user';
import type { CookieSerializeOptions } from 'cookie';

export const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const generateToken = (user: StoredUser) => {
    const userData = {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phoneNumber: user.phoneNumber,
      carMake: user.carMake,
      carModel: user.carModel,
      vinCode: user.vinCode,
      isAdmin: user.isAdmin, 
    };

    try {
      return btoa(JSON.stringify(userData)); 
    } catch (e) {
      return `error-${Date.now()}`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const user = await verifyPassword(username.trim(), password); // user is StoredUser | null

        if (!user) {
          setError('Неверные учетные данные');
          setIsLoading(false);
          return;
        }
        
        const userToStore: StoredUser = user; // user is already StoredUser

        const token = generateToken(userToStore); 
        const cookieOptions: CookieSerializeOptions = {
          maxAge: 60 * 60 * 24 * 7, 
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        };

        setCookie('authToken', token, cookieOptions);
        setCookie('isLoggedIn', 'true', cookieOptions);
        setCookie('loggedInUser', JSON.stringify(userToStore), cookieOptions); 

         if (typeof window !== 'undefined') {
             localStorage.setItem('isLoggedIn', 'true');
             localStorage.setItem('loggedInUser', JSON.stringify(userToStore)); 
             window.dispatchEvent(new Event('authStateChanged')); 
         }

        toast({
            title: "Вход выполнен!",
            description: userToStore.isAdmin ? "Вы вошли как администратор." : "Вы успешно вошли в систему.",
        });
        
        router.replace('/'); 
    } catch (err) {
        setError('Ошибка входа. Пожалуйста, попробуйте позже.');
    } finally {
        setIsLoading(false);
    }
  };


  if (!isMounted) {
    return <div className="text-center text-muted-foreground">Загрузка формы входа...</div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="username">Логин</Label>
        <Input
          id="username"
          type="text"
          placeholder="Логин"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="username"
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
            disabled={isLoading}
            autoComplete="current-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setShowPassword(!showPassword)}
            disabled={isLoading}
            aria-label={showPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showPassword ? <Icons.eyeOff className="h-4 w-4" /> : <Icons.eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {error && <p className="text-destructive text-xs italic">{error}</p>}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>
    </form>
  );
};
