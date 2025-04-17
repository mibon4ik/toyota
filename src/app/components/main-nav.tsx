"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"
import { MobileNav } from "@/components/ui/mobile-nav"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { NavLink } from "@/components/ui/nav-link"

interface MainNavProps extends React.HTMLAttributes<HTMLElement> {}

export function MainNav({ className, ...props }: MainNavProps) {
  return (
    <div className={cn("flex h-16 w-full shrink-0 items-center px-6", className)} {...props}>
      <MobileNav className="mr-4" />
      <Link href="/" className="mr-6 flex items-center space-x-2">
        <Icons.truck className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">AutoSpot</span>
      </Link>
      <nav className="hidden md:flex">
        <NavLink href="/">
          Home
        </NavLink>
        <NavLink href="/shop">
          Shop
        </NavLink>
        <NavLink href="/cart">
          Cart
        </NavLink>
        <NavLink href="/checkout">
          Checkout
        </NavLink>
      </nav>
      <div className="ml-auto flex items-center space-x-4">
        <Button size="sm" variant="ghost">
          <Icons.search className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
        <Button size="sm" variant="ghost">
          <Icons.shoppingCart className="h-4 w-4" />
          <span className="sr-only">Cart</span>
        </Button>
        <Avatar>
          <AvatarImage src="/examples/card-example.png" alt="avatar" />
          <AvatarFallback>OM</AvatarFallback>
        </Avatar>
      </div>
    </div>
  )
}
