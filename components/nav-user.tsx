"use client";

import { UserButton } from "@clerk/nextjs";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function NavUser() {
  return (
    <SidebarMenu>
      <SidebarMenuItem className="flex items-center gap-2 px-2 py-1.5">
        <UserButton
          showName
          appearance={{
            elements: {
              avatarBox: "size-8",
            },
          }}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
