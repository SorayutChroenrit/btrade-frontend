"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { columns as baseColumns } from "@/components/user/UserColumns";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import axios from "axios";
import { Spinner } from "@/components/ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CreateUserDialog } from "./CreateUserForm";
import { ViewUserTrainingDialog } from "./ViewUserDialog";
import { EditUserDialog } from "./EditUserDialog";
import { useSession } from "next-auth/react";
import { ColumnDef } from "@tanstack/react-table";
import { UserData } from "@/lib/types";

export default function AdminUsers() {
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedTrader, setSelectedTrader] = useState<TraderData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoadingTrader, setIsLoadingTrader] = useState(false);

  // Move the useSession hook inside the component
  const { data: session } = useSession();
  const user = session?.user;

  // Fetch function that will be used by React Query
  const fetchUsers = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  };

  // Fetch trader data by user ID
  const fetchTraderByUserId = async (traderId: string) => {
    console.log(traderId);
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trader/${traderId}`,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(response.data.data);
    return response.data.data;
  };

  // Use React Query to fetch the users data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
    enabled: !!user?.accessToken, // Only run query when we have an access token
  });

  // Handle opening the form for editing a user
  const handleEditUser = (id: string) => {
    setSelectedUserId(id);
    setIsEditOpen(true);

    // If we're editing from the view dialog, close it
    if (viewDialogOpen) {
      setViewDialogOpen(false);
    }
  };

  // Handle viewing user details
  const handleViewUser = async (user: UserData) => {
    setSelectedUser(user);
    setIsLoadingTrader(true);

    try {
      // Fetch trader data associated with this user
      const traderData = await fetchTraderByUserId(user._id);
      setSelectedTrader(traderData);
    } catch (error) {
      console.error("Error fetching trader data:", error);
      setSelectedTrader(null);
    } finally {
      setIsLoadingTrader(false);
      setViewDialogOpen(true);
    }
  };

  // Create a custom "actions" column with view/edit functionality
  const actionsColumn: ColumnDef<UserData> = {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="hero" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleViewUser(user)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditUser(user._id)}>
              Edit User
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete User
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };

  // Replace the existing actions column with this one
  const columnsWithEdit = baseColumns({ refetch });
  columnsWithEdit.push(actionsColumn);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="large" color="hero" />
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-64">
        <p className="text-red-500">
          Error loading users:{" "}
          {error instanceof Error ? error.message : String(error)}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-end mb-4">
        <Button
          onClick={() => setCreateDialogOpen(true)}
          className="flex items-center gap-2"
          variant="hero"
        >
          <PlusCircle className="h-4 w-4" />
          Create User
        </Button>
      </div>
      {/* View User Training Dialog */}
      {selectedUser && (
        <ViewUserTrainingDialog
          open={viewDialogOpen}
          onOpenChange={setViewDialogOpen}
          userData={selectedUser}
          traderData={selectedTrader}
          onEdit={() => handleEditUser(selectedUser._id)}
        />
      )}
      {/* Create User Dialog */}
      <CreateUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSuccess={() => refetch()}
      />
      {/* Edit User Dialog */}
      {selectedUserId && (
        <EditUserDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          userId={selectedUserId}
          onSuccess={() => refetch()}
        />
      )}
      {/* Users Data Table */}
      <DataTable columns={columnsWithEdit} data={data || []} />
    </div>
  );
}
