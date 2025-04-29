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
import { MobileNav } from "@/app/components/mobile-nav"; // Corrected import path
import type { User } from "@/types/user"; // Import User type

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);

  // Function to update auth state from cookies
   const updateAuthState = () => {
    const loggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');

    if (loggedInCookie === 'true' && userCookie) {
      setIsLoggedIn(true);
      try {
        const parsedUser = JSON.parse(userCookie);
        setLoggedInUser(parsedUser);
      } catch (e) {
        console.error("Error parsing loggedInUser cookie:", e);
        handleLogout(); // Log out if cookie is invalid
      }
    } else {
      setIsLoggedIn(false);
      setLoggedInUser(null);
    }
  };


  // Function to update cart count from localStorage
  const updateCartCount = () => {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
          try {
              const cartItems = JSON.parse(storedCart);
              const totalCount = cartItems.reduce((total: number, item: any) => total + (item.quantity || 0), 0);
              setCartItemCount(totalCount);
          } catch (e) {
              console.error("Error parsing cartItems from storage:", e);
              setCartItemCount(0);
          }
      } else {
          setCartItemCount(0);
      }
  };


  // Initial check on component mount
    useEffect(() => {
        updateAuthState();
        updateCartCount(); // Also update cart count initially

        // Listen for storage events (for cart updates in other tabs)
        window.addEventListener('storage', updateCartCount);
        // Listen for custom event when auth state might change (e.g., after login/logout)
        window.addEventListener('authStateChanged', updateAuthState);

        return () => {
            window.removeEventListener('storage', updateCartCount);
            window.removeEventListener('authStateChanged', updateAuthState);
        };
    }, []); // Empty dependency array ensures this runs only once on mount


  const handleLogout = () => {
    deleteCookie('authToken');
    deleteCookie('isLoggedIn');
    deleteCookie('loggedInUser');
    localStorage.removeItem('cartItems'); // Clear cart on logout
    setIsLoggedIn(false);
    setLoggedInUser(null);
    setCartItemCount(0); // Reset cart count
     // Dispatch custom event to notify other components (like this one in other tabs)
    window.dispatchEvent(new Event('authStateChanged'));
    router.push('/auth/login');
  };

   const navigateToCart = () => {
        if (isLoggedIn) {
            router.push('/cart');
        } else {
            router.push('/auth/login'); // Redirect to login if not logged in
        }
    };

  return (
    <div className={cn("flex h-16 w-full shrink-0 items-center px-6", className)} {...props}>
       <MobileNav className="mr-4" /> {/* Add MobileNav */}
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.truck className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">Toyota</span>
      </Link>
      <nav className="hidden md:flex space-x-4 flex-grow"> {/* Use flex-grow to push items to the right */}
        <Link href="/shop" className={cn(
          "text-sm font-medium transition-colors hover:text-foreground",
          pathname === "/shop" ? "text-foreground" : "text-muted-foreground"
        )}>
          Магазин
        </Link>
         <Link href="/cart" className={cn(
            "text-sm font-medium transition-colors hover:text-foreground",
            pathname === "/cart" ? "text-foreground" : "text-muted-foreground"
          )} onClick={(e) => {
              if (!isLoggedIn) {
                  e.preventDefault(); // Prevent navigation
                  router.push('/auth/login'); // Redirect if not logged in
              }
          }}>
            Корзина
          </Link>
          <Link href="/checkout" className={cn(
            "text-sm font-medium transition-colors hover:text-foreground",
            pathname === "/checkout" ? "text-foreground" : "text-muted-foreground"
          )} onClick={(e) => {
               if (!isLoggedIn) {
                  e.preventDefault();
                  router.push('/auth/login');
              }
          }}>
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
          <Button size="sm" variant="ghost" className="relative" onClick={navigateToCart}>
              <Icons.shoppingCart className="h-4 w-4" />
              <span className="sr-only">Cart</span>
              {isLoggedIn && cartItemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 rounded-full px-1 py-0.5 text-xs" style={{ backgroundColor: '#8dc572' }}>
                  {cartItemCount}
                </Badge>
              )}
            </Button>

          {isLoggedIn && loggedInUser ? (
            <>
              <span className="text-sm font-medium">{loggedInUser.firstName} {loggedInUser.lastName}</span>
              {loggedInUser.isAdmin && (
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
