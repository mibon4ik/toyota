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
    imageUrl: 'https://picsum.photos/seed/bps001/300/200', // Keep placeholder, add hint if needed
    description: 'Оригинальные передние тормозные колодки для превосходного торможения.',
    category: 'Тормоза',
    compatibleVehicles: ['Toyota Camry 2018+', 'Toyota RAV4 2019+'],
    sku: 'TG-8901-F',
    stock: 50,
    dataAiHint: "brake pads"
  },
  {
    id: 'afl-002',
    name: 'Воздушный фильтр двигателя',
    brand: 'Denso',
    price: 9000,
    imageUrl: 'https://picsum.photos/seed/afl002/300/200', // Keep placeholder, add hint if needed
    description: 'Высококачественный воздушный фильтр для оптимальной работы двигателя.',
    category: 'Фильтры',
    compatibleVehicles: ['Toyota Corolla 2015+', 'Toyota Highlander 2017+'],
    sku: 'DN-17801',
    stock: 150,
     dataAiHint: "air filter"
  },
    {
    id: 'oil-003',
    name: 'Синтетическое моторное масло 0W-20',
    brand: 'Mobil 1',
    price: 17500,
    imageUrl: 'https://picsum.photos/seed/oil003/300/200', // Keep placeholder, add hint if needed
    description: 'Полностью синтетическое масло для улучшенной защиты и производительности.',
    category: 'Двигатель',
    compatibleVehicles: ['Большинство моделей Toyota'],
    sku: 'M1-0W20-5Q',
    stock: 80,
    rating: 4.9,
    reviewCount: 210,
     dataAiHint: "engine oil"
  },
  {
    id: 'flt-010',
    name: 'Масляный фильтр',
    brand: 'Toyota Genuine',
    price: 5000,
    imageUrl: 'https://picsum.photos/seed/oil010/300/200', // Keep placeholder, add hint if needed
    description: 'Оригинальный масляный фильтр для максимальной фильтрации.',
    category: 'Фильтры',
    compatibleVehicles: ['Большинство моделей Toyota'],
    sku: 'TG-90915-YZZD3',
    stock: 250,
    rating: 4.9,
    reviewCount: 300,
     dataAiHint: "oil filter"
  },
   {
    id: 'shk-004',
    name: 'Задние амортизаторы',
    brand: 'KYB',
    price: 60000,
    imageUrl: 'https://picsum.photos/seed/shk004/300/200', // Keep placeholder, add hint if needed
    description: 'Газонаполненные амортизаторы для комфортной и стабильной езды.',
    category: 'Подвеска',
    compatibleVehicles: ['Toyota Sienna 2015+', 'Lexus RX350 2016+'],
    sku: 'KYB-349041',
    stock: 30,
    rating: 4.6,
    reviewCount: 55,
     dataAiHint: "shock absorbers"
  },
   {
    id: 'lhd-005',
    name: 'Светодиодная лампа для фары (H11)',
    brand: 'Philips',
    price: 24995,
    imageUrl: 'https://picsum.photos/seed/lhd005/300/200', // Keep placeholder, add hint if needed
    description: 'Яркие и долговечные светодиодные лампы для лучшей видимости.',
    category: 'Электрика',
    compatibleVehicles: ['Различные модели Toyota/Lexus'],
    sku: 'PH-H11LED-X2',
    stock: 75,
    rating: 4.7,
    reviewCount: 92,
     dataAiHint: "headlight bulb"
  },
  {
    id: 'acc-006',
    name: 'Всесезонные коврики (комплект)',
    brand: 'WeatherTech',
    price: 75000,
    imageUrl: 'https://picsum.photos/seed/acc006/300/200', // Keep placeholder, add hint if needed
    description: 'Прочные коврики для защиты салона от грязи и влаги.',
    category: 'Аксессуары',
    compatibleVehicles: ['Toyota RAV4 2019+', 'Toyota Highlander 2020+'],
    sku: 'WT-441301-441302',
    stock: 40,
    rating: 4.9,
    reviewCount: 150,
     dataAiHint: "floor mats"
  },
  {
    "id": "wpr-016",
    "name": "Щетки стеклоочистителя (комплект)",
    "brand": "Bosch",
    "price": 12000,
    "imageUrl": "https://picsum.photos/seed/wpr016/300/200", // Keep placeholder, add hint if needed
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
    "reviewCount": 180,
     "dataAiHint": "wiper blades"
  },
  {
    "id": "flt-017",
    "name": "Топливный фильтр",
    "brand": "Denso",
    "price": 15000,
    "imageUrl": "https://picsum.photos/seed/flt017/300/200", // Keep placeholder, add hint if needed
    "description": "Фильтр тонкой очистки топлива для защиты топливной системы.",
    "category": "Фильтры",
    "compatibleVehicles": [
      "Toyota Land Cruiser 200 2008+",
      "Lexus LX570 2008+"
    ],
    "sku": "DN-23390",
    "stock": 55,
    "rating": 4.6,
    "reviewCount": 50,
     "dataAiHint": "fuel filter"
  },
  {
    "id": "eng-018",
    "name": "Ремень ГРМ (комплект с роликами)",
    "brand": "Gates",
    "price": 45000,
    "imageUrl": "https://picsum.photos/seed/eng018/300/200", // Keep placeholder, add hint if needed
    "description": "Комплект для замены ремня ГРМ, включая ролики и натяжитель.",
    "category": "Двигатель",
    "compatibleVehicles": [
      "Toyota Tundra 4.7L V8",
      "Toyota Sequoia 4.7L V8"
    ],
    "sku": "GTS-TCKWP295",
    "stock": 25,
    "rating": 4.8,
    "reviewCount": 70,
     "dataAiHint": "timing belt"
  },
   {
    "id": "rad-019",
    "name": "Радиатор охлаждения двигателя",
    "brand": "Spectra Premium",
    "price": 70000,
    "imageUrl": "https://picsum.photos/seed/rad019/300/200", // Keep placeholder, add hint if needed
    "description": "Высококачественный радиатор для эффективного охлаждения двигателя.",
    "category": "Двигатель",
    "compatibleVehicles": [
      "Toyota Camry 2012-2017"
    ],
    "sku": "SPR-CU13217",
    "stock": 18,
    "rating": 4.3,
    "reviewCount": 30,
     "dataAiHint": "car radiator"
  },
  {
    "id": "tir-020",
    "name": "Датчик давления в шинах (TPMS)",
    "brand": "Toyota Genuine",
    "price": 28000,
    "imageUrl": "https://picsum.photos/seed/tir020/300/200", // Keep placeholder, add hint if needed
    "description": "Оригинальный датчик TPMS для контроля давления в шинах.",
    "category": "Электрика",
    "compatibleVehicles": [
      "Различные модели Toyota/Lexus"
    ],
    "sku": "TG-42607-0C070",
    "stock": 100,
    "rating": 4.7,
    "reviewCount": 65,
     "dataAiHint": "tire pressure sensor"
  },
  {
    "id": "ext-021",
    "name": "Выхлопная труба (задняя секция)",
    "brand": "Walker",
    "price": 55000,
    "imageUrl": "https://picsum.photos/seed/ext021/300/200",
    "description": "Задняя секция выхлопной трубы для замены изношенной.",
    "category": "Выхлопная система",
    "compatibleVehicles": [
      "Toyota Sienna 2011-2016"
    ],
    "sku": "WLK-54723",
    "stock": 42,
    "rating": 4.4,
    "reviewCount": 38,
    "dataAiHint": "exhaust pipe"
  },
  {
    "id": "clh-022",
    "name": "Комплект сцепления",
    "brand": "Exedy",
    "price": 110000,
    "imageUrl": "https://picsum.photos/seed/clh022/300/200",
    "description": "Полный комплект сцепления для механической коробки передач.",
    "category": "Трансмиссия",
    "compatibleVehicles": [
      "Toyota Tacoma 2.7L 2005-2015"
    ],
    "sku": "EXD-KTY07",
    "stock": 15,
    "rating": 4.8,
    "reviewCount": 25,
    "dataAiHint": "clutch kit"
  },
  {
    "id": "mir-023",
    "name": "Боковое зеркало (правое, с подогревом)",
    "brand": "TYC",
    "price": 48000,
    "imageUrl": "https://picsum.photos/seed/mir023/300/200",
    "description": "Правое боковое зеркало с функцией подогрева.",
    "category": "Кузов",
    "compatibleVehicles": [
      "Toyota RAV4 2013-2018"
    ],
    "sku": "TYC-5230492",
    "stock": 33,
    "rating": 4.2,
    "reviewCount": 41,
    "dataAiHint": "side mirror"
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

    