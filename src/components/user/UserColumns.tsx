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
import { format } from "date-fns";
import { DataTableColumnHeader } from "../general/ColumnsHeader";

// Define the Course type based on your MongoDB schema
export type User = {
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
  createdAt: string;
  updatedAt: string;
};

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "courseName",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Course Name" />
    ),
  },
  {
    accessorKey: "courseCode",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Code" />
    ),
  },
  // {
  //   accessorKey: "startDate",
  //   header: "Start Date",
  //   cell: ({ row }) => {
  //     const date = new Date(row.getValue("startDate"));
  //     return format(date, "MMM d, yyyy");
  //   },
  // },
  // {
  //   accessorKey: "endDate",
  //   header: "End Date",
  //   cell: ({ row }) => {
  //     const date = new Date(row.getValue("endDate"));
  //     return format(date, "MMM d, yyyy");
  //   },
  // },
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
    accessorKey: "hours",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Hours" />
    ),
  },
  {
    accessorKey: "availableSeats",
    header: "Available Seats",
    cell: ({ row }) => {
      const availableSeats = parseInt(row.getValue("availableSeats"));
      const maxSeats = parseInt(row.original.maxSeats);

      let status = "success";
      if (availableSeats === 0) {
        status = "destructive";
      } else if (availableSeats < maxSeats * 0.2) {
        status = "warning";
      }

      return (
        <Badge
          variant={status as "default" | "destructive" | "warning" | "success"}
        >
          {availableSeats}/{maxSeats}
        </Badge>
      );
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
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(course._id)}
            >
              Copy ID
            </DropdownMenuItem>
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
