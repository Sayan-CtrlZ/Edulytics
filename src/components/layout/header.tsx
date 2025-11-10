
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <div className="flex-1" />
      <UserNav />
    </header>
  );
}
