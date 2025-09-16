
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Icons } from '@/components/icons';
import { createUser } from '@/lib/auth';
import type { StoredUser } from '@/types/user';

export const RegistrationForm = () => {
  const [regUsername, setRegUsername] = useState('');
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhoneNumber, setRegPhoneNumber] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regCarMake, setRegCarMake] = useState('');
  const [regCarModel, setRegCarModel] = useState('');
  const [regVinCode, setRegVinCode] = useState('');
  const [registrationError, setRegistrationError] = useState('');
  const pageRouter = useRouter();
  const { toast: showToastMsg } = useToast();
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [clientMounted, setClientMounted] = useState(false);

   useEffect(() => {
        setClientMounted(true);
    }, []);

  const processRegistration: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();
    if (!clientMounted) return;
    setRegistrationError('');
    setIsRegistering(true);

    if (!regUsername || !regFirstName || !regLastName || !regPhoneNumber || !regPassword || !regConfirmPassword || !regVinCode || !regCarMake || !regCarModel) {
      setRegistrationError('Пожалуйста, заполните все обязательные поля.');
      setIsRegistering(false);
      return;
    }
    if (regEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(regEmail)) {
      setRegistrationError('Неверный формат электронной почты.');
      setIsRegistering(false);
      return;
    }
    if (regVinCode.length !== 17 || !/^[A-HJ-NPR-Z0-9]{17}$/i.test(regVinCode)) {
      setRegistrationError('VIN-код должен состоять из 17 латинских букв (кроме I, O, Q) и цифр.');
      setIsRegistering(false);
      return;
    }
    if (regPassword.length < 8) {
         setRegistrationError('Пароль должен содержать минимум 8 символов.');
         setIsRegistering(false);
         return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegistrationError('Пароли не совпадают.');
      setIsRegistering(false);
      return;
    }


    try {
      const newUserDetails = {
        username: regUsername,
        firstName: regFirstName,
        lastName: regLastName,
        email: regEmail || undefined,
        phoneNumber: regPhoneNumber,
        password: regPassword,
        carMake: regCarMake,
        carModel: regCarModel,
        vinCode: regVinCode.toUpperCase(),
      };
      
      await createUser(newUserDetails);

      const loginResponse = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, password: regPassword }),
      });

      if (!loginResponse.ok) {
        const loginErrorData = await loginResponse.json();
        throw new Error(loginErrorData.message || 'Не удалось автоматически войти после регистрации.');
      }
      
      const loginData = await loginResponse.json();
      const userToStoreInClient: StoredUser = loginData.user;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('loggedInUser', JSON.stringify(userToStoreInClient));
        window.dispatchEvent(new Event('authStateChanged'));
      }

      showToastMsg({
        title: 'Регистрация успешна!',
        description: 'Вы автоматически вошли в систему и будете перенаправлены.',
      });

       pageRouter.replace('/'); // Redirect to homepage
       pageRouter.refresh();
    } catch (err: any) {
      console.error("Registration error:", err);
      setRegistrationError(err.message || 'Ошибка при регистрации. Пожалуйста, попробуйте позже.');
    } finally {
      setIsRegistering(false);
    }
  };

    if (!clientMounted) {
        return <div className="text-center text-muted-foreground">Загрузка формы регистрации...</div>;
    }

  return (
    <form onSubmit={processRegistration} className="space-y-4">
       <div>
        <Label htmlFor="reg-username">Логин</Label>
        <Input
          id="reg-username"
          type="text"
          placeholder="Логин"
          value={regUsername}
          onChange={(e) => setRegUsername(e.target.value)}
          required
          disabled={isRegistering}
          autoComplete="username"
        />
      </div>
      <div>
        <Label htmlFor="reg-firstName">Имя</Label>
        <Input
          id="reg-firstName"
          type="text"
          placeholder="Имя"
          value={regFirstName}
          onChange={(e) => setRegFirstName(e.target.value)}
          required
          disabled={isRegistering}
          autoComplete="given-name"
        />
      </div>
      <div>
        <Label htmlFor="reg-lastName">Фамилия</Label>
        <Input
          id="reg-lastName"
          type="text"
          placeholder="Фамилия"
          value={regLastName}
          onChange={(e) => setRegLastName(e.target.value)}
          required
          disabled={isRegistering}
          autoComplete="family-name"
        />
      </div>
      <div>
        <Label htmlFor="reg-email">Адрес электронной почты (необязательно)</Label>
        <Input
          id="reg-email"
          type="email"
          placeholder="Email"
          value={regEmail}
          onChange={(e) => setRegEmail(e.target.value)}
          disabled={isRegistering}
           autoComplete="email"
        />
      </div>
      <div>
        <Label htmlFor="reg-phoneNumber">Номер телефона</Label>
        <Input
          id="reg-phoneNumber"
          type="tel"
          placeholder="Номер телефона"
          value={regPhoneNumber}
          onChange={(e) => setRegPhoneNumber(e.target.value)}
          required
          disabled={isRegistering}
           autoComplete="tel"
        />
      </div>
      <div>
        <Label htmlFor="reg-carMake">Марка машины</Label>
        <Input
          id="reg-carMake"
          type="text"
          placeholder="Марка машины"
          value={regCarMake}
          onChange={(e) => setRegCarMake(e.target.value)}
          required
          disabled={isRegistering}
        />
      </div>
      <div>
        <Label htmlFor="reg-carModel">Модель машины</Label>
        <Input
          id="reg-carModel"
          type="text"
          placeholder="Модель машины"
          value={regCarModel}
          onChange={(e) => setRegCarModel(e.target.value)}
          required
          disabled={isRegistering}
        />
      </div>
      <div>
        <Label htmlFor="reg-vinCode">VIN-код автомобиля</Label>
        <Input
          id="reg-vinCode"
          type="text"
          placeholder="VIN-код автомобиля"
          value={regVinCode}
          onChange={(e) => setRegVinCode(e.target.value.toUpperCase())}
          required
          minLength={17}
          maxLength={17}
          pattern="[A-HJ-NPR-Z0-9]{17}"
          title="VIN-код должен состоять из 17 латинских букв (кроме I, O, Q) и цифр."
          disabled={isRegistering}
          className="uppercase tracking-widest font-mono [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
           autoComplete="off"
        />
      </div>
      <div>
        <Label htmlFor="reg-password">Пароль</Label>
        <div className="relative">
          <Input
            id="reg-password"
            type={showRegPassword ? 'text' : 'password'}
            placeholder="Пароль"
            value={regPassword}
            onChange={(e) => setRegPassword(e.target.value)}
            required
            minLength={8}
            title="Пароль должен содержать минимум 8 символов."
            disabled={isRegistering}
             autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setShowRegPassword(!showRegPassword)}
             disabled={isRegistering}
              aria-label={showRegPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
            {showRegPassword ? <Icons.eyeOff className="h-4 w-4"/> : <Icons.eye className="h-4 w-4"/>}
          </Button>
        </div>
      </div>
      <div>
        <Label htmlFor="reg-confirmPassword">Подтверждение пароля</Label>
        <div className="relative">
          <Input
            id="reg-confirmPassword"
            type={showRegConfirmPassword ? 'text' : 'password'}
            placeholder="Подтверждение пароля"
            value={regConfirmPassword}
            onChange={(e) => setRegConfirmPassword(e.target.value)}
            required
            disabled={isRegistering}
            autoComplete="new-password"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 h-7 w-7"
            onClick={() => setShowRegConfirmPassword(!showRegConfirmPassword)}
             disabled={isRegistering}
             aria-label={showRegConfirmPassword ? 'Скрыть пароль' : 'Показать пароль'}
          >
             {showRegConfirmPassword ? <Icons.eyeOff className="h-4 w-4"/> : <Icons.eye className="h-4 w-4"/>}
          </Button>
        </div>
      </div>
      {registrationError && <p className="text-destructive text-xs italic">{registrationError}</p>}
      <Button type="submit" className="w-full hover:bg-[#8dc572] italic" disabled={isRegistering}>
       {isRegistering ? (<><Icons.loader className="mr-2 h-4 w-4 animate-spin" /> Регистрация...</>) : 'Зарегистрироваться'}
      </Button>
    </form>
  );
};
