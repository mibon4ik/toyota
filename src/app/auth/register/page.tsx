'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RegistrationForm } from './components/RegistrationForm';

const RegistrationPage = () => {
  return (
    <div className="flex justify-center items-center min-h-screen py-10">
      <Card className="w-full max-w-md p-4 sm:p-6">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Регистрация</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <RegistrationForm /> {/* Use the RegistrationForm component */}
        </CardContent>
      </Card>
    </div>
  );
};

export default RegistrationPage;
