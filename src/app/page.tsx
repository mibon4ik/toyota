
'use client';

import React, {useState, useEffect, useCallback} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icons} from "@/components/icons";
import {cn} from "@/lib/utils";
import Autopart from "@/app/components/autopart"; // Corrected import path
import Link from "next/link";
import { getPartsByVin, getPartsByMakeModel } from '@/services/autoparts'; // Import part search functions
import {Input} from "@/components/ui/input";
import {useToast} from "@/hooks/use-toast";
import type { AutoPart } from '@/types/autopart'; // Ensure correct path

const categories = [
  {
    name: 'Двигатель',
    icon: Icons.car, // Using Car icon for engine
    value: 'Двигатель', // Add a value field for the query param
    href: '/shop?category=Двигатель', // Use the value here
  },
  {
    name: 'Подвеска',
    icon: Icons.zap, // Keep Zap for suspension based on previous correction
    value: 'Подвеска',
    href: '/shop?category=Подвеска',
  },
  {
    name: 'Тормоза',
    icon: Icons.circle, // Using Circle for brakes based on previous correction
    value: 'Тормоза',
    href: '/shop?category=Тормоза',
  },
  {
    name: 'Электрика',
    icon: Icons.zap, // Keep Zap for electrical
    value: 'Электрика',
    href: '/shop?category=Электрика',
  },
  {
    name: 'Кузов',
    icon: Icons.box,
    value: 'Кузов',
    href: '/shop?category=Кузов',
  },
  {
    name: 'Аксессуары',
    icon: Icons.gift, // Use Gift icon for accessories
    value: 'Аксессуары',
    href: '/shop?category=Аксессуары',
  },
];

// Dummy data - replace with actual data fetching or use AI suggestions more prominently
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
    id: 'wpr-016',
    name: 'Щетки стеклоочистителя (комплект)',
    brand: 'Bosch',
    price: 12000,
    imageUrl: 'https://picsum.photos/seed/wpr016/300/200',
    description: 'Всесезонные щетки стеклоочистителя для чистого обзора.',
    category: 'Кузов',
    compatibleVehicles: ['Toyota Camry', 'Toyota Corolla', 'Toyota RAV4'],
    sku: 'BSH-ICON-SET',
    stock: 200,
    rating: 4.7,
    reviewCount: 180
  },
];

const newArrivals: AutoPart[] = [
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
  },
  {
    id: 'oil-003-dup', // Ensure unique ID if needed for keys
    name: 'Синтетическое моторное масло 5W-30',
    brand: 'Castrol',
    price: 18500,
    imageUrl: 'https://picsum.photos/seed/oil003dup/300/200',
    description: 'Полностью синтетическое масло для универсальной защиты.',
    category: 'Двигатель',
    compatibleVehicles: ['Большинство моделей'],
    sku: 'CAS-EDGE-5W30',
    stock: 95,
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
  },
   {
    id: 'flt-008',
    name: 'Салонный фильтр (угольный)',
    brand: 'Bosch',
    price: 11250,
    imageUrl: 'https://picsum.photos/seed/flt008/300/200',
    description: 'Угольный салонный фильтр для очистки воздуха от пыли и запахов.',
    category: 'Фильтры',
    compatibleVehicles: ['Toyota Corolla 2015+', 'Toyota C-HR 2018+'],
    sku: 'BSH-6055C',
    stock: 120,
  }
];

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

const blogPosts = [
  {
    title: 'Важность регулярной замены масла',
    imageUrl: 'https://picsum.photos/seed/oilchange/600/400', // Placeholder
    href: '/blog/oil-changes',
  },
  {
    title: 'Выбор правильных тормозных колодок для вашего автомобиля',
    imageUrl: 'https://picsum.photos/seed/brakepads/600/400', // Placeholder
    href: '/blog/brake-pads',
  },
];

const banners = [
  {
    title: 'Летняя распродажа - скидки до 50%',
    imageUrl: 'https://picsum.photos/seed/summersale/1200/400', // Placeholder
    buttonText: 'Купить сейчас',
    href: '/shop?sale=true',
  },
  {
    title: 'Новые поступления - ознакомьтесь с последними деталями',
     imageUrl: 'https://picsum.photos/seed/newarrivals/1200/400', // Placeholder
    buttonText: 'Посмотреть новинки',
    href: '/shop?sort=newest',
  },
];

// Type for the state holding the suggested parts
type CompatiblePartsResult = AutoPart[] | null;

interface CartItem extends AutoPart {
  quantity: number;
}

const HomePage = () => {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [vinCode, setVinCode] = useState('');
  const [compatibleParts, setCompatibleParts] = useState<CompatiblePartsResult>(null);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false); // Loading state for suggestions
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    setIsMounted(true);
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      try {
        const parsedCart: CartItem[] = JSON.parse(storedCart);
        if (Array.isArray(parsedCart)) {
          setCartItems(parsedCart);
        }
      } catch (e) {
        console.error("Error parsing cart from localStorage:", e);
        localStorage.removeItem('cartItems');
      }
    }
  }, []);

  // Persist cart changes to localStorage
  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cartItems', JSON.stringify(cartItems));
      window.dispatchEvent(new CustomEvent('cartUpdated')); // Notify navbar
    }
  }, [cartItems, isMounted]);

  const handleAddToCart = useCallback((product: AutoPart) => {
    if (!isMounted) return;

    setCartItems(currentItems => {
      const existingItemIndex = currentItems.findIndex(item => item.id === product.id);
      let updatedCart;

      if (existingItemIndex > -1) {
        updatedCart = currentItems.map((item, index) =>
          index === existingItemIndex ? { ...item, quantity: (item.quantity || 1) + 1 } : item
        );
        toast({ title: "Количество обновлено!", description: `Количество ${product.name} в корзине увеличено.` });
      } else {
        updatedCart = [...currentItems, { ...product, quantity: 1 }];
        toast({ title: "Товар добавлен в корзину!", description: `${product.name} был добавлен в вашу корзину.` });
      }
      return updatedCart;
    });
  }, [toast, isMounted, setCartItems]);


  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoadingSuggestions(true); // Start loading
    setCompatibleParts(null); // Clear previous results

    let partsResult: AutoPart[] = [];
    let searchPerformed = false;

    // 1. Try searching by VIN if provided and valid
    if (vinCode && vinCode.length === 17 && /^[A-HJ-NPR-Z0-9]{17}$/i.test(vinCode)) {
      try {
        console.log(`Searching parts by VIN: ${vinCode}`);
        partsResult = await getPartsByVin(vinCode.toUpperCase());
        searchPerformed = true;
        console.log(`Found ${partsResult.length} parts by VIN.`);
      } catch (error) {
        console.error("Error fetching parts by VIN:", error);
        // Don't show toast yet, might fallback to make/model
      }
    } else if (vinCode) {
       // Invalid VIN format
       toast({
         title: "Ошибка",
         description: "VIN-код должен состоять из 17 латинских букв (кроме I, O, Q) и цифр.",
         variant: "destructive",
       });
       setIsLoadingSuggestions(false);
       return;
    }

    // 2. If VIN search didn't run or returned no results, AND make/model are provided, try searching by make/model
    if ((!searchPerformed || partsResult.length === 0) && make && model) {
        if (!searchPerformed) console.log("VIN not provided or invalid, searching by Make/Model...");
        else console.log("No parts found by VIN, falling back to Make/Model search...");
      try {
        console.log(`Searching parts by Make: ${make}, Model: ${model}`);
        partsResult = await getPartsByMakeModel(make, model);
        searchPerformed = true;
        console.log(`Found ${partsResult.length} parts by Make/Model.`);
      } catch (error) {
        console.error("Error fetching parts by Make/Model:", error);
        toast({
          title: "Ошибка",
          description: "Не удалось получить совместимые детали. Пожалуйста, попробуйте позже.",
          variant: "destructive",
        });
        setCompatibleParts(null);
        setIsLoadingSuggestions(false);
        return; // Stop if make/model search also fails
      }
    }

    // 3. Handle results or lack thereof
    if (!searchPerformed) {
      // If neither VIN nor Make/Model were valid/provided
      toast({
        title: "Ошибка",
        description: "Пожалуйста, введите Марку и Модель или корректный VIN-код.",
        variant: "destructive",
      });
    } else if (partsResult.length === 0) {
        toast({
            title: "Детали не найдены",
            description: "Не удалось найти совместимые детали для вашего запроса.",
        });
        setCompatibleParts([]); // Set to empty array to show message
    } else {
        setCompatibleParts(partsResult);
    }

    setIsLoadingSuggestions(false); // Stop loading
  };

   const formatPrice = useCallback((price: number): string => {
      return new Intl.NumberFormat('ru-KZ', {
        style: 'currency',
        currency: 'KZT',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(price);
    }, []);


  return (
    <div className="fade-in space-y-12"> {/* Added space-y for vertical spacing */}
      {/* Banner Carousel */}
        <div className="space-y-4">
            {banners.map((banner, index) => (
                <Card key={index} className="overflow-hidden">
                    <CardHeader className="p-4">
                      <CardTitle className="text-xl">{banner.title}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col items-start p-4 pt-0">
                      <img
                        src={banner.imageUrl}
                        alt={banner.title}
                        className="rounded-md w-full h-48 object-cover mb-4"
                         onError={(e) => (e.currentTarget.src = 'https://picsum.photos/1200/400')}
                         />
                      <Button asChild className="bg-[#535353ff] hover:bg-[#535353ff]/90 mt-4">
                        <Link href={banner.href ?? '#'}>{banner.buttonText}</Link>
                      </Button>
                    </CardContent>
                  </Card>
            ))}
        </div>

      {/* Compatibility Checker */}
      <section className="py-12 bg-card border rounded-lg p-6">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl font-bold mb-6">Найти детали для вашего автомобиля</h2>
           {/* Updated Form Structure */}
           <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-4">
             <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Input
                    type="text"
                    placeholder="Марка"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="w-full sm:w-auto flex-1"
                    disabled={isLoadingSuggestions}
                />
                <Input
                    type="text"
                    placeholder="Модель"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="w-full sm:w-auto flex-1"
                     disabled={isLoadingSuggestions}
                />
             </div>
              <div className="flex items-center justify-center gap-2">
                 <div className="flex-grow border-t border-muted"></div>
                 <span className="text-muted-foreground text-sm">или</span>
                 <div className="flex-grow border-t border-muted"></div>
              </div>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Input
                    type="text"
                    placeholder="VIN-код (17 символов)"
                    value={vinCode}
                    onChange={(e) => setVinCode(e.target.value.toUpperCase())}
                    className="w-full font-mono tracking-widest uppercase"
                    maxLength={17}
                    pattern="[A-HJ-NPR-Z0-9]{17}"
                    title="VIN должен состоять из 17 латинских букв (кроме I, O, Q) и цифр."
                    disabled={isLoadingSuggestions}
                />
              </div>
               <Button type="submit" className="w-full sm:w-auto" disabled={isLoadingSuggestions}>
                 {isLoadingSuggestions ? <Icons.loader className="mr-2 h-4 w-4 animate-spin" /> : null}
                 {isLoadingSuggestions ? 'Поиск...' : 'Найти детали'}
               </Button>
          </form>

          {/* Display Suggested Parts */}
           {isLoadingSuggestions && (
                <div className="mt-8 text-center text-muted-foreground">
                   <Icons.loader className="mx-auto h-6 w-6 animate-spin mb-2" />
                   Ищем подходящие детали...
                </div>
            )}
           {!isLoadingSuggestions && compatibleParts && (
            <div className="mt-8">
              <h3 className="text-xl font-semibold mb-4">Предложенные детали:</h3>
              {compatibleParts.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                    {compatibleParts.map((product) => (
                    <Autopart key={product.id} product={product} onAddToCart={handleAddToCart} />
                    ))}
                 </div>
               ) : (
                 <p className="text-muted-foreground mt-4">Совместимые детали не найдены для вашего запроса.</p>
               )}
            </div>
          )}
        </div>
       </section>

      {/* Popular Categories */}
      <section className="py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Популярные категории</h2>
           <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon || Icons.box; // Default to Box icon if none provided
               return (
                 // Use the correct href from the category object
                 <Link key={category.value} href={category.href ?? `/shop?category=${category.value}`} passHref legacyBehavior={false} className="block">
                     <Card className="w-full p-4 product-card text-center hover:shadow-md transition-shadow h-full flex flex-col justify-center items-center">
                        {/* Use createElement to render the icon component */}
                         {IconComponent && React.createElement(IconComponent, { className: "w-8 h-8 mb-2", style: { color: '#535353ff' } })}
                        <CardTitle className="text-sm font-medium">{category.name}</CardTitle>
                     </Card>
                 </Link>
               );
            })}
          </div>
        </div>
      </section>

      {/* Hits of Sales */}
      <section className="py-12 bg-secondary rounded-lg">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Хиты продаж</h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {popularProducts.map((product) => (
              <Autopart key={product.id} product={product} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </div>
      </section>

      {/* New Arrivals */}
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Новые поступления</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {newArrivals.map((product) => (
              <Autopart key={product.id} product={product} onAddToCart={handleAddToCart}/>
            ))}
          </div>
            <div className="text-center mt-8">
                <Button variant="outline" asChild>
                    <Link href="/shop?sort=newest">Смотреть все новинки</Link>
                </Button>
            </div>
        </div>
      </section>

      {/* Store Benefits */}
      <section className="py-12 bg-secondary rounded-lg">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Почему выбирают нас?</h2>
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {benefits.map((benefit) => {
              const IconComponent = benefit.icon;
              return (
                <Card key={benefit.title} className="p-6 text-center">
                  {IconComponent && <IconComponent className="w-10 h-10 mb-4 mx-auto text-[#535353ff]" />}
                  <CardTitle className="text-lg font-semibold mb-2">{benefit.title}</CardTitle>
                  <CardDescription>{benefit.description}</CardDescription>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mini Blog */}
      <section className="py-12">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold mb-8 text-center">Из нашего блога</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.title} className="overflow-hidden group">
                 <Link href={post.href ?? '#'} passHref legacyBehavior={false} className="block">
                        <img
                            src={post.imageUrl}
                            alt={post.title}
                            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                             onError={(e) => (e.currentTarget.src = 'https://picsum.photos/600/400')}
                            />
                        <CardContent className="p-4">
                             <CardTitle className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors">{post.title}</CardTitle>
                             <p className="text-sm text-muted-foreground mb-3">Узнайте больше о...</p>
                             <Button variant="link" className="p-0 h-auto text-primary">Читать далее →</Button>
                        </CardContent>
                 </Link>
              </Card>
            ))}
          </div>
        </div>
       </section>
     </div>
    );
  };

  export default HomePage;

