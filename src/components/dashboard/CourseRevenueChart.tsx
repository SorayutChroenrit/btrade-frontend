"use client";

import { Cell, Pie, PieChart, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

interface CourseRevenueData {
  name: string;
  value: number;
  color: string;
}

interface CourseRevenueChartProps {
  courseData: CourseRevenueData[];
}

export function CourseRevenueChart({ courseData }: CourseRevenueChartProps) {
  // Create the chart configuration
  const chartConfig = {
    revenue: {
      label: "Revenue",
    },
    ...Object.fromEntries(
      courseData.map((course) => [
        course.name,
        {
          label: course.name,
          color: course.color,
        },
      ])
    ),
  } satisfies ChartConfig;

  return (
    <Card className="py-4 h-[500px]">
      <CardHeader className="pb-2">
        <CardTitle>Course Revenue Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        {courseData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto h-[400px] w-full"
          >
            <PieChart className="h-full w-full">
              <Pie
                data={courseData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="45%"
                outerRadius={120}
                innerRadius={0}
                paddingAngle={2}
              >
                {courseData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value: number) => [
                  `฿${value.toLocaleString()}`,
                  "Revenue",
                ]}
              />
              <ChartLegend
                verticalAlign="bottom"
                align="center"
                layout="horizontal"
                content={
                  <ChartLegendContent
                    nameKey="name"
                    className="flex flex-wrap justify-center mt-4 gap-4"
                    iconSize={12}
                    iconType="circle"
                  />
                }
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No course revenue data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}
