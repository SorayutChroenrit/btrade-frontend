"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../general/ColumnsHeader";
import { UserData } from "@/lib/types";
import dayjs from "dayjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import axios, { AxiosError } from "axios";
import React, { useState, useCallback } from "react";

type UserRole = "user" | "admin";

interface RoleChangeInfo {
  userId: string;
  currentRole: UserRole;
  newRole: UserRole;
}

interface UserRoleUpdateResponse {
  status: string;
  message?: string;
  data?: unknown;
}

interface ColumnsProps {
  refetch?: () => void;
}

export const columns: (props?: ColumnsProps) => ColumnDef<UserData>[] = (
  props = {}
) => {
  const { refetch } = props;
  const { data: session } = useSession();
  const user = session?.user;
  const [roleChangeInfo, setRoleChangeInfo] = useState<RoleChangeInfo | null>(
    null
  );

  const handleRoleChange = useCallback(async () => {
    if (!roleChangeInfo || !user?.accessToken) return;

    const { userId, newRole } = roleChangeInfo;
    const toastId = toast.loading("Updating role...");

    try {
      const { data } = await axios.put<UserRoleUpdateResponse>(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`,
        {
          _id: userId,
          role: newRole,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.accessToken}`,
          },
        }
      );

      if (data.status !== "Success") {
        throw new Error(data.message || "Role update failed");
      }

      toast.success(`Role updated to ${newRole}`, { id: toastId });

      // Refetch data if a refetch function is provided
      if (refetch) {
        refetch();
      }
    } catch (error) {
      let errorMessage = "Failed to update role";

      if (axios.isAxiosError(error)) {
        errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Axios error occurred";

        // Log more detailed error information
        console.error("Axios Error Details:", {
          status: error.response?.status,
          data: error.response?.data,
          headers: error.response?.headers,
          url: error.config?.url,
          method: error.config?.method,
          requestData: error.config?.data,
        });
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      toast.error(errorMessage, { id: toastId });
      console.error("Role update error:", error);
    } finally {
      setRoleChangeInfo(null);
    }
  }, [roleChangeInfo, user?.accessToken, refetch]);

  const handleRoleSelect = useCallback((row: UserData, newRole: UserRole) => {
    if (newRole !== row.role) {
      setRoleChangeInfo({
        userId: row._id,
        currentRole: row.role,
        newRole,
      });
    }
  }, []);

  return [
    {
      id: "rowNumber",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="#" />
      ),
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const user = row.original;
        const currentRole = user.role;

        return (
          <>
            <Select
              value={currentRole}
              onValueChange={(newRole: UserRole) =>
                handleRoleSelect(user, newRole)
              }
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>

            {roleChangeInfo && roleChangeInfo.userId === user._id && (
              <AlertDialog
                open={true}
                onOpenChange={() => setRoleChangeInfo(null)}
              >
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Role Change</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to change the role from{" "}
                      {roleChangeInfo.currentRole} to {roleChangeInfo.newRole}?
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setRoleChangeInfo(null)}>
                      Cancel
                    </AlertDialogCancel>
                    <AlertDialogAction onClick={handleRoleChange}>
                      Continue
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
    },
    {
      accessorKey: "lastLogin",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Last Login" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("lastLogin") as string | Date | null;
        return !date ? (
          <span className="text-muted-foreground italic">
            Not logged in yet
          </span>
        ) : (
          dayjs(date).format("HH:mm, D MMMM YYYY")
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Created At" />
      ),
      cell: ({ row }) => {
        const date = row.getValue("createdAt") as string | Date;
        return dayjs(date).format("HH:mm, D MMMM YYYY");
      },
    },
  ];
};
