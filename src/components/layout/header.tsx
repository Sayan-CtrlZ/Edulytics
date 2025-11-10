
"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";
import { useIsMobile } from "@/hooks/use-mobile";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";

export function Header() {
  const isMobile = useIsMobile();
  const { user } = useUser();
  const firestore = useFirestore();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, `users/${user.uid}`);
  }, [firestore, user]);

  const { data: userData } = useDoc(userDocRef);
  const instituteName = (userData as any)?.instituteName || "Institute";

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-violet-200/60 dark:bg-violet-950/40 backdrop-blur-sm px-4 sm:px-6 lg:px-8">
      <SidebarTrigger className={!isMobile ? "max-md:hidden" : ""} />
      {!isMobile && <div className="h-full w-px bg-border max-md:hidden" />}
      <div className="flex-1" />
      {!isMobile && (
        <div className="text-sm font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">{instituteName}</div>
      )}
      <UserNav />
    </header>
  );
}
