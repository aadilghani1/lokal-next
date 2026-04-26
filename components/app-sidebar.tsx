"use client";

import * as React from "react";
import Link from "next/link";
import { SquaresFour, MagnifyingGlass, FileText, Brain } from "@phosphor-icons/react/dist/ssr";
import { LogoMark } from "@/components/logo";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const navMain = [
  {
    title: "Platform",
    items: [
      {
        title: "Overview",
        url: "/dashboard",
        icon: SquaresFour,
      },
      {
        title: "Audit",
        url: "/dashboard/audit",
        icon: MagnifyingGlass,
      },
      {
        title: "Articles",
        url: "/dashboard/articles",
        icon: FileText,
      },
      {
        title: "Fine Tuning",
        url: "/dashboard/fine-tuning",
        icon: Brain,
      },
    ],
  },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        <Link href="/dashboard" className="flex items-center gap-2 px-2 py-1.5">
          <LogoMark className="size-8 text-sidebar-primary" />
          <span className="font-heading text-sm font-bold tracking-tight">
            Lokal
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {navMain.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton render={<a href={item.url} />}>
                      <item.icon className="size-4" />
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
