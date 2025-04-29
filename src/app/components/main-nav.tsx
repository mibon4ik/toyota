"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { getCookie, deleteCookie } from 'cookies-next';

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    // Check login status from cookies
    const loggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');

    if (loggedInCookie === 'true' && userCookie) {
        setIsLoggedIn(true);
        try {
            setLoggedInUser(JSON.parse(userCookie));
        } catch (e) {
            console.error("Error parsing loggedInUser cookie:", e);
            // Handle invalid cookie data, e.g., by logging out
            handleLogout();
        }
    } else {
        setIsLoggedIn(false);
        setLoggedInUser(null);
    }

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
  }, []);

  useEffect(() => {
    // Listen for storage events to update cart count across tabs/windows
    const handleStorageChange = () => {
        const storedCart = localStorage.getItem('cartItems');
        if (storedCart) {
            try {
                const cartItems = JSON.parse(storedCart);
                const totalCount = cartItems.reduce((total: number, item: any) => total + item.quantity, 0);
                setCartItemCount(totalCount);
            } catch (e) {
                console.error("Error parsing cartItems from storage:", e);
                setCartItemCount(0);
            }
        } else {
            setCartItemCount(0);
        }
    };

    window.addEventListener('storage', handleStorageChange);

    // Initial cart count check in case localStorage updated before listener attached
    handleStorageChange();

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
}, []);


  const handleLogout = () => {
    deleteCookie('isLoggedIn');
    deleteCookie('loggedInUser');
    localStorage.removeItem('isLoggedIn'); // Also clear localStorage if used
    localStorage.removeItem('loggedInUser'); // Also clear localStorage if used
    localStorage.removeItem('cartItems'); // Clear cart on logout
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setCartItemCount(0); // Reset cart count on logout
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
        {/* Search button removed */}
        <Button size="sm" variant="ghost" className="relative" onClick={navigateToCart}>
            <Icons.shoppingCart className="h-4 w-4" />
            <span className="sr-only">Cart</span>
            {cartItemCount > 0 && (
              <Badge className="absolute -right-2 -top-2 rounded-full px-1 py-0.5 text-xs" style={{ backgroundColor: '#8dc572' }}>
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
