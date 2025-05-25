
'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";
import type { StoredUser } from '@/types/user';

export const LoginForm = () => {
  const [loginUsername, setLoginUsername] = useState('admin');
  const [loginPassword, setLoginPassword] = useState('admin');
  const [loginError, setLoginError] = useState('');
  const navRouter = useRouter();
  const { toast: showToast } = useToast();
  const [revealPassword, setRevealPassword] = useState(false);
  const [isProcessingLogin, setIsProcessingLogin] = useState(false);
  const [isClientMounted, setIsClientMounted] = useState(false);
  const [loginSuccessUser, setLoginSuccessUser] = useState<StoredUser | null>(null);

  useEffect(() => {
    setIsClientMounted(true);
  }, []);

  const handleLoginSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!isClientMounted) return;

    setLoginError('');
    setIsProcessingLogin(true);
    setLoginSuccessUser(null);

    try {
      const apiResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username: loginUsername.trim(), password: loginPassword }),
      });

      const responseData = await apiResponse.json();

      if (!apiResponse.ok) {
        setLoginError(responseData.message || 'Ошибка входа. Пожалуйста, проверьте свои данные.');
        setIsProcessingLogin(false);
        return;
      }
      
      const userDataFromApi: StoredUser = responseData.user;
      
      // API sets HttpOnly and client-readable cookies.
      // For immediate UI update and cross-tab sync, update localStorage.
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('loggedInUser', JSON.stringify(userDataFromApi));
      window.dispatchEvent(new Event('authStateChanged')); 

      showToast({
        title: "Вход выполнен!",
        description: userDataFromApi.isAdmin ? "Вы вошли как администратор." : "Вы успешно вошли в систему.",
      });
      
      setLoginSuccessUser(userDataFromApi); // Trigger useEffect for navigation

    } catch (err) {
      setLoginError('Ошибка входа. Пожалуйста, попробуйте позже.');
      setIsProcessingLogin(false); // Ensure processing is reset on error
    }
    // Removed finally block for setIsProcessingLogin to avoid issues with state update sequence
  };

  useEffect(() => {
    if (loginSuccessUser && isClientMounted) {
      // setProcessingLogin is false AFTER API call finishes
      const targetPath = loginSuccessUser.isAdmin ? '/admin' : '/dashboard';
      navRouter.replace(targetPath);
      setIsProcessingLogin(false); // Ensure processing is false before navigation
    }
  }, [loginSuccessUser, isClientMounted, navRouter]);


  if (!isClientMounted) {
    return <div className="text-center text-muted-foreground">Загрузка формы входа...</div>;
  }

  return (
    <form onSubmit={handleLoginSubmit} className="space-y-4">
      <div>
        <Label htmlFor="username">Логин</Label>
        <Input
          id="username"
          type="text"
          placeholder="Логин"
          value={loginUsername}
          onChange={(e) => setLoginUsername(e.target.value)}
          required
          disabled={isProcessingLogin}
          autoComplete="username"
        />
      </div>
      <div>
        <Label htmlFor="password">Пароль</Label>
        <div className="relative">
          <Input
            id="password"
            type={revealPassword ? "text" : "password"}
            placeholder="Пароль"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            required
            disabled={isProcessingLogin}
            autoComplete="current-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setRevealPassword(!revealPassword)}
            disabled={isProcessingLogin}
            aria-label={revealPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {revealPassword ? <Icons.eyeOff className="h-4 w-4" /> : <Icons.eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      {loginError && <p className="text-destructive text-xs italic">{loginError}</p>}
      <Button type="submit" className="w-full" disabled={isProcessingLogin}>
        {isProcessingLogin ? (<><Icons.loader className="mr-2 h-4 w-4 animate-spin" /> Вход...</>) : 'Войти'}
      </Button>
    </form>
  );
};
