'use client';

import React from 'react';
import { Card, CardTitle } from "@/components/ui/card";
import { Icons } from "@/components/icons";
import Link from "next/link";

const categories = [
  {
    name: 'Двигатель',
    icon: Icons.car,
    value: 'Двигатель',
    href: '/shop?category=Двигатель',
  },
  {
    name: 'Подвеска',
    icon: Icons.suspension, // Use the Zap icon for Suspension
    value: 'Подвеска',
    href: '/shop?category=Подвеска',
  },
  {
    name: 'Тормоза',
    icon: Icons.circle,
    value: 'Тормоза',
    href: '/shop?category=Тормоза',
  },
  {
    name: 'Электрика',
    icon: Icons.zap,
    value: 'Электрика',
    href: '/shop?category=Электрика',
  },
  {
    name: 'Кузов',
    icon: Icons.body,
    value: 'Кузов',
    href: '/shop?category=Кузов',
  },
  {
    name: 'Аксессуары',
    icon: Icons.accessories,
    value: 'Аксессуары',
    href: '/shop?category=Аксессуары',
  },
];

export const PopularCategories: React.FC = () => {
  return (
    <section className="py-12">
      <div className="container mx-auto text-center">
        <h2 className="text-3xl font-bold mb-8">Популярные категории</h2>
         <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {categories.map((category) => {
             const IconComponent = category.icon;
             return (
               <Link key={category.value} href={category.href ?? `/shop?category=${category.value}`} passHref legacyBehavior={false} className="block">
                  <Card className="w-full p-4 product-card text-center hover:shadow-md transition-shadow h-full flex flex-col justify-center items-center">
                     {IconComponent ? React.createElement(IconComponent, {className: "w-8 h-8 mb-2", style: { color: '#535353ff' } }) : null}
                     <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                  </Card>
               </Link>
             );
          })}
        </div>
      </div>
    </section>
  );
};
