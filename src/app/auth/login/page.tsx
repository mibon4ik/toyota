"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import { setCookie } from 'cookies-next';
import { verifyPassword } from '@/lib/auth'; // Use the updated auth function
import type { User } from '@/types/user'; // Import the User type

const LoginPage = () => {
  const [username, setUsername] = useState(''); // Changed from email to username
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


  const generateToken = (user: User) => {
    // Simple token generation (replace with a more secure method like JWT in production)
    const userData = {
      id: user.id,
      username: user.username, // Use username
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin || false, // Default to false if not present
    };
    return btoa(JSON.stringify(userData)); // Base64 encode for simplicity
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        const user = await verifyPassword(username, password); // Use username instead of email

        if (!user) {
          setError('Неверные учетные данные');
          setIsLoading(false);
          return;
        }

        // Credentials are valid, generate token and set cookies/localStorage
        const token = generateToken(user);
        const cookieOptions = { maxAge: 60 * 60 * 24 * 7 }; // Expires in 7 days

        // Set cookies
        setCookie('authToken', token, cookieOptions);
        setCookie('isLoggedIn', 'true', cookieOptions);
        setCookie('loggedInUser', JSON.stringify(user), cookieOptions);

         // Set localStorage AFTER ensuring window exists
         if (typeof window !== 'undefined') {
             localStorage.setItem('isLoggedIn', 'true');
             localStorage.setItem('loggedInUser', JSON.stringify(user));
             // Dispatch event to notify other components (like nav bar) immediately
             // Ensure this event is dispatched reliably
             setTimeout(() => window.dispatchEvent(new Event('authStateChanged')), 0);
         } else {
             console.warn("localStorage is not available. Auth state might not persist across tabs immediately.");
         }


        toast({
            title: "Вход выполнен!",
            description: user.isAdmin ? "Вы успешно вошли в систему как администратор." : "Вы успешно вошли в систему.",
        });

        // Redirect based on role AFTER state updates are likely processed
        // Add a small delay before redirecting to allow state updates to propagate
        setTimeout(() => {
            if (user.isAdmin) {
                router.push('/admin'); // Redirect admin to admin page
            } else {
                router.push('/'); // Redirect regular user to home page
            }
        }, 100); // Small delay (e.g., 100ms)

    } catch (err) {
        console.error("Login error:", err);
        setError('Ошибка входа. Пожалуйста, попробуйте позже.');
    } finally {
        setIsLoading(false);
    }
  };

  // Prevent rendering on server to avoid hydration errors with localStorage
    if (!isMounted) {
        return null;
    }


  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Войти</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="username">Логин</Label> {/* Changed from email to username */}
              <Input
                id="username"
                type="text" // Changed from email to text
                placeholder="Логин" // Changed placeholder
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={isLoading}
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? <Icons.eyeOff className="h-4 w-4" /> : <Icons.eye className="h-4 w-4" />}
                   <span className="sr-only">{showPassword ? 'Скрыть пароль' : 'Показать пароль'}</span>
                </Button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Вход...' : 'Войти'}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <p>Еще нет аккаунта?</p>
            <Link href="/auth/register">
               <Button variant="secondary" className="bg-[#535353ff] text-primary-foreground hover:bg-[#535353ff]/90 italic">Зарегистрироваться</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
