'use client';

import React from 'react';
import Autopart from "@/app/components/autopart";
import type { AutoPart } from '@/types/autopart';

// Keep the popularProducts data here or fetch it if needed
const popularProducts: AutoPart[] = [
  {
    id: 'bps-001',
    name: 'Передние тормозные колодки',
    brand: 'Toyota Genuine',
    price: 37750,
    imageUrl: 'https://picsum.photos/seed/bps001/300/200',
    description: 'Оригинальные передние тормозные колодки для превосходного торможения.',
    category: 'Тормоза',
    compatibleVehicles: ['Toyota Camry 2018+', 'Toyota RAV4 2019+'],
    sku: 'TG-8901-F',
    stock: 50,
  },
  {
    id: 'afl-002',
    name: 'Воздушный фильтр двигателя',
    brand: 'Denso',
    price: 9000,
    imageUrl: 'https://picsum.photos/seed/afl002/300/200',
    description: 'Высококачественный воздушный фильтр для оптимальной работы двигателя.',
    category: 'Фильтры',
    compatibleVehicles: ['Toyota Corolla 2015+', 'Toyota Highlander 2017+'],
    sku: 'DN-17801',
    stock: 150,
  },
    {
    id: 'oil-003',
    name: 'Синтетическое моторное масло 0W-20',
    brand: 'Mobil 1',
    price: 17500,
    imageUrl: 'https://picsum.photos/seed/oil003/300/200',
    description: 'Полностью синтетическое масло для улучшенной защиты и производительности.',
    category: 'Двигатель',
    compatibleVehicles: ['Большинство моделей Toyota'],
    sku: 'M1-0W20-5Q',
    stock: 80,
    rating: 4.9,
    reviewCount: 210
  },
  {
    id: 'flt-010',
    name: 'Масляный фильтр',
    brand: 'Toyota Genuine',
    price: 5000,
    imageUrl: 'https://picsum.photos/seed/oil010/300/200',
    description: 'Оригинальный масляный фильтр для максимальной фильтрации.',
    category: 'Фильтры',
    compatibleVehicles: ['Большинство моделей Toyota'],
    sku: 'TG-90915-YZZD3',
    stock: 250,
    rating: 4.9,
    reviewCount: 300
  },
   {
    id: 'shk-004',
    name: 'Задние амортизаторы',
    brand: 'KYB',
    price: 60000,
    imageUrl: 'https://picsum.photos/seed/shk004/300/200',
    description: 'Газонаполненные амортизаторы для комфортной и стабильной езды.',
    category: 'Подвеска',
    compatibleVehicles: ['Toyota Sienna 2015+', 'Lexus RX350 2016+'],
    sku: 'KYB-349041',
    stock: 30,
    rating: 4.6,
    reviewCount: 55,
  },
   {
    id: 'lhd-005',
    name: 'Светодиодная лампа для фары (H11)',
    brand: 'Philips',
    price: 24995,
    imageUrl: 'https://picsum.photos/seed/lhd005/300/200',
    description: 'Яркие и долговечные светодиодные лампы для лучшей видимости.',
    category: 'Электрика',
    compatibleVehicles: ['Различные модели Toyota/Lexus'],
    sku: 'PH-H11LED-X2',
    stock: 75,
    rating: 4.7,
    reviewCount: 92,
  },
  {
    id: 'acc-006',
    name: 'Всесезонные коврики (комплект)',
    brand: 'WeatherTech',
    price: 75000,
    imageUrl: 'https://picsum.photos/seed/acc006/300/200',
    description: 'Прочные коврики для защиты салона от грязи и влаги.',
    category: 'Аксессуары',
    compatibleVehicles: ['Toyota RAV4 2019+', 'Toyota Highlander 2020+'],
    sku: 'WT-441301-441302',
    stock: 40,
    rating: 4.9,
    reviewCount: 150,
  },
  {
    "id": "wpr-016",
    "name": "Щетки стеклоочистителя (комплект)",
    "brand": "Bosch",
    "price": 12000,
    "imageUrl": "https://picsum.photos/seed/wpr016/300/200",
    "description": "Всесезонные щетки стеклоочистителя для чистого обзора.",
    "category": "Кузов",
    "compatibleVehicles": [
      "Toyota Camry",
      "Toyota Corolla",
      "Toyota RAV4"
    ],
    "sku": "BSH-ICON-SET",
    "stock": 200,
    "rating": 4.7,
    "reviewCount": 180
  },
  {
    "id": "flt-017",
    "name": "Топливный фильтр",
    "brand": "Denso",
    "price": 15000,
    "imageUrl": "https://picsum.photos/seed/flt017/300/200",
    "description": "Фильтр тонкой очистки топлива для защиты топливной системы.",
    "category": "Фильтры",
    "compatibleVehicles": [
      "Toyota Land Cruiser 200 2008+",
      "Lexus LX570 2008+"
    ],
    "sku": "DN-23390",
    "stock": 55,
    "rating": 4.6,
    "reviewCount": 50
  },
  {
    "id": "eng-018",
    "name": "Ремень ГРМ (комплект с роликами)",
    "brand": "Gates",
    "price": 45000,
    "imageUrl": "https://picsum.photos/seed/eng018/300/200",
    "description": "Комплект для замены ремня ГРМ, включая ролики и натяжитель.",
    "category": "Двигатель",
    "compatibleVehicles": [
      "Toyota Tundra 4.7L V8",
      "Toyota Sequoia 4.7L V8"
    ],
    "sku": "GTS-TCKWP295",
    "stock": 25,
    "rating": 4.8,
    "reviewCount": 70
  },
   {
    "id": "rad-019",
    "name": "Радиатор охлаждения двигателя",
    "brand": "Spectra Premium",
    "price": 70000,
    "imageUrl": "https://picsum.photos/seed/rad019/300/200",
    "description": "Высококачественный радиатор для эффективного охлаждения двигателя.",
    "category": "Двигатель",
    "compatibleVehicles": [
      "Toyota Camry 2012-2017"
    ],
    "sku": "SPR-CU13217",
    "stock": 18,
    "rating": 4.3,
    "reviewCount": 30
  },
  {
    "id": "tir-020",
    "name": "Датчик давления в шинах (TPMS)",
    "brand": "Toyota Genuine",
    "price": 28000,
    "imageUrl": "https://picsum.photos/seed/tir020/300/200",
    "description": "Оригинальный датчик TPMS для контроля давления в шинах.",
    "category": "Электрика",
    "compatibleVehicles": [
      "Различные модели Toyota/Lexus"
    ],
    "sku": "TG-42607-0C070",
    "stock": 100,
    "rating": 4.7,
    "reviewCount": 65
  }
];

interface HitsOfSalesProps {
  onAddToCart: (product: AutoPart) => void;
}

export const HitsOfSales: React.FC<HitsOfSalesProps> = ({ onAddToCart }) => {
  return (
    <section className="py-12 bg-secondary rounded-lg">
      <div className="container mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center">Хиты продаж</h2>
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {popularProducts.map((product) => (
            <Autopart key={product.id} product={product} onAddToCart={onAddToCart} />
          ))}
        </div>
      </div>
    </section>
  );
};
