"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from '@/components/ui/button';
import { LoginForm } from './components/LoginForm';

const LoginPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <Card className="w-full max-w-md p-4 sm:p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Войти</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <LoginForm /> {/* Use the LoginForm component */}
          <div className="mt-4 text-center">
            <p className="text-muted-foreground mb-2">Еще нет аккаунта?</p>
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
