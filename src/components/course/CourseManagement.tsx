"use client";

import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { columns as baseColumns } from "@/components/course/CourseColumns";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { PlusCircle, MoreHorizontal, Ticket } from "lucide-react";
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
import { ColumnDef } from "@tanstack/react-table";

interface CourseData {
  _id: string;
  name: string;
  courseName: string;
  courseCode: string;
  description: string;
  startDate: Date;
  endDate: Date;
  courseDate: Date;
  location: string;
  price: number;
  hours: number;
  maxSeats: number;
  availableSeats: number;
  courseTags: string[];
  imageUrl?: string;
}

export default function AdminCourses() {
  const { data: session } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const [selectedCourse, setSelectedCourse] = useState<CourseData | null>(null);
  const [open, setOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [viewCourse, setViewCourse] = useState<CourseData | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);

  // State for delete confirmation dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  // State for code generation dialog
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [courseForCode, setCourseForCode] = useState<CourseData | null>(null);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const [codeValidUntil, setCodeValidUntil] = useState<string | null>(null);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  // Fetch function that will be used by React Query
  const fetchCourses = async (): Promise<CourseData[]> => {
    if (!user?.accessToken) {
      return [];
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`,
      {
        headers: {
          Authorization: `Bearer ${user.accessToken}`,
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
    enabled: !!user?.accessToken,
  });

  // Function to generate enrollment code
  const handleGenerateCode = (course: CourseData) => {
    setCourseForCode(course);
    setGeneratedCode(null);
    setCodeValidUntil(null);
    setShowCodeDialog(true);
  };

  // Function to confirm code generation
  const confirmGenerateCode = async () => {
    if (!courseForCode || !user?.accessToken) return;

    setIsGeneratingCode(true);
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enrollment/generateCode`,
        { courseId: courseForCode._id },
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      const { courseCode, validUntil } = response.data.data;
      setGeneratedCode(courseCode);
      setCodeValidUntil(validUntil);
      toast.success("Enrollment code generated successfully");
    } catch (error: any) {
      console.error("Error generating code:", error);
      if (error.response?.data?.message) {
        // If there's an existing code, display it
        if (
          error.response.data.code === "Error-01-0006" &&
          error.response.data.data?.existingCode
        ) {
          setGeneratedCode(error.response.data.data.existingCode);
          toast.info(error.response.data.message);
        } else {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error("Failed to generate enrollment code. Please try again.");
      }
    } finally {
      setIsGeneratingCode(false);
    }
  };

  // Function to show the delete confirmation dialog
  const confirmDelete = (courseId: string) => {
    setCourseToDelete(courseId);
    setShowDeleteDialog(true);
  };

  // Function to perform the actual deletion
  const deleteCourse = async () => {
    if (!courseToDelete || !user?.accessToken) {
      console.error("Course ID or access token is required");
      return;
    }

    try {
      const requestPayload = {
        courseId: courseToDelete,
        isDeleted: true,
      };

      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`,
        requestPayload,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
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
  const handleEditCourse = (id: string) => {
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
  const handleViewCourse = (course: CourseData) => {
    setViewCourse(course);
    setViewOpen(true);
  };

  // Create a custom "actions" column with edit functionality
  const actionsColumn: ColumnDef<CourseData, unknown> = {
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
            <DropdownMenuItem onClick={() => handleGenerateCode(course)}>
              Generate Enrollment Code
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
  const columnsWithEdit = [
    ...baseColumns.filter((col) => col.id !== "actions"),
    actionsColumn,
  ];

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
      <div className="flex items-center justify-end">
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
          if (viewCourse) handleEditCourse(viewCourse._id);
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

      {/* Generate Code Dialog */}
      <AlertDialog open={showCodeDialog} onOpenChange={setShowCodeDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Ticket className="h-5 w-5" />
              Generate Enrollment Code
            </AlertDialogTitle>

            {/* Course info moved outside AlertDialogDescription */}
            {courseForCode && (
              <div className="mb-4">
                <div className="font-semibold">
                  {courseForCode.name || courseForCode.courseName}
                </div>
                <div className="text-sm text-gray-500">
                  Date:{" "}
                  {new Date(courseForCode.courseDate).toLocaleDateString()}
                </div>
              </div>
            )}

            {/* Remove the redundant AlertDialogDescription entirely */}

            {/* Single description section */}
            {generatedCode ? (
              <div className="mt-4 bg-gray-100 p-4 rounded-md">
                <div className="text-sm text-gray-500 mb-1">
                  Enrollment Code:
                </div>
                <div className="text-2xl font-bold text-center">
                  {generatedCode}
                </div>
                {codeValidUntil && (
                  <div className="text-xs text-gray-500 text-center mt-2">
                    Valid until: {codeValidUntil}
                  </div>
                )}
              </div>
            ) : (
              <div className="mt-2 text-sm text-gray-500">
                Generate a unique enrollment code for this course. This code can
                be shared with students to enroll in the course.
              </div>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Close</AlertDialogCancel>
            {!generatedCode && !isGeneratingCode && (
              <AlertDialogAction
                onClick={confirmGenerateCode}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Generate Code
              </AlertDialogAction>
            )}
            {isGeneratingCode && (
              <Button disabled className="bg-blue-600">
                <Spinner size="small" color="white" className="mr-2" />
                Generating...
              </Button>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <DataTable columns={columnsWithEdit} data={data || []} />
    </div>
  );
}
