import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardCardComponents() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card className="w-full py-0">
        <CardHeader className="pt-6">
          <CardTitle>Total Revenue</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last month
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full py-0">
        <CardHeader className="pt-6">
          <CardTitle>Subscriptions</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">+2,350</div>
            <p className="text-xs text-muted-foreground">
              +18.2% from last month
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full py-0">
        <CardHeader className="pt-6">
          <CardTitle>Active Users</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">+12,234</div>
            <p className="text-xs text-muted-foreground">
              +4.3% from last month
            </p>
          </div>
        </CardContent>
      </Card>
      <Card className="w-full py-0">
        <CardHeader className="pt-6">
          <CardTitle>Conversion Rate</CardTitle>
        </CardHeader>
        <CardContent className="px-0">
          <div className="p-6 pt-0">
            <div className="text-2xl font-bold">3.8%</div>
            <p className="text-xs text-muted-foreground">
              +1.1% from last month
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
