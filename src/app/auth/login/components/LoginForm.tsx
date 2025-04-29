"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { setCookie } from 'cookies-next';
import { verifyPassword } from '@/lib/auth'; // Use the updated auth function
import type { User } from '@/types/user'; // Import the User type

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
    setIsMounted(true); // Indicate component has mounted on client
  }, []);

   // Simple token generation (replace with a more secure method like JWT in production)
  const generateToken = (user: User) => {
    const userData = {
      id: user.id,
      username: user.username, // Use username
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin || false, // Default to false if not present
    };
    // Basic Base64 encode - In real app use JWT or similar
    try {
      return btoa(JSON.stringify(userData));
    } catch (e) {
      console.error("Error generating token:", e);
      return `error-${Date.now()}`; // Fallback token
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    console.log("Login attempt with username:", username); // Log username

    try {
        const user = await verifyPassword(username, password); // Use username instead of email

        if (!user) {
          console.log("Login failed: Invalid credentials for username:", username);
          setError('Неверные учетные данные');
          setIsLoading(false);
          return;
        }

        console.log("Login successful for user:", user.username, "Is Admin:", user.isAdmin);

        // Credentials are valid, generate token and set cookies/localStorage
        const token = generateToken(user);
        const cookieOptions = {
          maxAge: 60 * 60 * 24 * 7, // Expires in 7 days
          path: '/',
          // secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
          // sameSite: 'lax', // Recommended
        };

        // Set cookies
        console.log("Setting cookies...");
        setCookie('authToken', token, cookieOptions);
        setCookie('isLoggedIn', 'true', cookieOptions);
        setCookie('loggedInUser', JSON.stringify(user), cookieOptions);
        console.log("Cookies set.");

         // Set localStorage AFTER ensuring window exists
         if (typeof window !== 'undefined') {
             console.log("Setting localStorage...");
             localStorage.setItem('isLoggedIn', 'true');
             localStorage.setItem('loggedInUser', JSON.stringify(user));
             console.log("localStorage set.");

             // Dispatch event to notify other components (like nav bar) immediately
             console.log("Dispatching authStateChanged event...");
             window.dispatchEvent(new Event('authStateChanged'));
             console.log("authStateChanged event dispatched.");

         } else {
             console.warn("localStorage is not available. Auth state might not persist across tabs immediately.");
         }


        toast({
            title: "Вход выполнен!",
            description: user.isAdmin ? "Вы успешно вошли в систему как администратор." : "Вы успешно вошли в систему.",
        });

        // Redirect based on role AFTER state updates are likely processed
        console.log("Redirecting in 150ms...");
        setTimeout(() => {
            if (user.isAdmin) {
                console.log("Redirecting admin to /admin");
                router.push('/admin'); // Redirect admin to admin page
            } else {
                 console.log("Redirecting user to /");
                router.push('/'); // Redirect regular user to home page
            }
             console.log("Redirection initiated.");
        }, 150);

    } catch (err) {
        console.error("Login error:", err);
        setError('Ошибка входа. Пожалуйста, попробуйте позже.');
    } finally {
        // Don't set isLoading false immediately before redirect
        // setIsLoading(false);
    }
  };

    // Prevent rendering on server to avoid hydration errors with localStorage
  if (!isMounted) {
    // Optionally render a loading state or skeleton
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
