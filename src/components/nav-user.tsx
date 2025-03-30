"use client";

import { useState } from "react";
import {
  BadgeCheck,
  ChevronsUpDown,
  KeyRound,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import { Button } from "@/components/ui/button";
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
  id: string;
  traderId: string;
  traderInfo?: TraderInfo;
  accessToken: string;
}

// Define schema for code validation
const codeSchema = z.object({
  enteredCode: z
    .string()
    .min(6, "Code must be at least 6 characters")
    .max(6, "Code must be exactly 6 characters")
    .regex(/^\d+$/, "Code must contain only numbers"),
});

type CodeFormValues = z.infer<typeof codeSchema>;

export function NavUser() {
  const { data: session, status } = useSession();
  const user = session?.user as SessionUser | undefined;
  const isLoading = status === "loading";
  const { isMobile } = useSidebar();
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showAccountDialog, setShowAccountDialog] = useState(false);
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [isValidatingCode, setIsValidatingCode] = useState(false);
  const { resolvedTheme, setTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Code validation form
  const codeForm = useForm<CodeFormValues>({
    resolver: zodResolver(codeSchema),
    defaultValues: {
      enteredCode: "",
    },
  });

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
    // Show toast before signing out
    toast.success("Successfully logged out of B-Trade");

    setTimeout(async () => {
      await signOut({ callbackUrl: "/" });
    }, 500);
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trader`,
        requestData,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
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

  // Handle code validation
  const handleValidateCode = async (values: CodeFormValues) => {
    if (!user) {
      toast.error("You must be logged in to validate a course code");
      return;
    }

    setIsValidatingCode(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enrollment/validateCode`,
        { enteredCode: values.enteredCode },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Handle successful validation
      toast.success(response.data.message);
      codeForm.reset();
      setShowCodeDialog(false);
    } catch (error: any) {
      // Handle error
      const errorMessage =
        error.response?.data?.message ||
        "Failed to validate code. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsValidatingCode(false);
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
                <DropdownMenuItem onSelect={() => setShowCodeDialog(true)}>
                  <KeyRound className="mr-2 h-4 w-4" />
                  Validate Course
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
          traderId={user.id}
          open={showAccountDialog}
          onOpenChange={setShowAccountDialog}
          onUpdate={handleUpdateAccount}
        />
      )}

      {/* Code Validation Dialog */}
      <Dialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              Validate Course Attendance
            </DialogTitle>
            <DialogDescription>
              Enter the 6-digit code provided by your instructor to confirm your
              attendance.
            </DialogDescription>
          </DialogHeader>

          <Form {...codeForm}>
            <form
              onSubmit={codeForm.handleSubmit(handleValidateCode)}
              className="space-y-6 py-4"
            >
              <FormField
                control={codeForm.control}
                name="enteredCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Validation Code</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          placeholder="Enter 6-digit code"
                          className="text-center text-lg tracking-widest"
                          maxLength={6}
                          {...field}
                          onChange={(e) => {
                            // Only allow numeric input
                            const value = e.target.value.replace(/\D/g, "");
                            field.onChange(value);
                          }}
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCodeDialog(false)}
                  disabled={isValidatingCode}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-[#FDAB04] text-white hover:bg-[#FDAB04]/90"
                  disabled={isValidatingCode}
                >
                  {isValidatingCode ? "Validating..." : "Validate Code"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
