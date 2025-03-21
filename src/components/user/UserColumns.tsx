"use client";

import { ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "../general/ColumnsHeader";
import { UserData } from "@/lib/types";
import dayjs from "dayjs";

export const columns: ColumnDef<UserData>[] = [
  {
    id: "rowNumber",
    header: ({ column }) => <DataTableColumnHeader column={column} title="#" />,
    cell: ({ row }) => {
      return row.index + 1;
    },
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

      if (!date) {
        return (
          <span className="text-muted-foreground italic">
            Not logged in yet
          </span>
        );
      }

      return dayjs(date).format("HH:mm, D MMMM YYYY");
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
