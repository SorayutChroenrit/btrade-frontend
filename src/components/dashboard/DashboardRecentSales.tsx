"use client";

import { useState, useMemo } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { DataTablePagination } from "../general/Pagination";

interface RecentSale {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  courseName: string;
  currency: string;
  date: string;
}

interface DashboardRecentSalesProps {
  recentSales: RecentSale[];
  salesCount: number;
}

export function DashbaordRecentSales({
  recentSales,
  salesCount,
}: DashboardRecentSalesProps) {
  // Extract customer initials from email if name is empty
  const getInitials = (name: string, email: string): string => {
    // If name exists, use first letter of first name and last name
    if (name && name.trim().length > 0) {
      const parts = name.split(" ");
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (
        parts[0].charAt(0) + parts[parts.length - 1].charAt(0)
      ).toUpperCase();
    }

    // Fallback to email username first character
    const emailUsername = email.split("@")[0];
    return emailUsername.charAt(0).toUpperCase();
  };

  // Format date nicely
  const formatDate = (dateString: string): string => {
    return dayjs(dateString).format("D MMMM YYYY , HH:mm");
  };

  const columnHelper = createColumnHelper<RecentSale>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("customerEmail", {
        header: "Customer",
        cell: ({ row }) => (
          <div className="flex items-center space-x-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {getInitials(
                  row.original.customerName,
                  row.original.customerEmail
                )}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-xs text-muted-foreground">
                {row.original.customerEmail}
              </p>
            </div>
          </div>
        ),
      }),
      columnHelper.accessor("courseName", {
        header: "Course",
        cell: ({ getValue }) => <p className="text-sm">{getValue()}</p>,
      }),
      columnHelper.accessor("date", {
        header: "Date",
        cell: ({ getValue }) => (
          <p className="text-sm">{formatDate(getValue())}</p>
        ),
      }),
      columnHelper.accessor("amount", {
        header: () => <div className="text-right">Amount</div>,
        cell: ({ row }) => (
          <p className="text-sm font-medium text-right">
            {row.original.currency === "THB" ? "฿" : "$"}
            {row.original.amount}
          </p>
        ),
      }),
    ],
    []
  );

  // Initialize TanStack Table with shadcn/ui compatible configuration
  const table = useReactTable({
    data: recentSales,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <Card className="py-8">
      <CardHeader className="pb-2">
        <CardTitle>Recent Course Purchases</CardTitle>
        <p className="text-sm text-muted-foreground">
          You made {salesCount} course sales this month.
        </p>
      </CardHeader>
      <CardContent>
        {recentSales.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left">
                    {table.getHeaderGroups().map((headerGroup) =>
                      headerGroup.headers.map((header) => (
                        <th key={header.id} className="pb-2 font-medium">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      ))
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {table.getRowModel().rows.map((row) => (
                    <tr key={row.id} className="py-3">
                      {row.getVisibleCells().map((cell) => (
                        <td key={cell.id} className="py-3">
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* shadcn/ui DataTablePagination component */}
            <DataTablePagination table={table} />
          </>
        ) : (
          <div className="flex items-center justify-center h-24 text-muted-foreground">
            No recent sales data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
