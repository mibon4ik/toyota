"use client"

import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {}

export function SiteFooter({ className, ...props }: SiteFooterProps) {
  return (
    <footer className={cn("border-t bg-background", className)} {...props}>
      <div className="container flex flex-col items-center justify-between space-y-4 py-6 md:flex-row md:space-y-0">
        <div className="flex flex-col items-center space-y-2 md:items-start">
          <Link href="/" className="flex items-center font-semibold">
            <Icons.truck className="mr-2 h-6 w-6" />
            Toyota
          </Link>
          <p className="text-sm text-muted-foreground">
            Собрано на Firebase Studio
          </p>
        </div>
        <nav className="flex flex-wrap items-center space-x-6 text-sm">
          <Link href="/" className="hover:text-foreground">
            Главная
          </Link>
          <Link href="/shop" className="hover:text-foreground">
            Магазин
          </Link>
          <Link href="/cart" className="hover:text-foreground">
            Корзина
          </Link>
          <Link href="/checkout" className="hover:text-foreground">
            Оформление
          </Link>
          <Link href="/contacts" className="hover:text-foreground">
            Контакты
          </Link>
        </nav>
      </div>
    </footer>
  )
}
