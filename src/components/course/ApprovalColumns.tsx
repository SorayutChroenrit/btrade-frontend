import { ColumnDef } from "@tanstack/react-table";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTableColumnHeader } from "../general/ColumnsHeader";
import dayjs from "dayjs";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";

// Define session types based on actual structure
interface User {
  id: string;
  email: string;
  role: string;
  accessToken: string;
  traderId?: string;
  traderInfo?: {
    _id: string;
    userId: string;
    company: string;
    durationDisplay: {
      years: number;
      months: number;
      days: number;
    };
    remainingTimeDisplay: {
      years: number;
      months: number;
      days: number;
    };
  };
}

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
  userId: string;
  courseId: string;
  enrollDate: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  course?: Course;
  trader?: Trader;
};

// Create a properly typed component for the actions cell
const ActionCell = ({ enrollment }: { enrollment: PendingEnrollment }) => {
  const { data: session } = useSession();

  const handleApprove = async () => {
    try {
      if (!session?.user) {
        toast.error("Authentication Error", {
          description: "You must be logged in to approve enrollments",
        });
        return;
      }

      // Cast session.user to our User type
      const user = session.user as User;

      if (!user.id || !user.accessToken) {
        toast.error("Authentication Error", {
          description: "Invalid user session. Please log in again.",
        });
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enrollment/action`,
        {
          adminId: user.id,
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          action: "approve",
        } as const,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Enrollment Approved", {
        description: "The enrollment has been successfully approved",
      });

      window.dispatchEvent(new CustomEvent("enrollment-updated"));
    } catch (error: unknown) {
      console.error("Error approving enrollment:", error);

      // Type guard for axios error
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };

      // Handle authentication errors specifically
      if (axiosError.response?.status === 401) {
        toast.error("Authentication Error", {
          description: "Your session has expired. Please log in again.",
        });
        return;
      }

      toast.error("Approval Failed", {
        description:
          axiosError.response?.data?.message ||
          "An error occurred while approving the enrollment",
      });
    }
  };

  const handleReject = async () => {
    try {
      if (!session?.user) {
        toast.error("Authentication Error", {
          description: "You must be logged in to reject enrollments",
        });
        return;
      }

      // Cast session.user to our User type
      const user = session.user as User;

      if (!user.id || !user.accessToken) {
        toast.error("Authentication Error", {
          description: "Invalid user session. Please log in again.",
        });
        return;
      }

      await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enrollment/action`,
        {
          adminId: user.id,
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          action: "reject",
        } as const,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast.success("Enrollment Rejected", {
        description: "The enrollment has been rejected",
      });

      window.dispatchEvent(new CustomEvent("enrollment-updated"));
    } catch (error: unknown) {
      console.error("Error rejecting enrollment:", error);

      // Type guard for axios error
      const axiosError = error as {
        response?: { status?: number; data?: { message?: string } };
      };

      // Handle authentication errors specifically
      if (axiosError.response?.status === 401) {
        toast.error("Authentication Error", {
          description: "Your session has expired. Please log in again.",
        });
        return;
      }

      toast.error("Rejection Failed", {
        description:
          axiosError.response?.data?.message ||
          "An error occurred while rejecting the enrollment",
      });
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
    cell: ({ row }) => row.original.course?.courseCode || "N/A",
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
    cell: ({ row }) => row.original.trader?.name || "Unknown",
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
    cell: ({ row }) => <ActionCell enrollment={row.original} />,
  },
];
