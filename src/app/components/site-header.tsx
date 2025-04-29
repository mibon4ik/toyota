"use client"; // Keep this as a Client Component because MainNav needs client hooks

import { MainNav } from "@/app/components/main-nav";

export function SiteHeader() {
  return (
    // Added shadow for better visual separation
    <header className="bg-background sticky top-0 z-40 w-full border-b shadow-sm">
      <MainNav />
    </header>
  );
}
