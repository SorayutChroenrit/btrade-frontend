import CourseHeader from "@/components/course/DashboardHeader";
import { DataTable } from "@/components/ui/data-table";
import { columns, Payment } from "@/components/user/CourseColumns";
async function getData(): Promise<Payment[]> {
  // Fetch data from your API here.
  return [
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "m@example.com",
    },
    {
      id: "728ed52f",
      amount: 100,
      status: "pending",
      email: "masdas@example.com",
    },

    // ...
  ];
}

export default async function AdminApprovalsPage() {
  const data = await getData();

  return (
    <div className="container mx-auto px-6 py-6">
      <CourseHeader />
      <div className="flex flex-1 flex-col gap-4">
        <div className="container mx-auto ">
          <DataTable columns={columns} data={data} />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </div>
  );
}
