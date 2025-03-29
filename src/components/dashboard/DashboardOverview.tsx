"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ChartDataItem {
  month: string;
  revenue: number;
  currency: string;
}

interface DashboardOverviewProps {
  chartData: ChartDataItem[];
}

export function DashboardOverview({ chartData }: DashboardOverviewProps) {
  // Format the chart data to match the expected format
  const formattedChartData = chartData.map((item) => ({
    month: item.month,
    desktop: item.revenue,
  }));

  const chartConfig = {
    desktop: {
      label: "Revenue",
      color: "hsl(40, 98%, 50%)",
    },
  } satisfies ChartConfig;

  return (
    <Card className="h-full w-full py-4">
      <CardHeader className="pb-2">
        <CardTitle>Overview</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden">
        {formattedChartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-full w-full">
            <BarChart accessibilityLayer data={formattedChartData}>
              <CartesianGrid vertical={false} />
              <XAxis
                dataKey="month"
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                tickFormatter={(value) => value.slice(0, 3)}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={10}
                tickFormatter={(value) => `฿${value}`}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
              <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8} />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
