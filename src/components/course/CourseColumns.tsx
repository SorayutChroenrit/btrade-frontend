"use client";

import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { DataTableColumnHeader } from "../general/ColumnsHeader";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);

// Define the Course type based on your MongoDB schema
export type Course = {
  _id: string;
  courseName: string;
  courseCode: string;
  description: string;
  startDate: string;
  endDate: string;
  location: string;
  price: number;
  hours: number;
  maxSeats: number;
  availableSeats: number;
  imageUrl: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  courseDate: string;
};

export const columns: ColumnDef<Course>[] = [
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
      <DataTableColumnHeader column={column} title="Code" />
    ),
  },
  {
    accessorKey: "courseName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course Name" />
    ),
  },
  {
    accessorKey: "price",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Price" />
    ),
    cell: ({ row }) => {
      const price = parseFloat(row.getValue("price"));
      return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "THB",
      }).format(price);
    },
  },
  {
    id: "courseDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course Date" />
    ),
    cell: ({ row }) => {
      const courseDate = row.original.courseDate;
      return dayjs(courseDate).tz("Asia/Bangkok").format("HH:mm, D MMM YYYY");
    },
  },
  {
    accessorKey: "availableSeats",
    header: "Available Seats",
    cell: ({ row }) => {
      const availableSeats = parseInt(row.getValue("availableSeats"));
      const maxSeats = parseInt(row.original.maxSeats);

      // Use the badge variants we've defined
      let badgeVariant: "success" | "destructive" | "warning" = "success";

      if (availableSeats === 0) {
        badgeVariant = "destructive";
      } else if (availableSeats < maxSeats * 0.2) {
        badgeVariant = "warning";
      }

      return (
        <Badge variant={badgeVariant}>
          {availableSeats}/{maxSeats}
        </Badge>
      );
    },
  },
  {
    accessorKey: "isPublished",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Visibility" />
    ),
    cell: ({ row }) => {
      const value = row.getValue("isPublished");
      // Convert boolean to string display value
      const isPublished = value === true ? "Published" : "Private";

      const variant = isPublished === "Published" ? "published" : "private";

      return <Badge variant={variant}>{isPublished}</Badge>;
    },
  },
  {
    accessorKey: "isDeleted",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Status" />
    ),
    cell: ({ row }) => {
      const isDeleted = row.getValue("isDeleted");

      return (
        <div className="flex items-center">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${
              isDeleted
                ? "bg-red-100 text-red-800"
                : "bg-green-100 text-green-800"
            }`}
          >
            {isDeleted ? "Deleted" : "Active"}
          </span>
        </div>
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
      return dayjs(date).format("HH:mm, D MMMM YYYY ");
    },
  },
  {
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
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem>Edit Course</DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              Delete Course
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
