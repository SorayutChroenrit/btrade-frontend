"use client";

import { Button } from "@/components/ui/button";
import { CalendarIcon, DownloadIcon } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useSession } from "next-auth/react";

interface DashboardHeaderProps {
  onTimeframeChange: (timeframe: string) => void;
  currentTimeframe: string;
}

export default function DashboardHeader({
  onTimeframeChange,
  currentTimeframe,
}: DashboardHeaderProps) {
  const { data: session } = useSession();
  const user = session?.user;

  return (
    <div className="mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
        <div className="space-y-1">
          <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
          <p className="text-sm text-muted-foreground">
            Track your business metrics and performance
          </p>
        </div>

        <div className="flex items-center space-x-2 mt-4 sm:mt-0">
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200 px-2 py-1"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full mr-1 inline-block"></span>
            Live Data
          </Badge>

          <Select
            defaultValue={currentTimeframe}
            onValueChange={onTimeframeChange}
          >
            <SelectTrigger className="w-[180px] border-slate-200">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-slate-500" />
                <SelectValue placeholder="Select timeframe" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="last7days">Last 7 days</SelectItem>
                <SelectItem value="last30days">Last 30 days</SelectItem>
                <SelectItem value="last3month">Last 3 months</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Separator className="my-2" />
    </div>
  );
}
