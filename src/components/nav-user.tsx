"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Bell,
  ChevronsUpDown,
  CreditCard,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import axios from "axios";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { useSession, signOut } from "next-auth/react";
import { Skeleton } from "./ui/skeleton";
import { useTheme } from "next-themes";
import { Toaster, toast } from "sonner";
import { AccountDialog } from "./user/AccountDialog";

// Define TypeScript interfaces for trader info and update form values
interface TraderInfo {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  idCard?: string;
  image?: string;
}

interface AccountUpdateValues {
  name: string;
  email: string;
  phoneNumber?: string;
  company?: string;
  idCard?: string;
}

// Define session user type with traderInfo
interface SessionUser {
  traderId: string;
  traderInfo?: TraderInfo;
}

export function NavUser() {
  const { data: session, status } = useSession();
  const user = session?.user as SessionUser | undefined;
  const isLoading = status === "loading";
  const { isMobile } = useSidebar();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const getInitials = (name: string | undefined): string => {
    if (!name) return "U";

    const nameParts = name.split(" ");
    if (nameParts.length === 1) {
      return nameParts[0].charAt(0);
    }

    return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
      0
    )}`;
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // Updated function to include traderId from the session
  const handleUpdateAccount = async (values: AccountUpdateValues) => {
    try {
      // Check if traderInfo exists and has _id (not id)
      if (!user?.traderInfo?._id) {
        toast.error("Trader ID not found in session");
        return;
      }

      // Include the traderId in the request payload
      const requestData = {
        traderId: user.traderInfo._id,
        ...values,
      };

      console.log(requestData);
      const response = await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/traders/update-profile`,
        requestData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Your profile has been updated successfully.");
      return response.data;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile. Please try again.");
      throw error;
    }
  };

  return (
    <div className="mt-auto">
      <Toaster position="bottom-right" richColors />
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
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
                        src={user?.traderInfo?.image || "/default-avatar.png"}
                        alt={user?.traderInfo?.name || "User"}
                      />
                      <AvatarFallback className="rounded-lg">
                        {getInitials(user?.traderInfo?.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">
                        {user?.traderInfo?.name || "Guest"}
                      </span>
                      <span className="truncate text-xs">
                        {user?.traderInfo?.email || "No Email"}
                      </span>
                    </div>
                    <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-50" />
                  </>
                )}
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
              side={isMobile ? "bottom" : "right"}
              align="end"
              sideOffset={4}
            >
              <DropdownMenuLabel className="p-0 font-normal">
                <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage
                      src={user?.traderInfo?.image || "/default-avatar.png"}
                      alt={user?.traderInfo?.name || "User"}
                    />
                    <AvatarFallback className="rounded-lg">
                      {getInitials(user?.traderInfo?.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">
                      {user?.traderInfo?.name || "Guest"}
                    </span>
                    <span className="truncate text-xs">
                      {user?.traderInfo?.email || "No Email"}
                    </span>
                  </div>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem onSelect={() => setShowAccountDialog(true)}>
                  <BadgeCheck className="mr-2 h-4 w-4" />
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => setTheme(isDark ? "light" : "dark")}
                >
                  {isDark ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  {isDark ? "Light Mode" : "Dark Mode"}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setShowLogoutDialog(true)}>
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to sign out of your B-Trade account?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleSignOut}
              className="bg-[#FDAB04] text-white hover:bg-[#FDAB04]/90"
            >
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Account Dialog */}
      {user?.traderInfo && (
        <AccountDialog
          traderId={user.traderId}
          open={showAccountDialog}
          onOpenChange={setShowAccountDialog}
          onUpdate={handleUpdateAccount}
        />
      )}
    </div>
  );
}
