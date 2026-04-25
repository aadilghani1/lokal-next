"use client";

import { OrganizationSwitcher } from "@clerk/nextjs";
import {
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function OrgSwitcher() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <OrganizationSwitcher
          hidePersonal
          afterCreateOrganizationUrl="/dashboard"
          afterSelectOrganizationUrl="/dashboard"
          appearance={{
            elements: {
              rootBox: "w-full",
              organizationSwitcherTrigger:
                "w-full justify-between rounded-md px-2 py-1.5 text-sm",
            },
          }}
        />
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
