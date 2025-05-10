
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { setCookie } from 'cookies-next';
import { verifyPassword } from '@/lib/auth';
import type { User } from '@/types/user';
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


  const generateToken = (user: User) => {
    // Ensure all necessary user fields are included for the token/storage, except password
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
      isAdmin: user.isAdmin || false,
    };

    try {
      return btoa(JSON.stringify(userData)); // Base64 encode the user data string
    } catch (e) {
      console.error("Error generating token:", e);
      return `error-${Date.now()}`; // Fallback token
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log("Login attempt with username:", username.trim());

    try {
        const user = await verifyPassword(username.trim(), password);

        if (!user) {
          console.log("Login failed: Invalid credentials for username:", username.trim());
          setError('Неверные учетные данные');
          setIsLoading(false);
          return;
        }

        console.log("Login successful for user:", user.username, "Is Admin:", user.isAdmin);

        // User object from verifyPassword already excludes password
        // If it didn't, you'd do: const { password: _omittedPassword, ...userToStore } = user;
        const userToStore = user; // Assuming verifyPassword returns user without password hash

        const token = generateToken(userToStore); // Generate token based on user data
        const cookieOptions: CookieSerializeOptions = {
          maxAge: 60 * 60 * 24 * 7, // 1 week
          path: '/',
          sameSite: 'lax',
          secure: process.env.NODE_ENV === 'production',
        };

        console.log("Setting cookies with options:", cookieOptions);
        setCookie('authToken', token, cookieOptions);
        setCookie('isLoggedIn', 'true', cookieOptions);
        setCookie('loggedInUser', JSON.stringify(userToStore), cookieOptions); // Store the user object
        console.log("Cookies set.");

         if (typeof window !== 'undefined') {
             console.log("Setting localStorage...");
             localStorage.setItem('isLoggedIn', 'true');
             localStorage.setItem('loggedInUser', JSON.stringify(userToStore)); // Store the user object
             console.log("localStorage set.");

             console.log("Dispatching authStateChanged event...");
             window.dispatchEvent(new Event('authStateChanged'));
             console.log("authStateChanged event dispatched.");
         } else {
             console.warn("localStorage is not available. Auth state might not persist across tabs immediately.");
         }

        toast({
            title: "Вход выполнен!",
            description: userToStore.isAdmin ? "Вы вошли как администратор." : "Вы успешно вошли в систему.",
        });

        console.log("Redirecting to / after login...");
        router.replace('/'); // Redirect to home page
        console.log("Redirection initiated.");

    } catch (err) {
        console.error("Login error:", err);
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
