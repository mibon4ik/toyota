'use client';

import React, {useState, useEffect} from 'react';
import {AutoPart, getAutoPartsByCategory} from "@/services/autoparts";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icons} from "@/components/icons";
import {Input} from "@/components/ui/input";
import {cn} from "@/lib/utils";
import Autopart from "@/components/autopart";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import Link from "next/link";
import {useRouter, useSearchParams} from "next/navigation";

const categories = [
  {
    name: 'Двигатель',
    icon: Icons.engine,
    value: 'engine',
  },
  {
    name: 'Подвеска',
    icon: Icons.suspension,
    value: 'suspension',
  },
  {
    name: 'Тормоза',
    icon: Icons.brakes,
    value: 'brakes',
  },
  {
    name: 'Электрика',
    icon: Icons.electrical,
    value: 'electrical',
  },
  {
    name: 'Кузов',
    icon: Icons.body,
    value: 'body',
  },
  {
    name: 'Аксессуары',
    icon: Icons.accessories,
    value: 'accessories',
  },
];

const ShopPage = () => {
  const [products, setProducts] = useState<AutoPart[]>([]);
  const searchParams = useSearchParams();
  const category = searchParams.get('category');
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getAutoPartsByCategory(category || 'all');
      setProducts(products);
    };

    fetchProducts();
  }, [category]);

  const handleCategoryClick = (category: string | null) => {
    const newParams = new URLSearchParams(searchParams.toString());
    if (category) {
      newParams.set('category', category);
    } else {
      newParams.delete('category');
    }
    router.push(`/shop?${newParams.toString()}`);
  };

  return (
    <SidebarProvider>
      <Sidebar inset="sm" collapsible="icon">
        <SidebarHeader>
          <SidebarInput placeholder="Поиск запчастей..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => handleCategoryClick(null)}>
                Все категории
              </SidebarMenuButton>
            </SidebarMenuItem>
            {categories.map((categoryItem) => (
              <SidebarMenuItem key={categoryItem.value}>
                <SidebarMenuButton onClick={() => handleCategoryClick(categoryItem.value)}>
                  {categoryItem.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Фильтр по цене</AccordionTrigger>
              <AccordionContent>
                {/* Add price range slider here */}
                <p>Здесь будет добавлен слайдер диапазона цен.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Фильтр по бренду</AccordionTrigger>
              <AccordionContent>
                {/* Add brand selection here */}
                <p>Здесь будет добавлен выбор бренда.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            {category ? `Автозапчасти - ${category}` : 'Каталог автозапчастей'}
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 px-4">
            {products.map((product) => (
              <Autopart key={product.id} product={product} />
            ))}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default ShopPage;
