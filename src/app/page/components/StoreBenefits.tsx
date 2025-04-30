'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";

const benefits = [
  {
    title: 'Бесплатная доставка',
    description: 'Наслаждайтесь бесплатной доставкой заказов на сумму свыше 50.000 тенге.',
    icon: Icons.truck,
  },
  {
    title: 'Гарантия качества',
    description: 'Мы предлагаем только высококачественные автозапчасти.',
    icon: Icons.check,
  },
  {
    title: 'Круглосуточная поддержка',
    description: 'Наша служба поддержки работает круглосуточно и готова помочь вам.',
    icon: Icons.help,
  },
];

export const StoreBenefits: React.FC = () => {
  return (
    <section className="py-12 bg-secondary rounded-lg">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Почему выбирают нас?</h2>
         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((benefit) => {
            const IconComponent = benefit.icon;
            return (
              <Card key={benefit.title} className="p-6 text-center">
                {IconComponent && React.createElement(IconComponent, { className: "w-10 h-10 mb-4 mx-auto text-[#535353ff]" })}
                <CardTitle className="text-lg font-semibold mb-2">{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
