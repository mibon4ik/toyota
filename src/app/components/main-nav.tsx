"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Load cart items from local storage on component mount
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      const cartItems = JSON.parse(storedCart);
      // Calculate total quantity of items in the cart
      const totalCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
      setCartItemCount(totalCount);
    } else {
      setCartItemCount(0);
    }

    // Check login status from local storage
    const storedLogin = localStorage.getItem('isLoggedIn');
    setIsLoggedIn(storedLogin === 'true');

    // Load logged-in user data from localStorage
    const storedUser = localStorage.getItem('loggedInUser');
    if (storedUser) {
      setLoggedInUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    const storedCart = localStorage.getItem('cartItems');
    if (storedCart) {
      const cartItems = JSON.parse(storedCart);
      // Calculate total quantity of items in the cart
      const totalCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
      setCartItemCount(totalCount);
    } else {
      setCartItemCount(0);
    }
  }, [cartItemCount]);

  const handleLogout = () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('loggedInUser');
    setIsLoggedIn(false);
    setLoggedInUser(null);
    router.push('/auth/login');
  };

  const navigateToCart = () => {
    router.push('/cart');
  };

  return (
    <div className={cn("flex h-16 w-full shrink-0 items-center px-6", className)} {...props}>
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.truck className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          Toyota
        </span>
      </Link>
      <nav className="hidden md:flex space-x-4">
        <Link href="/" className={cn(
          "text-sm font-medium transition-colors hover:text-foreground",
          pathname === "/" ? "text-foreground" : "text-muted-foreground"
        )}>
          Главная
        </Link>
        <Link href="/shop" className={cn(
          "text-sm font-medium transition-colors hover:text-foreground",
          pathname === "/shop" ? "text-foreground" : "text-muted-foreground"
        )}>
          Магазин
        </Link>
        <Link href="/cart" className={cn(
          "text-sm font-medium transition-colors hover:text-foreground",
          pathname === "/cart" ? "text-foreground" : "text-muted-foreground"
        )}>
          Корзина
        </Link>
        <Link href="/checkout" className={cn(
          "text-sm font-medium transition-colors hover:text-foreground",
          pathname === "/checkout" ? "text-foreground" : "text-muted-foreground"
        )}>
          Оформление
        </Link>
          <Link href="/contacts" className={cn(
              "text-sm font-medium transition-colors hover:text-foreground",
              pathname === "/contacts" ? "text-foreground" : "text-muted-foreground"
          )}>
            Контакты
          </Link>
      </nav>
      <div className="ml-auto flex items-center space-x-4">
        <Button size="sm" variant="ghost">
          <Icons.search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
        
          <Button size="sm" variant="ghost" className="relative" onClick={navigateToCart}>
            <Icons.shoppingCart className="h-4 w-4" />
            <span className="sr-only">Cart</span>
            {cartItemCount > 0 && (
              <Badge className="absolute -right-2 -top-2 rounded-full px-1 py-0.5 text-xs">
                {cartItemCount}
              </Badge>
            )}
          </Button>
        
        {isLoggedIn ? (
          <>
            <span>{loggedInUser?.firstName} {loggedInUser?.lastName}</span>
            {loggedInUser?.email === 'admin@admin.com' && (
              <Link href="/admin">
                <Button size="sm" variant="ghost">
                  Админ панель
                </Button>
              </Link>
            )}
            <Button size="sm" variant="ghost" onClick={handleLogout}>
              Выйти
            </Button>
          </>
        ) : (
          <Link href="/auth/login">
            <Button size="sm" variant="ghost">
              Войти
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}




