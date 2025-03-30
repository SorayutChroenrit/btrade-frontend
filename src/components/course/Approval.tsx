"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { columns } from "./ApprovalColumns";
import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function EnrollmentApprovalPage() {
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user;

  // Fetch function for validated enrollments
  const fetchValidatedEnrollments = async () => {
    if (!user?.accessToken) {
      throw new Error("Authentication required");
    }

    try {
      // Fetch validated enrollments directly from the API
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enrollment/validated-enrollments`,
        {
          headers: {
            Authorization: `Bearer ${user.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Map the API response to the expected format for the DataTable
      return response.data.data.map((item) => ({
        _id: item.enrollmentId,
        userId: item.trader.userId,
        courseId: item.course.id,
        status: item.status,
        enrollDate: item.course.date, // Using course date if enrollDate isn't available
        trader: {
          _id: item.trader.id,
          name: item.trader.name,
          email: item.trader.email,
          phoneNumber: item.trader.phoneNumber,
        },
        course: {
          _id: item.course.id,
          courseName: item.course.name,
          courseCode: item.course.id.substring(0, 6), // Using part of the ID as code if no code is provided
          description: item.course.location, // Using location as description
        },
      }));
    } catch (error) {
      console.error("Error fetching enrollment data:", error);
      throw error;
    }
  };

  // Use React Query to fetch the data, but only when session is loaded
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["validatedEnrollments", user?.accessToken],
    queryFn: fetchValidatedEnrollments,
    enabled: !!user?.accessToken, // Only run query when accessToken is available
  });

  // Listen for enrollment update events to refresh the data
  useEffect(() => {
    const handleEnrollmentUpdate = () => {
      refetch();
    };

    window.addEventListener("enrollment-updated", handleEnrollmentUpdate);

    return () => {
      window.removeEventListener("enrollment-updated", handleEnrollmentUpdate);
    };
  }, [refetch]);

  // Handle session loading state
  if (sessionStatus === "loading") {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="large" color={"hero"} />
        <span className="ml-2">Loading session...</span>
      </div>
    );
  }

  // Handle unauthenticated state
  if (sessionStatus === "unauthenticated") {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Please sign in to view enrollments</p>
      </div>
    );
  }

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
          Error loading validated enrollments:{" "}
          {error instanceof Error ? error.message : String(error)}
        </p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-end items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {data?.length || 0} validated enrollments awaiting approval
          </div>
          <div className="flex items-center gap-2">
            {isFetching && <Spinner size="small" color={"hero"} />}
            <Button
              onClick={() => refetch()}
              variant="outline"
              disabled={isFetching}
            >
              {isFetching ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </div>
      </div>

      {data?.length === 0 ? (
        <div className="flex justify-center items-center h-64 border rounded-md bg-muted/20">
          <p className="text-muted-foreground">
            No validated enrollments waiting for approval
          </p>
        </div>
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}
    </div>
  );
}
