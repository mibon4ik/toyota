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
          <span className="sr-only">Открыть меню</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="pr-0 flex flex-col">
        <NavLink href="/" className="py-2">
          Главная
        </NavLink>
        <NavLink href="/shop" className="py-2">
          Магазин
        </NavLink>
        <NavLink href="/cart" className="py-2">
          Корзина
        </NavLink>
        <NavLink href="/checkout" className="py-2">
          Оформление
        </NavLink>
          {isLoggedIn ? (
              <Button variant="ghost" onClick={handleLogout} className="py-2 justify-start">
                  Выйти
              </Button>
          ) : (
              <Link href="/auth/login" className="py-2">
                  <Button variant="ghost" className="justify-start">
                      Войти
                  </Button>
              </Link>
          )}
        <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
          <Icons.close className="h-6 w-6" />
          <span className="sr-only">Закрыть</span>
        </SheetClose>
      </SheetContent>
    </Sheet>
  )
}

MobileNav.displayName = "MobileNav";
"
    