"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { columns, User } from "./UserColumns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle } from "lucide-react";
import axios from "axios";
import { Spinner } from "../ui/spinner";
import { UserForm } from "./UserForm";

// Fetch function that will be used by React Query
const fetchUser = async (): Promise<User[]> => {
  const response = await axios.get(
    `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/traders`
  );
  return response.data.data;
};

export default function AdminUsers() {
  // State to control the dialog visibility
  const [open, setOpen] = useState(false);

  // Use React Query to fetch the data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["users"],
    queryFn: fetchUser,
  });

  console.log("Courses data:", data); // Add this line

  // Handle loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="small" />
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-64">
        <p className="text-red-500">
          Error loading courses: {(error as Error).message}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-end ">
        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2"
          variant={"hero"}
        >
          <PlusCircle className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      {/* Pass the state to the CourseForm component */}
      <UserForm open={open} onOpenChange={setOpen} />
      <DataTable columns={columns} data={data || []} />
    </div>
  );
}
