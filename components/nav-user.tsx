"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import {
  UserCircle,
  CreditCard,
  Bell,
  SignOut,
  CaretUpDown,
  Sparkle,
  GearSix,
} from "@phosphor-icons/react/dist/ssr";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";

function getInitials(name: string | null | undefined): string {
  if (!name) return "?";
  return name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function NavUser() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const { isMobile } = useSidebar();
  const router = useRouter();

  if (!isLoaded) {
    return (
      <SidebarMenu>
        <SidebarMenuItem className="flex items-center gap-2 px-2 py-1.5">
          <Skeleton className="size-8 rounded-lg" />
          <div className="flex flex-col gap-1">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-3 w-32" />
          </div>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  const displayName = user?.fullName ?? "Account";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const avatarUrl = user?.imageUrl ?? "";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden transition-[width,height,padding] h-12 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-popup-open:bg-sidebar-accent data-popup-open:text-sidebar-accent-foreground">
            <Avatar className="h-8 w-8 rounded-lg">
              <AvatarImage src={avatarUrl} alt={displayName} />
              <AvatarFallback className="rounded-lg">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{displayName}</span>
              <span className="truncate text-xs text-muted-foreground">
                {email}
              </span>
            </div>
            <CaretUpDown className="ml-auto size-4" weight="bold" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuGroup>
              <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={avatarUrl} alt={displayName} />
                  <AvatarFallback className="rounded-lg">
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">{displayName}</span>
                  <span className="truncate text-xs text-muted-foreground">
                    {email}
                  </span>
                </div>
              </div>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
                <GearSix className="size-4" />
                Settings
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuItem onClick={() => signOut({ redirectUrl: "/" })}>
              <SignOut className="size-4" />
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
