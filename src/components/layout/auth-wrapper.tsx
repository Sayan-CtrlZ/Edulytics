
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

  const isLoginPage = pathname === "/login";

  if (!isMounted) {
    return null; // Or a loading spinner
  }

  if (isLoginPage) {
    return <>{children}</>;
  }

  return <AppLayout>{children}</AppLayout>;
}
