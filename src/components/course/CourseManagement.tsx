"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { columns as baseColumns } from "@/components/course/CourseColumns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle, MoreHorizontal } from "lucide-react";
import axios from "axios";
import { Spinner } from "../ui/spinner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { CreateCourseForm } from "./CreateCourseForm";
import { ViewCourseDialog } from "./ViewCourseDialog";
import { EditCourseForm } from "./EditCourseForm";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

export default function AdminCourses() {
  const { data: session } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCourse, setViewCourse] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  // Fetch function that will be used by React Query
  const fetchCourses = async () => {
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  };

  // Use React Query to fetch the data
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["courses"],
    queryFn: fetchCourses,
  });

  // Function to show the delete confirmation dialog
  const confirmDelete = (courseId: string) => {
    setCourseToDelete(courseId);
    setShowDeleteDialog(true);
  };

  // Function to perform the actual deletion
  const deleteCourse = async () => {
    if (!courseToDelete) {
      console.error("Course ID is required for deletion");
      return;
    }

    try {
      // Create the request payload for soft deletion
      const requestPayload = {
        courseId: courseToDelete,
        updateFields: {
          isDeleted: true,
        },
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`,
        requestPayload,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update the cache
      queryClient.invalidateQueries({ queryKey: ["courses"] });

      // Show success message
      toast.success("Course has been deleted successfully");
    } catch (error) {
      console.error("Error deleting course:", error);
      // Handle error
      toast.error("Failed to delete the course. Please try again.");
    } finally {
      // Reset the state
      setCourseToDelete(null);
      setShowDeleteDialog(false);
    }
  };

  // Handle opening the form for editing
  const handleEditCourse = (id: any) => {
    setSelectedCourseId(id);
    setIsEditOpen(true);
  };

  // Function to handle closing the dialog
  const handleCloseDialog = (open: boolean) => {
    setOpen(open);
    if (!open) {
      setSelectedCourse(null);
    }
  };

  // Handle viewing course details
  const handleViewCourse = (course: any) => {
    setViewCourse(course);
    setViewOpen(true);
  };

  // Create a custom "actions" column with edit functionality
  const actionsColumn = {
    id: "actions",
    cell: ({ row }) => {
      const course = row.original;
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleViewCourse(course)}>
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEditCourse(course._id)}>
              Edit Course
            </DropdownMenuItem>
            <DropdownMenuItem
              className="text-red-600"
              onClick={() => confirmDelete(course._id)}
            >
              Delete Course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  };

  // Replace the existing actions column with our custom one
  const columnsWithEdit = baseColumns.filter((col) => col.id !== "actions");
  columnsWithEdit.push(actionsColumn);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="large" color={"hero"} />
      </div>
    );
  }

  // Handle error state
  if (isError) {
    return (
      <div className="flex flex-col gap-4 justify-center items-center h-64">
        <p className="text-red-500">
          Error loading courses:{" "}
          {error instanceof Error ? error.message : String(error)}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto">
      <div className="flex items-center justify-end ">
        <Button
          onClick={() => {
            setSelectedCourse(null);
            setOpen(true);
          }}
          className="flex items-center gap-2"
          variant={"hero"}
        >
          <PlusCircle className="h-4 w-4" />
          Create Course
        </Button>
      </div>

      <ViewCourseDialog
        open={viewOpen}
        onOpenChange={setViewOpen}
        course={viewCourse}
        onEdit={() => {
          setViewOpen(false);
          handleEditCourse(viewCourse);
        }}
      />
      <CreateCourseForm
        open={open}
        onOpenChange={handleCloseDialog}
        onSuccess={() => refetch()}
      />
      <EditCourseForm
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        courseId={selectedCourseId}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action will delete the course. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={deleteCourse}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable columns={columnsWithEdit} data={data || []} />
    </div>
  );
}
