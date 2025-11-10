
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  GraduationCap,
  LayoutDashboard,
  Upload,
  Settings,
  LifeBuoy,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const menuItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/upload", label: "Upload Data", icon: Upload },
];

const secondaryMenuItems = [
    { href: "/account", label: "Account", icon: ShieldCheck },
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/support", label: "Support", icon: LifeBuoy },
]

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon">
      <SidebarRail />
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <GraduationCap className="size-8 text-primary" />
          <span className="text-lg font-semibold group-data-[collapsible=icon]:hidden">Edulytics</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="flex-1 mt-8">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className={cn(
                    "justify-start",
                    pathname === item.href && "bg-primary/10 text-primary"
                  )}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
            {secondaryMenuItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                    asChild
                    isActive={pathname.startsWith(item.href)}
                    tooltip={item.label}
                    disabled={item.disabled}
                    className="justify-start"
                    >
                    <Link href={item.href}>
                        <item.icon />
                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                    </Link>
                    </SidebarMenuButton>
                </SidebarMenuItem>
            ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
