"use client";

import { useState } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardCardComponents from "@/components/dashboard/DashboardCard";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashbaordRecentSales } from "@/components/dashboard/DashboardRecentSales";
import { useDashboardData } from "@/hooks/DashboardData";
import { CourseRevenueChart } from "@/components/dashboard/CourseRevenueChart";

export default function DashboardPage() {
  const [timeframe, setTimeframe] = useState<string>("last7days");
  const { data, loading, error } = useDashboardData(timeframe);

  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
  };

  if (error) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-md">
          <h3 className="font-bold">Error loading dashboard</h3>
          <p>{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <DashboardHeader
        onTimeframeChange={handleTimeframeChange}
        currentTimeframe={timeframe}
      />
      <div className="flex flex-1 flex-col gap-4">
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-32 w-full" />
            ))}
          </div>
        ) : (
          <DashboardCardComponents dashboardData={data} />
        )}

        <div className="flex flex-col md:flex-row w-full gap-4">
          <div className="w-full md:w-1/2">
            {loading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <DashboardOverview chartData={data?.overview || []} />
            )}
          </div>
          <div className="w-full md:w-1/2">
            {loading ? (
              <Skeleton className="h-96 w-full" />
            ) : (
              <CourseRevenueChart courseData={data?.courseRevenue || []} />
            )}
          </div>
        </div>

        <div className="w-full">
          {loading ? (
            <Skeleton className="h-96 w-full" />
          ) : (
            <DashbaordRecentSales
              recentSales={data?.recentSales?.items || []}
              salesCount={data?.recentSales?.count || 0}
            />
          )}
        </div>
      </div>
    </div>
  );
}
