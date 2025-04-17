'use client';

import React from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from "@/components/ui/card";
import {Button} from "@/components/ui/button";
import {Icons} from "@/components/icons";
import {cn} from "@/lib/utils";
import {Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "@/components/ui/carousel";
import Autopart from "@/components/autopart";
import {Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import {Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar} from "@/components/ui/sidebar";
import Link from "next/link";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger} from "@/components/ui/dropdown-menu";
import {Accordion, AccordionContent, AccordionItem, AccordionTrigger} from "@/components/ui/accordion";

const categories = [
  {
    name: 'Engine',
    icon: Icons.engine,
    href: '/category/engine',
  },
  {
    name: 'Suspension',
    icon: Icons.suspension,
    href: '/category/suspension',
  },
  {
    name: 'Brakes',
    icon: Icons.brakes,
    href: '/category/brakes',
  },
  {
    name: 'Electrical',
    icon: Icons.electrical,
    href: '/category/electrical',
  },
  {
    name: 'Body',
    icon: Icons.body,
    href: '/category/body',
  },
  {
    name: 'Accessories',
    icon: Icons.accessories,
    href: '/category/accessories',
  },
];

const popularProducts = [
  {
    id: 'pp1',
    name: 'High-Performance Air Filter',
    brand: 'K&N',
    price: 39.99,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Improve your engine\'s performance with this high-flow air filter.',
    category: 'Filters',
    compatibleVehicles: ['All vehicles'],
  },
  {
    id: 'pp2',
    name: 'Ceramic Brake Pads',
    brand: 'Akebono',
    price: 65.00,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Enjoy quiet and smooth braking with these ceramic brake pads.',
    category: 'Brakes',
    compatibleVehicles: ['Sedans', 'SUVs'],
  },
];

const newArrivals = [
  {
    id: 'na1',
    name: 'LED Headlight Bulbs',
    brand: 'Philips',
    price: 45.50,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Upgrade your headlights with these bright and energy-efficient LED bulbs.',
    category: 'Electrical',
    compatibleVehicles: ['Cars', 'Trucks'],
  },
  {
    id: 'na2',
    name: 'All-Weather Floor Mats',
    brand: 'WeatherTech',
    price: 120.00,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Protect your vehicle\'s interior with these durable floor mats.',
    category: 'Accessories',
    compatibleVehicles: ['All vehicles'],
  },
  {
    id: 'na3',
    name: 'Synthetic Motor Oil',
    brand: 'Mobil 1',
    price: 29.99,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Keep your engine running smoothly with this synthetic motor oil.',
    category: 'Engine',
    compatibleVehicles: ['Cars'],
  },
  {
    id: 'na4',
    name: 'Shock Absorbers',
    brand: 'Bilstein',
    price: 89.00,
    imageUrl: 'https://picsum.photos/200/150',
    description: 'Improve your vehicle\'s handling with these high-quality shock absorbers.',
    category: 'Suspension',
    compatibleVehicles: ['SUVs', 'Trucks'],
  },
];

const benefits = [
  {
    title: 'Free Shipping',
    description: 'Enjoy free shipping on orders over $99.',
    icon: Icons.truck,
  },
  {
    title: 'Quality Guarantee',
    description: 'We offer only high-quality auto parts.',
    icon: Icons.check,
  },
  {
    title: '24/7 Support',
    description: 'Our support team is available 24/7 to assist you.',
    icon: Icons.help,
  },
];

const blogPosts = [
  {
    title: 'The Importance of Regular Oil Changes',
    imageUrl: 'https://picsum.photos/400/200',
    href: '/blog/oil-changes',
  },
  {
    title: 'Choosing the Right Brake Pads for Your Vehicle',
    imageUrl: 'https://picsum.photos/400/200',
    href: '/blog/brake-pads',
  },
];

const banners = [
  {
    title: 'Summer Sale - Up to 50% Off',
    imageUrl: 'https://picsum.photos/800/300',
    buttonText: 'Shop Now',
    href: '/sale',
  },
  {
    title: 'New Arrivals - Check Out the Latest Parts',
    imageUrl: 'https://picsum.photos/800/300',
    buttonText: 'View New Arrivals',
    href: '/new-arrivals',
  },
];

const HomePage = () => {
  return (
    <div className="fade-in">
      {/* Banner Carousel */}
      <Carousel className="w-full">
        <CarouselContent>
          {banners.map((banner, index) => (
            <CarouselItem key={index} className="md:basis-1/2 lg:basis-1/3">
              <div className="p-4">
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
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Popular Categories */}
      <section className="py-12">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-8">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6 px-4">
            {categories.map((category) => (
              <Link href={category.href} key={category.name} className="flex flex-col items-center justify-center">
                <Card className="w-full p-4 product-card">
                  <Icons.truck className="w-8 h-8 mb-2 text-primary"/>
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
          <h2 className="text-3xl font-bold mb-8 text-center">Hits of Sales</h2>
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
          <h2 className="text-3xl font-bold mb-8 text-center">New Arrivals</h2>
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
          <h2 className="text-3xl font-bold mb-8 text-center">Why Choose Us?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
            {benefits.map((benefit) => (
              <Card key={benefit.title} className="p-6 product-card">
                <Icons.truck className="w-10 h-10 mb-4 text-primary"/>
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
          <h2 className="text-3xl font-bold mb-8 text-center">From Our Blog</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
            {blogPosts.map((post) => (
              <Card key={post.title} className="product-card">
                <img src={post.imageUrl} alt={post.title} className="rounded-md"/>
                <CardContent className="p-4">
                  <CardTitle className="text-xl font-semibold mb-2">{post.title}</CardTitle>
                  <Button asChild>
                    <Link href={post.href}>Read More</Link>
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
