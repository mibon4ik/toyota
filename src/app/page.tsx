'use client';

import React, {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icons} from "@/components/icons";
import {cn} from "@/lib/utils";
import Autopart from "@/components/autopart";
import Link from "next/link";
import {suggestCompatibleParts} from '@/ai/flows/suggest-compatible-parts';
import {Input} from "@/components/ui/input";
import {useToast} from "@/hooks/use-toast";

const categories = [
  {
    name: 'Двигатель',
    icon: Icons.engine,
    href: '/shop?category=engine',
  },
  {
    name: 'Подвеска',
    icon: Icons.suspension,
    href: '/shop?category=suspension',
  },
  {
    name: 'Тормоза',
    icon: Icons.brakes,
    href: '/shop?category=brakes',
  },
  {
    name: 'Электрика',
    icon: Icons.electrical,
    href: '/shop?category=electrical',
  },
  {
    name: 'Кузов',
    icon: Icons.body,
    href: '/shop?category=body',
  },
  {
    name: 'Аксессуары',
    icon: Icons.accessories,
    href: '/shop?category=accessories',
  },
];

const popularProducts = [
  {
    id: 'pp1',
    name: 'Высокопроизводительный воздушный фильтр',
    brand: 'K&N',
    price: 39.99,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Улучшите производительность своего двигателя с помощью этого воздушного фильтра с высоким потоком.',
    category: 'Фильтры',
    compatibleVehicles: ['Все автомобили'],
  },
  {
    id: 'pp2',
    name: 'Керамические тормозные колодки',
    brand: 'Akebono',
    price: 65.00,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Наслаждайтесь тихим и плавным торможением с этими керамическими тормозными колодками.',
    category: 'Тормоза',
    compatibleVehicles: ['Седаны', 'Внедорожники'],
  },
];

const newArrivals = [
  {
    id: 'na1',
    name: 'Светодиодные лампы для фар',
    brand: 'Philips',
    price: 45.50,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Обновите свои фары с помощью этих ярких и энергоэффективных светодиодных ламп.',
    category: 'Электрика',
    compatibleVehicles: ['Легковые автомобили', 'Грузовики'],
  },
  {
    id: 'na2',
    name: 'Всепогодные коврики',
    brand: 'WeatherTech',
    price: 120.00,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Защитите интерьер своего автомобиля с помощью этих прочных ковриков.',
    category: 'Аксессуары',
    compatibleVehicles: ['Все автомобили'],
  },
  {
    id: 'na3',
    name: 'Синтетическое моторное масло',
    brand: 'Mobil 1',
    price: 29.99,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Поддерживайте плавную работу двигателя с помощью этого синтетического моторного масла.',
    category: 'Двигатель',
    compatibleVehicles: ['Легковые автомобили'],
  },
  {
    id: 'na4',
    name: 'Амортизаторы',
    brand: 'Bilstein',
    price: 89.00,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Улучшите управляемость своего автомобиля с помощью этих высококачественных амортизаторов.',
    category: 'Подвеска',
    compatibleVehicles: ['Внедорожники', 'Грузовики'],
  },
];

const benefits = [
  {
    title: 'Бесплатная доставка',
    description: 'Наслаждайтесь бесплатной доставкой заказов на сумму свыше 99 долларов.',
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

const blogPosts = [
  {
    title: 'Важность регулярной замены масла',
    imageUrl: 'https://picsum.photos/400/200',
    href: '/blog/oil-changes',
  },
  {
    title: 'Выбор правильных тормозных колодок для вашего автомобиля',
    imageUrl: 'https://picsum.photos/400/200',
    href: '/blog/brake-pads',
  },
];

const banners = [
  {
    title: 'Летняя распродажа - скидки до 50%',
    imageUrl: 'https://picsum.photos/800/300',
    buttonText: 'Купить сейчас',
    href: '/shop',
  },
  {
    title: 'Новые поступления - ознакомьтесь с последними деталями',
    imageUrl: 'https://picsum.photos/800/300',
    buttonText: 'Посмотреть новинки',
    href: '/shop',
  },
];

async function getCompatibleParts(make: string, model: string) {
  return await suggestCompatibleParts({make: make, model: model});
}

const HomePage = () => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [compatibleParts, setCompatibleParts] = useState<any>(null);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!make || !model) {
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите марку и модель.",
        variant: "destructive",
      });
      return;
    }

    try {
      const parts = await getCompatibleParts(make, model);
      setCompatibleParts(parts);
    } catch (error) {
      console.error("Failed to fetch compatible parts:", error);
      toast({
        title: "Ошибка",
        description: "Не удалось получить совместимые детали. Пожалуйста, попробуйте позже.",
        variant: "destructive",
      });
      setCompatibleParts(null);
    }
  };

  const formatPrice = (price: number): string => {
    const exchangeRate = 500; // Курс доллара к тенге (пример)
    const priceInTenge = price * exchangeRate;
    return new Intl.NumberFormat('ru-KZ', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: 2,
    }).format(priceInTenge);
  };

  return (
    <div className="fade-in">
      {/* Banner Carousel */}
        <div>
            {banners.map((banner, index) => (
                <div key={index}>
                  <Card>
                    <CardHeader>
                      <CardTitle>{banner.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <img src={banner.imageUrl} alt={banner.title} className="rounded-md"/>
                      <Button asChild>
                        <Link href={banner.href}>{banner.buttonText}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                </div>
            ))}
        </div>

      {/* Compatibility Checker */}
      <section className="py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Найти детали для вашего автомобиля</h2>
          <form onSubmit={handleSubmit} className="flex flex-col md:flex-row items-center justify-center gap-4">
            <Input
              type="text"
              placeholder="Марка"
              value={make}
              onChange={(e) => setMake(e.target.value)}
              className="w-full md:w-48"
            />
            <Input
              type="text"
              placeholder="Модель"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full md:w-48"
            />
            <Button type="submit">Найти совместимые детали</Button>
          </form>

          {compatibleParts && compatibleParts.compatibleParts && (
            <div className="mt-8">
              <h3 className="text-2xl font-semibold mb-4">Совместимые детали</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
                {compatibleParts.compatibleParts.map((product: any) => (
                  <Autopart key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Популярные категории</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4">
            {categories.map((category) => (
              <Link href={category.href} key={category.name} className="flex flex-col items-center justify-center">
                <Card className="w-full p-4 product-card">
                  {React.createElement(category.icon, {className: "w-8 h-8 mb-2 text-primary"})}
                  <CardTitle className="text-sm font-semibold">{category.name}</CardTitle>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Hits of Sales */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Хиты продаж</h2>
          <div className="flex overflow-x-auto px-4">
            {popularProducts.map((product) => (
              <Autopart key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Новые поступления</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {newArrivals.map((product) => (
              <Autopart key={product.id} product={product}/>
            ))}
          </div>
        </div>
      </section>

      {/* Store Benefits */}
      <section className="py-12 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Почему выбирают нас?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="p-6 product-card">
                {React.createElement(benefit.icon, {className: "w-10 h-10 mb-4 text-primary"})}
                <CardTitle className="text-xl font-semibold mb-2">{benefit.title}</CardTitle>
                <CardDescription>{benefit.description}</CardDescription>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mini Blog */}
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Из нашего блога</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
            {blogPosts.map((post) => (
              <Card key={post.title} className="product-card">
                <img src={post.imageUrl} alt={post.title} className="rounded-md"/>
                <CardContent className="p-4">
                  <CardTitle className="text-xl font-semibold mb-2">{post.title}</CardTitle>
                  <Button asChild>
                    <Link href={post.href}>Читать далее</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
