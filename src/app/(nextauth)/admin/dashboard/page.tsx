import DashboardCardComponents from "@/components/dashboard/DashboardCard";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { DashboardOverview } from "@/components/dashboard/DashboardOverview";
import { DashbaordRecentSales } from "@/components/dashboard/DashboardRecentSales";

export default function DashboardPage() {
  return (
    <div className="container mx-auto px-6 py-6">
      <DashboardHeader />
      <div className="flex flex-1 flex-col gap-4 ">
        <DashboardCardComponents />
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
        <div className="flex w-full gap-4">
          <div className="w-1/2">
            <DashboardOverview />
          </div>
          <div className="w-1/2">
            <DashbaordRecentSales />
          </div>
        </div>
      </div>
    </div>
  );
}
