"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { MobileNav } from "@/app/components/mobile-nav";
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge";
import { useEffect, useState, useCallback } from "react";
import { getCookie, deleteCookie } from 'cookies-next';
import type { User } from '@/types/user'; // Import User type

interface CartItem {
  id: string;
  quantity: number;
  // Add other necessary properties from AutoPart if needed for calculation
}

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: MainNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [cartItemCount, setCartItemCount] = useState(0);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // Function to update auth state from cookies and localStorage
  const updateAuthState = useCallback(() => {
    // Prioritize cookie for initial check, then fallback to localStorage
    const loggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');
    let loggedInLocalStorage = null;
    let userLocalStorage = null;

    if (typeof window !== 'undefined') {
      loggedInLocalStorage = localStorage.getItem('isLoggedIn');
      userLocalStorage = localStorage.getItem('loggedInUser');
    }

    const loggedIn = loggedInCookie === 'true' || loggedInLocalStorage === 'true';
    const userJson = userCookie || userLocalStorage;

    if (loggedIn && userJson) {
      try {
        const parsedUser = JSON.parse(userJson);
        // Basic validation
        if (parsedUser && parsedUser.id && parsedUser.username) {
          setIsLoggedIn(true);
          setLoggedInUser(parsedUser);
        } else {
            throw new Error("Invalid user data structure");
        }
      } catch (e) {
        console.error("Error parsing user data:", e);
        handleLogout(); // Log out if data is invalid
      }
    } else {
      // If either cookie or localStorage indicates logged out, ensure state is logged out
      if (isLoggedIn || loggedInUser) {
          handleLogout(); // Clean up if state is inconsistent
      } else {
          setIsLoggedIn(false);
          setLoggedInUser(null);
      }
    }
  }, [isLoggedIn, loggedInUser]); // Add dependencies

  // Function to update cart count from localStorage
  const updateCartCount = useCallback(() => {
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        try {
          const cartItems: CartItem[] = JSON.parse(storedCart);
          if (Array.isArray(cartItems)) {
            const totalCount = cartItems.reduce((total: number, item: CartItem) => total + (item.quantity || 0), 0);
            setCartItemCount(totalCount);
          } else {
             setCartItemCount(0);
          }
        } catch (e) {
          console.error("Error parsing cartItems from storage:", e);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    }
  }, []); // No dependencies needed as it reads directly

  // Effect to run on mount and listen for changes
   useEffect(() => {
        setIsMounted(true); // Indicate client-side mount is complete
        updateAuthState();
        updateCartCount();

        // Listener for direct storage changes (e.g., other tabs)
        window.addEventListener('storage', (event) => {
            if (event.key === 'cartItems') {
                updateCartCount();
            }
             if (event.key === 'isLoggedIn' || event.key === 'loggedInUser') {
                 updateAuthState();
            }
        });

        // Listener for custom event dispatched after login/logout actions
        window.addEventListener('authStateChanged', updateAuthState);
        // Listener for custom event dispatched after cart updates
        window.addEventListener('cartUpdated', updateCartCount);


        // Cleanup listeners on component unmount
        return () => {
            window.removeEventListener('storage', (event) => {
                if (event.key === 'cartItems') updateCartCount();
                if (event.key === 'isLoggedIn' || event.key === 'loggedInUser') updateAuthState();
            });
            window.removeEventListener('authStateChanged', updateAuthState);
            window.removeEventListener('cartUpdated', updateCartCount);
        };
    }, [updateAuthState, updateCartCount]); // Depend on the update functions


  const handleLogout = () => {
    // Clear cookies
    deleteCookie('authToken');
    deleteCookie('isLoggedIn');
    deleteCookie('loggedInUser');

    // Clear localStorage
    if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
        // Optionally clear cart on logout? Depends on requirements.
        // localStorage.removeItem('cartItems');
    }

    // Update local state
    setIsLoggedIn(false);
    setLoggedInUser(null);
    // setCartItemCount(0); // Reset cart count if clearing cart on logout

    // Dispatch custom event to notify other components immediately
     if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('authStateChanged'));
        // window.dispatchEvent(new Event('cartUpdated')); // if cart is cleared
     }

    router.push('/auth/login'); // Redirect to login
  };

   const navigateToCart = () => {
        // Cart is now accessible to everyone
        router.push('/cart');
   };

   // Avoid rendering auth-dependent parts on server / before mount
   if (!isMounted) {
       return (
           <div className={cn("flex h-16 w-full shrink-0 items-center px-6", className)} {...props}>
                {/* Placeholder or minimal nav */}
                <MobileNav className="mr-4" />
                <Link href="/" className="mr-6 flex items-center space-x-2">
                   <Icons.truck className="h-6 w-6" />
                   <span className="hidden font-bold sm:inline-block">Toyota</span>
                </Link>
                {/* Add skeleton loaders for other parts if needed */}
           </div>
       );
   }


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
          <Button size="sm" variant="ghost" className="relative" onClick={navigateToCart}>
              <Icons.shoppingCart className="h-4 w-4" />
              <span className="sr-only">Корзина</span>
              {/* Show cart count always, regardless of login status */}
              {cartItemCount > 0 && (
                <Badge className="absolute -right-2 -top-2 rounded-full px-1 py-0.5 text-xs" style={{ backgroundColor: '#8dc572' }}>
                  {cartItemCount}
                </Badge>
              )}
            </Button>

          {isLoggedIn && loggedInUser ? (
            <>
              {/* Display user info or avatar */}
                <Avatar className="h-8 w-8">
                   {/* Add user avatar image if available */}
                   {/* <AvatarImage src={loggedInUser.avatarUrl} alt={`${loggedInUser.firstName} ${loggedInUser.lastName}`} /> */}
                   <AvatarFallback>{loggedInUser.firstName?.[0]}{loggedInUser.lastName?.[0]}</AvatarFallback>
                 </Avatar>
              <span className="text-sm font-medium hidden sm:inline-block">{loggedInUser.firstName} {loggedInUser.lastName}</span>
              {loggedInUser.isAdmin && (
                <Link href="/admin" passHref>
                  <Button size="sm" variant="outline">
                    Админ панель
                  </Button>
                </Link>
              )}
              <Button size="sm" variant="ghost" onClick={handleLogout}>
                Выйти
              </Button>
            </>
          ) : (
            <Link href="/auth/login" passHref>
              <Button size="sm" variant="ghost">
                Войти
              </Button>
            </Link>
          )}
      </div>
    </div>
  )
}