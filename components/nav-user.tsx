"use client";

import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2 px-2 py-1.5">
        <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium">
          U
        </div>
        <span className="text-sm">Demo User</span>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
