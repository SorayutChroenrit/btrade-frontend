import CourseDetail from "@/components/course/CourseDetails";
import { Separator } from "@/components/ui/separator";

export default async function BrowseCoursesPage() {
  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">
              Course Details
            </h2>
            <p className="text-sm text-muted-foreground">
              Discover and explore available learning opportunities
            </p>
          </div>
        </div>
        <Separator className="my-2" />
      </div>
      <div className="flex flex-1 flex-col gap-4">
        <div className="container mx-auto ">
          <CourseDetail />
        </div>
        <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
      </div>
    </div>
  );
}
