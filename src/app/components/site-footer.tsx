import * as React from "react"
import Link from "next/link"

import { cn } from "@/lib/utils"
import { Icons } from "@/components/icons"

interface SiteFooterProps extends React.HTMLAttributes<HTMLElement> {}

export async function SiteFooter({ className, ...props }: SiteFooterProps) {
  return (
    <footer className={cn("border-t bg-background", className)} {...props}>
      <div className="container flex flex-col items-center justify-between space-y-4 py-6 md:flex-row md:space-y-0 pl-6">
        <div className="flex flex-col items-center space-y-2 md:items-start">
          <Link href="/" className="flex items-center font-semibold">
            <Icons.truck className="mr-2 h-6 w-6" />
            Toyota
          </Link>

        </div>
        <nav className="flex flex-wrap items-center justify-center md:justify-end space-x-4 sm:space-x-6 text-sm">
          <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
            Главная
          </Link>
          <Link href="/shop" className="text-muted-foreground hover:text-foreground transition-colors">
            Магазин
          </Link>
          <Link href="/cart" className="text-muted-foreground hover:text-foreground transition-colors">
            Корзина
          </Link>
          <Link href="/checkout" className="text-muted-foreground hover:text-foreground transition-colors">
            Оформление
          </Link>
          <Link href="/contacts" className="text-muted-foreground hover:text-foreground transition-colors">
            Контакты
          </Link>
        </nav>
      </div>
    </footer>
  )
}
