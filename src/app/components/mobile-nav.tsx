"use client";
import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { Icons } from "@/components/icons"
import { useEffect, useState } from "react";

interface MobileNavProps extends React.HTMLAttributes<HTMLElement> {}


interface NavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

function NavLink({ className, href, children, ...props }: NavLinkProps) {
  const pathname = usePathname()

  const active =
    (pathname === href) ||
    (pathname?.startsWith(`${href}/`) ?? false)

  return (
    <Link href={href} className={cn(active ? "font-semibold text-foreground" : "text-muted-foreground", className)} {...props}>
      {children}
    </Link>
  )
}


export function MobileNav({ className, ...props }: MobileNavProps) {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const storedLogin = localStorage.getItem('isLoggedIn');
        setIsLoggedIn(storedLogin === 'true');
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('isLoggedIn');
        setIsLoggedIn(false);
        router.push('/auth/login');
    };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-2">
          <Icons.menu className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
        <SheetContent side="left" className="pr-0 flex flex-col justify-start">
          
            <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
              <Icons.close className="h-6 w-6" />
              <span className="sr-only">Close</span>
            </SheetClose>
            <div className="mt-16 flex flex-col space-y-2">
              <NavLink href="/" className="py-2 text-white bg-blue-500 rounded-md hover:bg-blue-700 transition-colors">
                  Главная
              </NavLink>
              <NavLink href="/shop" className="py-2 text-white bg-blue-500 rounded-md hover:bg-blue-700 transition-colors">
                  Магазин
              </NavLink>
              <NavLink href="/cart" className="py-2 text-white bg-blue-500 rounded-md hover:bg-blue-700 transition-colors">
                  Корзина
              </NavLink>
              <NavLink href="/checkout" className="py-2 text-white bg-blue-500 rounded-md hover:bg-blue-700 transition-colors">
                  Оформление
              </NavLink>
              {isLoggedIn ? (
                  <Button variant="ghost" onClick={handleLogout} className="py-2 justify-start text-white bg-blue-500 rounded-md hover:bg-blue-700 transition-colors">
                      Выйти
                  </Button>
              ) : (
                  <Link href="/auth/login" className="py-2">
                      <Button variant="ghost" className="justify-start font-bold text-black bg-white rounded-md hover:bg-gray-100 transition-colors">
                          Войти
                      </Button>
                  </Link>
              )}
            </div>
      </SheetContent>
    </Sheet>
  )
}

