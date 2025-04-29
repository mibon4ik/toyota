"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Icons } from "@/components/icons";

const RegistrationPage = () => {
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

  const handleRegistration = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !email || !phoneNumber || !password || !confirmPassword || !vinCode || !carMake || !carModel) {
      setError('Пожалуйста, заполните все поля.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают.');
      return;
    }

    if (vinCode.length !== 17) {
      setError('VIN-код должен содержать 17 символов.');
      return;
    }
    if (!/^[A-Za-z0-9]+$/.test(vinCode)) {
      setError('VIN-код должен содержать только латинские буквы и цифры.');
      return;
    }

    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(password)) {
      setError('Пароль должен содержать минимум 8 символов, одну заглавную букву и одну цифру.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Неверный формат электронной почты.');
      return;
    }

    // Store user data in localStorage
    let users = [];
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      users = JSON.parse(storedUsers);
    }

    // Check if email already exists
    const emailExists = users.some((user: any) => user.email === email);
    if (emailExists) {
      setError('Этот адрес электронной почты уже зарегистрирован.');
      return;
    }

    // Check if VIN code already exists
    const vinCodeExists = users.some((user: any) => user.vinCode === vinCode);
    if (vinCodeExists) {
      setError('Этот VIN-код уже зарегистрирован.');
      return;
    }

    const newUser = {
      firstName,
      lastName,
      email,
      phoneNumber,
      password,
      carMake,
      carModel,
      vinCode,
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('loggedInUser', JSON.stringify(newUser));
    toast({
      title: "Регистрация успешна!",
      description: "Вы будете перенаправлены на главную страницу.",
    });

    try {
      console.log('Регистрация успешна!');
      setError('');
      router.push('/');
    } catch (err) {
      setError('Ошибка при регистрации. Пожалуйста, попробуйте позже.');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleRegistration} className="space-y-4">
            <div>
              <Label htmlFor="firstName">Имя</Label>
              <Input
                id="firstName"
                type="text"
                placeholder="Имя"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
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
              />
            </div>
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
              <Label htmlFor="phoneNumber">Номер телефона</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="Номер телефона"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
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
              />
            </div>
            <div>
              <Label htmlFor="vinCode">VIN-код автомобиля</Label>
              <Input
                id="vinCode"
                type="text"
                placeholder="VIN-код автомобиля"
                value={vinCode}
                onChange={(e) => setVinCode(e.target.value.toUpperCase())} // Convert to uppercase
                required
                minLength={17}
                maxLength={17}
                pattern="[A-HJ-NPR-Z0-9]{17}" // Basic VIN pattern validation
                title="VIN-код должен состоять из 17 латинских букв (кроме I, O, Q) и цифр."
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
                  pattern="(?=.*\d)(?=.*[A-Z]).{8,}"
                  title="Пароль должен содержать минимум 8 символов, одну заглавную букву и одну цифру."
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <Icons.eyeOff /> : <Icons.eye />}
                </Button>
              </div>
            </div>
            <div>
              <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Подтверждение пароля"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <Icons.eyeOff /> : <Icons.eye />}
                </Button>
              </div>
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            <Button type="submit" className="w-full hover:bg-[#8dc572] italic">
              Зарегистрироваться
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationPage;
