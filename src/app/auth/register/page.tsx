"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

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

    // Store user data in localStorage
    let users = [];
    const storedUsers = localStorage.getItem('users');
    if (storedUsers) {
      users = JSON.parse(storedUsers);
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
    toast({
        title: "Регистрация успешна!",
        description: "Вы будете перенаправлены на страницу входа",
    });

    try {
      console.log('Регистрация успешна!');
      setError('');
      router.push('/auth/login');
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
                type="number"
                placeholder="VIN-код автомобиля"
                value={vinCode}
                onChange={(e) => setVinCode(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Подтверждение пароля</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Подтверждение пароля"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs italic">{error}</p>}
            <Button type="submit" className="w-full">
              Зарегистрироваться
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationPage;
