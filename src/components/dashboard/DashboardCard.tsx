"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardData } from "@/hooks/DashboardData";

interface DashboardCardComponentsProps {
  dashboardData: DashboardData | null;
}

export default function DashboardCardComponents({
  dashboardData,
}: DashboardCardComponentsProps) {
  if (!dashboardData) return null;

  const { totalRevenue, coursePurchases, topCourse } = dashboardData;

  // Helper function to format numbers with commas
  const formatNumber = (num: number): string => {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  // Helper to determine if change is positive (for styling)
  const isPositive = (percent: string): boolean => {
    return !percent.startsWith("-");
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Card className="w-full py-0">
        <CardHeader className="pt-6">
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">
              {`${totalRevenue.currency === "THB" ? "฿" : "$"}${
                totalRevenue.amount
              }`}
            </div>
            <p
              className={`text-xs ${
                isPositive(totalRevenue.changePercent)
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {isPositive(totalRevenue.changePercent) ? "+" : ""}
              {totalRevenue.changePercent}% from last period
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full py-0">
        <CardHeader className="pt-6">
          <CardTitle>Course Purchases</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">
              +{formatNumber(coursePurchases.count)}
            </div>
            <p
              className={`text-xs ${
                isPositive(coursePurchases.changePercent)
                  ? "text-green-600"
                  : "text-red-600"
              }`}
            >
              {isPositive(coursePurchases.changePercent) ? "+" : ""}
              {coursePurchases.changePercent}% from last period
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="w-full py-0">
        <CardHeader className="pt-6">
          <CardTitle>Top Course</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="p-6 pt-0">
            <div className="text-2xl font-medium truncate">
              {topCourse.name}
            </div>
            <p className="text-xs text-muted-foreground">
              {topCourse.purchaseCount} purchases
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
