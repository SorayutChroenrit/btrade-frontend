"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useSession } from "next-auth/react";

export function NavUser() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const isLoading = status === "loading";

  const getInitials = (name: string) => {
    if (!name) return "U";

    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0);
    }

    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
      0
    )}`;
  };

  console.log(user?.traderInfo.name);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          {isLoading ? (
            <>
              <Skeleton className="h-8 w-8 rounded-lg" />
              <div className="grid flex-1 gap-1 text-left">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-32" />
              </div>
            </>
          ) : (
            <>
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage
                  src={user?.traderInfo.image || "/default-avatar.png"}
                  alt={user?.traderInfo.name || "User"}
                />
                <AvatarFallback className="rounded-lg">
                  {getInitials(user?.traderInfo.name)}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {user?.traderInfo.name || "Guest"}
                </span>
                <span className="truncate text-xs">
                  {user?.traderInfo.email || "No Email"}
                </span>
              </div>
            </>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
