import MyCoursesClient from "@/components/user/My-Course";
import { requireAuth } from "@/lib/auth-utils";

export default async function MyCoursesPage() {
  const user = await requireAuth();
  return <MyCoursesClient />;
}
