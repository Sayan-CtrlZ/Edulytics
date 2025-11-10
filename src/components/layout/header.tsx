
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";
import { useIsMobile } from "@/hooks/use-mobile";

export function Header() {
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-violet-200/60 dark:bg-violet-950/40 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      <SidebarTrigger className={!isMobile ? "max-md:hidden" : ""} />
      {!isMobile && <div className="h-full w-px bg-border max-md:hidden" />}
      <div className="flex-1" />
      <UserNav />
    </header>
  );
}

    