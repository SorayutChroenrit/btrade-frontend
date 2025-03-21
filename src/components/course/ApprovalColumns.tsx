import { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "../general/ColumnsHeader";
import dayjs from "dayjs";
import axios from "axios";

// Trader type definition
export type Trader = {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
};

// Course type definition
export type Course = {
  _id: string;
  courseName: string;
  courseCode: string;
  description?: string;
  price?: number;
};

// Enrollment type definition
export type PendingEnrollment = {
  _id: string;
  traderId: string;
  courseId: string;
  enrollDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  course?: Course;
  trader?: Trader;
};

export const columns: ColumnDef<PendingEnrollment>[] = [
  {
    id: "rowNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => {
      return row.index + 1;
    },
  },
  {
    accessorKey: "courseCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course Code" />
    ),
    cell: ({ row }) => {
      // Add a console log to debug the course object
      console.log("Course in cell render:", row.original.course);
      return row.original.course?.courseCode || "N/A";
    },
  },
  {
    accessorKey: "courseName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course Name" />
    ),
    cell: ({ row }) => row.original.course?.courseName || "N/A",
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Trader Name" />
    ),
    cell: ({ row }) => {
      // Add a console log to debug the trader object
      console.log("Trader in cell render:", row.original.trader);

      // Access the name property safely with optional chaining
      const name = row.original.trader?.name;

      // Return the name or a fallback
      return name || "Unknown";
    },
  },
  {
    accessorKey: "enrollDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Enrollment Date" />
    ),
    cell: ({ row }) => {
      const date = row.original.enrollDate;
      return date ? dayjs(date).format("HH:mm, D MMMM YYYY") : "N/A";
    },
  },
  {
    id: "actions",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Actions" />
    ),
    cell: ({ row }) => {
      const enrollment = row.original;

      const handleApprove = async () => {
        try {
          await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enrollments/${enrollment._id}/approve`
          );
          // Use a more modern approach than window.location.reload()
          window.dispatchEvent(new CustomEvent("enrollment-updated"));
        } catch (error) {
          console.error("Error approving enrollment:", error);
        }
      };

      const handleReject = async () => {
        try {
          await axios.put(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enrollments/${enrollment._id}/reject`
          );
          // Use a more modern approach than window.location.reload()
          window.dispatchEvent(new CustomEvent("enrollment-updated"));
        } catch (error) {
          console.error("Error rejecting enrollment:", error);
        }
      };

      return (
        <div className="flex space-x-2">
          <Button
            onClick={handleApprove}
            variant="outline"
            size="sm"
            className="bg-green-50 hover:bg-green-100 text-green-600 border-green-200"
          >
            <Check className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleReject}
            variant="outline"
            size="sm"
            className="bg-red-50 hover:bg-red-100 text-red-600 border-red-200"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      );
    },
  },
];
