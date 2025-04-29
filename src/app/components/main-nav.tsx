"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { MobileNav } from "@/components/ui/mobile-nav" // Corrected import path
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
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Default to false initially
  const [loggedInUser, setLoggedInUser] = useState<User | null>(null); // Default to null
  const [isMounted, setIsMounted] = useState(false); // Track client-side mount

  // Function to update cart count from localStorage
  const updateCartCount = useCallback(() => {
    // console.log("MainNav: Updating cart count..."); // Less verbose logging
    if (typeof window !== 'undefined') {
      const storedCart = localStorage.getItem('cartItems');
      if (storedCart) {
        try {
          const cartItems: CartItem[] = JSON.parse(storedCart);
          if (Array.isArray(cartItems)) {
            const totalCount = cartItems.reduce((total: number, item: CartItem) => total + (item.quantity || 0), 0);
            setCartItemCount(current => {
              // if (current !== totalCount) console.log(`MainNav: Cart count updated to ${totalCount}`);
              return totalCount;
            });
          } else {
             setCartItemCount(0);
          }
        } catch (e) {
          console.error("MainNav: Error parsing cartItems from storage:", e);
          setCartItemCount(0);
        }
      } else {
        setCartItemCount(0);
      }
    }
  }, []); // No state dependencies needed as it reads directly

  const handleLogout = useCallback(() => {
    console.log("MainNav: Logout initiated.");
    // Clear cookies first - specify path for robustness
    deleteCookie('authToken', { path: '/' });
    deleteCookie('isLoggedIn', { path: '/' });
    deleteCookie('loggedInUser', { path: '/' });
    console.log("MainNav: Cookies cleared.");

    // Clear localStorage
    if (typeof window !== 'undefined') {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('loggedInUser');
        console.log("MainNav: localStorage cleared.");
        // Optionally clear cart on logout? Depends on requirements.
        // localStorage.removeItem('cartItems');

        // Update local state *before* dispatching event
        setIsLoggedIn(false);
        setLoggedInUser(null);
        // setCartItemCount(0); // Reset cart count if clearing cart on logout

        // Dispatch event AFTER clearing storage and setting state
        console.log("MainNav: Dispatching authStateChanged event...");
        // Use setTimeout to ensure state updates might have rendered
        window.dispatchEvent(new Event('authStateChanged'));
        console.log("MainNav: authStateChanged event dispatched.");

    } else {
         // If window is not defined (unexpected case for logout), still update state
         console.warn("MainNav: window object not available during logout.");
         setIsLoggedIn(false);
         setLoggedInUser(null);
    }


    // Redirect after clearing state and potentially notifying
    console.log("MainNav: Redirecting to login after logout.");
    router.push('/auth/login'); // Redirect to login
  }, [router]); // Only router dependency

  // Function to update auth state from cookies and localStorage
  const updateAuthState = useCallback(() => {
     // console.log("MainNav: Updating auth state..."); // Less verbose logging
     if (typeof window === 'undefined') {
         console.log("MainNav: Skipping auth state update on server.");
         return; // Ensure this only runs client-side
     }

     // --- Cookie Check (Primary) ---
    const loggedInCookie = getCookie('isLoggedIn');
    const userCookie = getCookie('loggedInUser');
    const authTokenCookie = getCookie('authToken'); // Check auth token as well

    // --- localStorage Check (Secondary/Sync) ---
    // Primarily used for cross-tab sync or initial hydration if cookies missing
    let loggedInLocalStorage = localStorage.getItem('isLoggedIn');
    let userLocalStorage = localStorage.getItem('loggedInUser');

    let derivedIsLoggedIn = false;
    let derivedUser: User | null = null;

    // Check cookies first
    if (authTokenCookie && loggedInCookie === 'true' && userCookie) {
        // console.log("MainNav: Valid auth cookies found.");
        try {
            derivedUser = JSON.parse(userCookie);
            // Basic validation
            if (derivedUser && derivedUser.id && derivedUser.username) {
                derivedIsLoggedIn = true;
                // console.log("MainNav: User logged in (from cookie):", derivedUser.username, "Admin:", derivedUser.isAdmin);
            } else {
                 console.warn("MainNav: Invalid user data structure in cookie storage.");
                 derivedUser = null; // Treat invalid data as logged out
                 derivedIsLoggedIn = false;
            }
        } catch (e) {
            console.error("MainNav: Error parsing user cookie:", e);
            derivedUser = null; // Treat parse error as logged out
            derivedIsLoggedIn = false;
        }
    } else {
        // console.log("MainNav: Auth cookies incomplete or missing.");
        // Optional: Fallback to localStorage ONLY IF necessary and cookies are missing
        // This might be less reliable if middleware depends solely on cookies.
        // if (loggedInLocalStorage === 'true' && userLocalStorage) {
        //     console.log("MainNav: Attempting fallback to localStorage for auth state.");
        //     // ... (localStorage parsing logic as before) ...
        // }
    }

    // If checks fail, ensure state is logged out
    if (!derivedIsLoggedIn) {
        derivedUser = null;
        // Optionally clear potentially inconsistent storage if needed, but be careful
        // deleteCookie('authToken', { path: '/' });
        // deleteCookie('isLoggedIn', { path: '/' });
        // deleteCookie('loggedInUser', { path: '/' });
        // localStorage.removeItem('isLoggedIn');
        // localStorage.removeItem('loggedInUser');
    }


    // Set state based on derived values ONLY if they changed to prevent loops
    setIsLoggedIn(current => {
        if (current !== derivedIsLoggedIn) {
             console.log(`MainNav: Updating isLoggedIn state from ${current} to ${derivedIsLoggedIn}`);
            return derivedIsLoggedIn;
        }
        return current;
    });
    setLoggedInUser(current => {
        // Simple comparison for object might be sufficient here
        if (JSON.stringify(current) !== JSON.stringify(derivedUser)) {
             console.log(`MainNav: Updating loggedInUser state.`);
            return derivedUser;
        }
        return current;
    });


  }, [setIsLoggedIn, setLoggedInUser]); // Add setters as dependencies

  // Effect to run on mount and listen for changes
   useEffect(() => {
        if (!isMounted) {
            console.log("MainNav: Component mounting...");
            setIsMounted(true); // Indicate component has mounted
            console.log("MainNav: Component mounted.");
        }

        // Initial check on mount - ensure this runs after component is mounted
        console.log("MainNav: Running initial auth and cart check.");
        updateAuthState();
        updateCartCount();


        // Listener for direct storage changes (e.g., other tabs)
        const handleStorageChange = (event: StorageEvent) => {
            console.log(`MainNav: Storage event detected for key: ${event.key}`);
            if (event.key === 'cartItems') {
                updateCartCount();
            }
             if (event.key === 'isLoggedIn' || event.key === 'loggedInUser') {
                 updateAuthState();
            }
        };

        // Listener for custom event dispatched after login/logout actions
        const handleAuthStateChanged = () => {
             console.log("MainNav: 'authStateChanged' event received.");
             updateAuthState();
        };
        // Listener for custom event dispatched after cart updates
        const handleCartUpdated = () => {
             // console.log("MainNav: 'cartUpdated' event received."); // Less verbose
             updateCartCount();
        };

        // Attach listeners
        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('authStateChanged', handleAuthStateChanged);
        window.addEventListener('cartUpdated', handleCartUpdated);


        // Cleanup listeners on component unmount
        return () => {
            console.log("MainNav: Cleaning up listeners.");
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('authStateChanged', handleAuthStateChanged);
            window.removeEventListener('cartUpdated', handleCartUpdated);
        };
    // updateAuthState and updateCartCount are stable due to useCallback
    }, [isMounted, updateAuthState, updateCartCount]); // Add isMounted dependency


   const navigateToCart = () => {
        router.push('/cart');
   };

   // Avoid rendering interactive parts until mounted to prevent hydration errors
    if (!isMounted) {
        // Render a skeleton or simplified version during SSR/initial client render
        // console.log("MainNav: Rendering skeleton (not mounted).");
        return (
            <div className={cn("flex h-16 w-full shrink-0 items-center px-6", className)} {...props}>
                 <MobileNav className="mr-4" /> {/* Keep MobileNav for structure */}
                <Link href="/" className="mr-6 flex items-center space-x-2">
                     <Icons.truck className="h-6 w-6" />
                     <span className="hidden font-bold sm:inline-block">Toyota</span>
                </Link>
                <nav className="hidden md:flex space-x-4 flex-grow">
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-16 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                  <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                   <div className="h-4 w-16 bg-muted rounded animate-pulse"></div> {/* Placeholder for Contacts */}
                </nav>
                 <div className="ml-auto flex items-center space-x-4">
                     <Button size="sm" variant="ghost" className="relative" disabled>
                          <Icons.shoppingCart className="h-4 w-4" />
                          <span className="sr-only">Корзина</span>
                      </Button>
                     {/* Skeleton for Login/User info */}
                     <div className="h-8 w-20 bg-muted rounded animate-pulse"></div>
                 </div>
            </div>
        );
    }


   // Render the final structure after mount
   // console.log("MainNav: Rendering final structure (mounted). isLoggedIn:", isLoggedIn, "User:", loggedInUser?.username);
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
               {/* Show cart count always, regardless of login status - updates via useEffect */}
               {cartItemCount > 0 && (
                 <Badge className="absolute -right-2 -top-2 rounded-full px-1 py-0.5 text-xs" style={{ backgroundColor: '#8dc572' }}>
                   {cartItemCount}
                 </Badge>
               )}
             </Button>

           {/* Conditional rendering based on state updated by useEffect */}
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
