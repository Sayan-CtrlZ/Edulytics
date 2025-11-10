
"use client";

import { usePathname } from "next/navigation";
import { AppLayout } from "./app-layout";
import { useEffect, useState } from "react";

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  if (isAuthPage) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
