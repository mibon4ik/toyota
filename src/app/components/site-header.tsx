"use client";

import { MainNav } from "@/app/components/main-nav";


export function SiteHeader() {
  return (

    <header className="bg-background sticky top-0 z-40 w-full border-b shadow-sm">
      <MainNav />
    </header>
  );
}
