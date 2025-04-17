"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { cn } from "@/lib/utils"

interface NavLinkProps extends React.HTMLAttributes<HTMLAnchorElement> {
  href: string
  children: React.ReactNode
}

export function NavLink({ className, href, children, ...props }: NavLinkProps) {
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
