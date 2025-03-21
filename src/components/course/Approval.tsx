"use client";

import { useQuery } from "@tanstack/react-query";
import { DataTable } from "@/components/ui/data-table";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { columns } from "./ApprovalColumns";

// Fetch function for pending enrollments
const fetchPendingEnrollments = async () => {
  try {
    // Fetch pending enrollments
    const enrollmentsResponse = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/pending-enrollments`
    );
    const enrollments = enrollmentsResponse.data.data;

    // Extract unique course IDs and trader IDs (filter out undefined values)
    const courseIds = [
      ...new Set(enrollments.map((item) => item.courseId).filter(Boolean)),
    ];
    const traderIds = [
      ...new Set(enrollments.map((item) => item.traderId).filter(Boolean)),
    ];

    // Fetch course details
    const coursesResponse = await Promise.all(
      courseIds.map((id) =>
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses/${id}`)
      )
    );
    const courses = coursesResponse.map((res) => res.data.data);

    // Fetch trader details only for valid trader IDs
    const tradersResponse = await Promise.all(
      traderIds.map((id) =>
        axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/traders/${id}`)
      )
    );

    // Extract trader data correctly from API response
    const traders = tradersResponse.map((res) => res.data.data);

    // Map courses and traders to enrollments
    const enrichedEnrollments = enrollments.map((enrollment) => {
      const course = courses.find((c) => c._id === enrollment.courseId);

      // Handle the case where traderId might be undefined
      const trader = enrollment.traderId
        ? traders.find(
            (t) =>
              t.userId === enrollment.traderId || t._id === enrollment.traderId
          )
        : null;

      return {
        ...enrollment,
        course,
        trader,
      };
    });

    return enrichedEnrollments;
  } catch (error) {
    console.error("Error fetching enrollment data:", error);
    throw error;
  }
};

export default function EnrollmentApprovalPage() {
  // Use React Query to fetch the data, including isFetching for refresh state
  const { data, isLoading, isError, error, refetch, isFetching } = useQuery({
    queryKey: ["pendingEnrollments"],
    queryFn: fetchPendingEnrollments,
  });

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
          Error loading pending enrollments:{" "}
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
            {data?.length || 0} pending enrollments
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
          <p className="text-muted-foreground">No pending enrollments</p>
        </div>
      ) : (
        <DataTable columns={columns} data={data || []} />
      )}
    </div>
  );
}
