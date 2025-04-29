'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { createUser } from '@/lib/auth';
import { setCookie } from 'cookies-next';
import type { User } from '@/types/user';

export const RegistrationForm = () => {
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [carMake, setCarMake] = useState('');
  const [carModel, setCarModel] = useState('');
  const [vinCode, setVinCode] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

   useEffect(() => {
        setIsMounted(true); // Indicate component has mounted on client
    }, []);


  // Simple token generation (replace with a more secure method like JWT in production)
  const generateToken = (user: User) => {
      const userData = {
          id: user.id,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          isAdmin: user.isAdmin || false,
      };
      try {
        return btoa(JSON.stringify(userData));
      } catch (e) {
        console.error("Error generating token:", e);
        return `error-${Date.now()}`;
      }
  };

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');


    // Client-side validation
    if (!username || !firstName || !lastName || !phoneNumber || !password || !confirmPassword || !vinCode || !carMake || !carModel) {
      setError('Пожалуйста, заполните все обязательные поля.');
      return;
    }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Неверный формат электронной почты.');
      return;
    }
    if (vinCode.length !== 17 || !/^[A-HJ-NPR-Z0-9]{17}$/i.test(vinCode)) { // Case-insensitive check
      setError('VIN-код должен состоять из 17 латинских букв (кроме I, O, Q) и цифр.');
      return;
    }
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setError('Пароль должен содержать минимум 8 символов, одну заглавную букву и одну цифру.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    setIsLoading(true); // Set loading true only after validation passes

    try {
      const newUserPayload = {
        username,
        firstName,
        lastName,
        email: email || undefined,
        phoneNumber,
        password, // Hashing happens server-side in createUser
        carMake,
        carModel,
        vinCode: vinCode.toUpperCase(),
      };
      const registeredUser = await createUser(newUserPayload);

      // --- Successful Registration ---
      console.log("Registration successful for:", registeredUser.username);

      // Set auth cookie and localStorage
       const token = generateToken(registeredUser);
       const cookieOptions = {
           maxAge: 60 * 60 * 24 * 7, // 7 days
           path: '/',
       };
       setCookie('authToken', token, cookieOptions);
       setCookie('isLoggedIn', 'true', cookieOptions);
       setCookie('loggedInUser', JSON.stringify(registeredUser), cookieOptions);

       if (typeof window !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUser', JSON.stringify(registeredUser));
            console.log("Dispatching authStateChanged event after registration...");
            window.dispatchEvent(new Event('authStateChanged')); // Notify nav bar
             console.log("authStateChanged event dispatched.");
        }


      toast({
        title: 'Регистрация успешна!',
        description: 'Вы будете перенаправлены на главную страницу.',
      });

       // Redirect AFTER state updates are likely processed
       console.log("Redirecting to / after registration in 150ms...");
       setTimeout(() => {
            router.push('/');
            console.log("Redirection initiated.");
       }, 150);


    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message || 'Ошибка при регистрации. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

   // Avoid rendering the form on the server
    if (!isMounted) {
        return <div className="text-center text-muted-foreground">Загрузка формы регистрации...</div>;
    }

  return (
    <form onSubmit={handleRegistration} className="space-y-4">
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
        <Label htmlFor="firstName">Имя</Label>
        <Input
          id="firstName"
          type="text"
          placeholder="Имя"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="given-name"
        />
      </div>
      <div>
        <Label htmlFor="lastName">Фамилия</Label>
        <Input
          id="lastName"
          type="text"
          placeholder="Фамилия"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
          disabled={isLoading}
          autoComplete="family-name"
        />
      </div>
      <div>
        <Label htmlFor="email">Адрес электронной почты (необязательно)</Label>
        <Input
          id="email"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
           autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="phoneNumber">Номер телефона</Label>
        <Input
          id="phoneNumber"
          type="tel"
          placeholder="Номер телефона"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          required
          disabled={isLoading}
           autoComplete="tel"
        />
      </div>
      <div>
        <Label htmlFor="carMake">Марка машины</Label>
        <Input
          id="carMake"
          type="text"
          placeholder="Марка машины"
          value={carMake}
          onChange={(e) => setCarMake(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="carModel">Модель машины</Label>
        <Input
          id="carModel"
          type="text"
          placeholder="Модель машины"
          value={carModel}
          onChange={(e) => setCarModel(e.target.value)}
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <Label htmlFor="vinCode">VIN-код автомобиля</Label>
        <Input
          id="vinCode"
          type="text"
          placeholder="VIN-код автомобиля"
          value={vinCode}
          onChange={(e) => setVinCode(e.target.value.toUpperCase())}
          required
          minLength={17}
          maxLength={17}
          pattern="[A-HJ-NPR-Z0-9]{17}"
          title="VIN-код должен состоять из 17 латинских букв (кроме I, O, Q) и цифр."
          disabled={isLoading}
          className="uppercase tracking-widest [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
           autoComplete="off" // VIN should generally not be auto-completed
        />
      </div>
      <div>
        <Label htmlFor="password">Пароль</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            pattern="(?=.*\d)(?=.*[A-Z]).{8,}"
            title="Пароль должен содержать минимум 8 символов, одну заглавную букву и одну цифру."
            disabled={isLoading}
             autoComplete="new-password"
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
            {showPassword ? <Icons.eyeOff className="h-4 w-4"/> : <Icons.eye className="h-4 w-4"/>}
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Подтверждение пароля"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
             disabled={isLoading}
             aria-label={showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
             {showConfirmPassword ? <Icons.eyeOff className="h-4 w-4"/> : <Icons.eye className="h-4 w-4"/>}
          </Button>
        </div>
      </div>
      {error && <p className="text-destructive text-xs italic">{error}</p>}
      <Button type="submit" className="w-full hover:bg-[#8dc572] italic" disabled={isLoading}>
       {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
      </Button>
    </form>
  );
};
