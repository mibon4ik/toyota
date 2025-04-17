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

const categories = [
  {
    name: 'Engine',
    icon: Icons.engine,
    value: 'engine',
  },
  {
    name: 'Suspension',
    icon: Icons.suspension,
    value: 'suspension',
  },
  {
    name: 'Brakes',
    icon: Icons.brakes,
    value: 'brakes',
  },
  {
    name: 'Electrical',
    icon: Icons.electrical,
    value: 'electrical',
  },
  {
    name: 'Body',
    icon: Icons.body,
    value: 'body',
  },
  {
    name: 'Accessories',
    icon: Icons.accessories,
    value: 'accessories',
  },
];

const ShopPage = () => {
  const [products, setProducts] = useState<AutoPart[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      const products = await getAutoPartsByCategory(selectedCategory || 'all');
      setProducts(products);
    };

    fetchProducts();
  }, [selectedCategory]);

  const handleCategoryClick = (category: string | null) => {
    setSelectedCategory(category);
  };

  return (
    <SidebarProvider>
      <Sidebar inset="sm" collapsible="icon">
        <SidebarHeader>
          <SidebarInput placeholder="Search parts..." />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton onClick={() => handleCategoryClick(null)}>
                All Categories
              </SidebarMenuButton>
            </SidebarMenuItem>
            {categories.map((category) => (
              <SidebarMenuItem key={category.value}>
                <SidebarMenuButton onClick={() => handleCategoryClick(category.value)}>
                  {category.name}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>Filter by Price</AccordionTrigger>
              <AccordionContent>
                {/* Add price range slider here */}
                <p>Price range slider will be added here.</p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Filter by Brand</AccordionTrigger>
              <AccordionContent>
                {/* Add brand selection here */}
                <p>Brand selection will be added here.</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </SidebarContent>
      </Sidebar>
      <SidebarInset>
        <div className="container mx-auto py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            {selectedCategory ? `Auto Parts - ${selectedCategory}` : 'Auto Parts Catalog'}
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
