'use client';

import React from 'react';
import Autopart from "@/app/components/autopart";
import type { AutoPart } from '@/types/autopart';
import { Button } from "@/components/ui/button";
import Link from "next/link";


const newArrivals: AutoPart[] = [
 {
    id: 'lhd-005-new',
    name: 'Светодиодная лампа для фары (H11) - Новинка',
    brand: 'Philips',
    price: 24995,
    imageUrl: 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg',
    description: 'Яркие и долговечные светодиодные лампы для лучшей видимости.',
    category: 'Электрика',
    compatibleVehicles: ['Различные модели Toyota/Lexus'],
    sku: 'PH-H11LED-X2',
    stock: 75,
     dataAiHint: "led headlight bulb"
  },
  {
    id: 'acc-006-new',
    name: 'Всесезонные коврики (комплект) - Новинка',
    brand: 'WeatherTech',
    price: 75000,
    imageUrl: 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg',
    description: 'Прочные коврики для защиты салона от грязи и влаги.',
    category: 'Аксессуары',
    compatibleVehicles: ['Toyota RAV4 2019+', 'Toyota Highlander 2020+'],
    sku: 'WT-441301-441302',
    stock: 40,
     dataAiHint: "car floor mats"
  },
  {
    id: 'oil-003-dup-new',
    name: 'Синтетическое моторное масло 5W-30 - Новинка',
    brand: 'Castrol',
    price: 18500,
    imageUrl: 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg',
    description: 'Полностью синтетическое масло для универсальной защиты.',
    category: 'Двигатель',
    compatibleVehicles: ['Большинство моделей'],
    sku: 'CAS-EDGE-5W30',
    stock: 95,
     dataAiHint: "synthetic engine oil"
  },
   {
    id: 'shk-004-new',
    name: 'Задние амортизаторы - Новинка',
    brand: 'KYB',
    price: 60000,
    imageUrl: 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg',
    description: 'Газонаполненные амортизаторы для комфортной и стабильной езды.',
    category: 'Подвеска',
    compatibleVehicles: ['Toyota Sienna 2015+', 'Lexus RX350 2016+'],
    sku: 'KYB-349041',
    stock: 30,
     dataAiHint: "rear shock absorbers"
  },
   {
    id: 'flt-008-new',
    name: 'Салонный фильтр (угольный) - Новинка',
    brand: 'Bosch',
    price: 11250,
    imageUrl: 'https://content.onliner.by/news/1100x5616/790c5e93741342eab27803b6488cf355.jpg',
    description: 'Угольный салонный фильтр для очистки воздуха от пыли и запахов.',
    category: 'Фильтры',
    compatibleVehicles: ['Toyota Corolla 2015+', 'Toyota C-HR 2018+'],
    sku: 'BSH-6055C',
    stock: 120,
     dataAiHint: "cabin air filter"
  }
];

interface NewArrivalsProps {
  onAddToCart: (product: AutoPart) => void;
}

export const NewArrivals: React.FC<NewArrivalsProps> = ({ onAddToCart }) => {
  return (
    <section className="py-12">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Новые поступления</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {newArrivals.map((product) => (
            <Autopart key={product.id} product={product} onAddToCart={onAddToCart}/>
          ))}
        </div>
          <div className="text-center mt-8">
              <Button variant="outline" asChild>
                  <Link href="/shop?sort=newest">Смотреть все новинки</Link>
              </Button>
          </div>
      </div>
    </section>
  );
};


