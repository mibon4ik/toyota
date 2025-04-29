'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { createUser } from '@/lib/auth';
import { setCookie } from 'cookies-next';
import type { User } from '@/types/user';

const RegistrationPage = () => {
  const [username, setUsername] = useState(''); // Added username state
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

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Client-side validation
    if (!username || !firstName || !lastName || !phoneNumber || !password || !confirmPassword || !vinCode || !carMake || !carModel) { // Added username check
      setError('Пожалуйста, заполните все поля.');
      setIsLoading(false);
      return;
    }

    // Optional email validation if email is entered
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Неверный формат электронной почты.');
      setIsLoading(false);
      return;
    }

    if (vinCode.length !== 17 || !/^[A-HJ-NPR-Z0-9]{17}$/.test(vinCode.toUpperCase())) {
      setError('VIN-код должен состоять из 17 латинских букв (кроме I, O, Q) и цифр.');
      setIsLoading(false);
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setError('Пароль должен содержать минимум 8 символов, одну заглавную букву и одну цифру.');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      setIsLoading(false);
      return;
    }

    try {
      const newUserPayload = {
        username, // Include username
        firstName,
        lastName,
        email: email || undefined, // Send email only if provided
        phoneNumber,
        password, // Send raw password, hashing happens server-side
        carMake,
        carModel,
        vinCode: vinCode.toUpperCase(),
      };
      const registeredUser = await createUser(newUserPayload);

      // Set auth cookie and localStorage
       const token = generateToken(registeredUser);
       setCookie('authToken', token, { maxAge: 60 * 60 * 24 * 7 }); // Expires in 7 days
       setCookie('isLoggedIn', 'true', { maxAge: 60 * 60 * 24 * 7 });
       setCookie('loggedInUser', JSON.stringify(registeredUser), { maxAge: 60 * 60 * 24 * 7 });
        if (typeof window !== 'undefined') {
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('loggedInUser', JSON.stringify(registeredUser));
             window.dispatchEvent(new Event('authStateChanged')); // Notify nav bar
        }


      toast({
        title: 'Регистрация успешна!',
        description: 'Вы будете перенаправлены на главную страницу.',
      });

      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Ошибка при регистрации. Пожалуйста, попробуйте позже.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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
                // removed required attribute
                disabled={isLoading}
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
                className="[&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowPassword(!showPassword)}
                   disabled={isLoading}
                >
                  {showPassword ? <Icons.eyeOff className="h-4 w-4"/> : <Icons.eye className="h-4 w-4"/>}
                   <span className="sr-only">{showPassword ? 'Скрыть пароль' : 'Показать пароль'}</span>
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
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                   disabled={isLoading}
                >
                   {showConfirmPassword ? <Icons.eyeOff className="h-4 w-4"/> : <Icons.eye className="h-4 w-4"/>}
                    <span className="sr-only">{showConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}</span>
                </Button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            <Button type="submit" className="w-full hover:bg-[#8dc572] italic" disabled={isLoading}>
             {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationPage;
