"use client";

import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";

interface RecentSale {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: string;
  courseName: string;
  currency: string;
  date: string;
}

interface ChartDataItem {
  month: string;
  revenue: number;
  currency: string;
}

interface TopCourse {
  id: string;
  name: string;
  revenue: string;
  purchaseCount: number;
}

export interface DashboardData {
  totalRevenue: {
    amount: string;
    currency: string;
    changePercent: string;
  };
  coursePurchases: {
    count: number;
    changePercent: string;
  };
  topCourse: TopCourse;
  overview: ChartDataItem[];
  recentSales: {
    count: number;
    items: RecentSale[];
  };
  courseRevenue: {
    name: string;
    value: number;
    color: string;
  }[];
}

export function useDashboardData(timeframe: string = "last7days") {
  const { data: session, status } = useSession();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      // Only proceed if authentication is complete and successful
      if (status === "loading") {
        return;
      }

      if (status === "unauthenticated" || !session?.user?.accessToken) {
        setLoading(false);
        setError(new Error("Authentication required to view dashboard data"));
        return;
      }

      try {
        setLoading(true);
        // Convert timeframe to days
        let days = "7";
        if (timeframe === "last30days") days = "30";
        if (timeframe === "last3month") days = "90";

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/dashboard?days=${days}`,
          {
            headers: {
              Authorization: `Bearer ${session.user.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch dashboard data");
        }

        const result = await response.json();
        setData(result.data);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [timeframe, session, status]);

  return { data, loading, error };
}
