"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MapPin, Clock, ArrowRight } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { format } from "date-fns";

// Define interfaces for type safety
interface Training {
  _id?: string;
  courseId?: string;
  courseName: string;
  description?: string;
  imageUrl?: string;
  location: string;
  date: string | { $date: string };
  hours: number;
}

interface User {
  id: string;
  traderId: string;
}

interface UserData {
  trainings: Training[];
}

export default function MyCoursesClient() {
  const { data: session } = useSession();
  const user = session?.user;

  // Function to fetch user data with trainings
  const fetchUserData = async (): Promise<UserData> => {
    if (!user?.id) {
      throw new Error("User ID not available");
    }
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trader/${user.id}`,
      {
        headers: {
          Authorization: `Bearer ${user?.accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.data;
  };

  // Fetch user data with trainings using React Query
  const {
    data: userData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["userData"],
    queryFn: fetchUserData,
    enabled: !!user?.traderId, // Only run query if user ID exists
  });

  // Function to safely get course ID
  const getCourseId = (course: Training): string | null => {
    if (!course) return null;

    // Use courseId if available
    if (course.courseId) {
      return course.courseId;
    }

    // Fall back to _id
    if (course._id) {
      return course._id;
    }

    return null;
  };

  // Format date function
  const formatDate = (dateInput: string | { $date: string }): string => {
    if (!dateInput) return "Date not specified";

    // Handle MongoDB date format
    const dateString =
      typeof dateInput === "object" && "$date" in dateInput
        ? dateInput.$date
        : dateInput;

    const date = new Date(dateString);
    return format(date, "MMM d, yyyy");
  };
  // Loading state
  if (isLoading) {
    return (
      <div className="container mx-auto px-6 py-6 flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Spinner color={"hero"} />
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p>Error loading courses: {(error as Error).message}</p>
          <Button
            variant="outline"
            className="mt-2"
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!userData?.trainings || userData.trainings.length === 0) {
    return (
      <div className="container mx-auto px-6 py-6">
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
            <div className="space-y-1">
              <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
              <p className="text-sm text-muted-foreground">
                Track your enrolled on-site training courses
              </p>
            </div>
          </div>
          <Separator className="my-2" />
        </div>

        <div className="flex flex-col items-center justify-center h-64 bg-muted/20 rounded-lg">
          <p className="text-muted-foreground">
            You haven't enrolled in any courses yet.
          </p>
          <Link href="/courses">
            <Button className="mt-4" variant={"hero"}>
              Browse Available Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-6 py-6">
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4">
          <div className="space-y-1">
            <h2 className="text-3xl font-bold tracking-tight">My Courses</h2>
            <p className="text-sm text-muted-foreground">
              Track your on-site training courses
            </p>
          </div>
        </div>
        <Separator className="my-2" />
      </div>

      <Tabs defaultValue="grid" className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <div className="flex justify-center items-center text-sm text-muted-foreground">
            <p>
              Showing {userData.trainings.length} course
              {userData.trainings.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userData.trainings.map((course) => (
              <Card
                key={getCourseId(course) || Math.random().toString()}
                className="overflow-hidden flex flex-col pt-0 pb-8"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={course.imageUrl || "/placeholder.svg"}
                    alt={course.courseName}
                    className="object-cover w-full h-full"
                  />
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">
                      {course.courseName}
                    </CardTitle>
                  </div>
                </CardHeader>

                <CardContent className="py-2 flex-grow">
                  {/* Course Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                    {course.description || "No description available."}
                  </p>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{course.location}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span>{formatDate(course.date)}</span>
                    </div>

                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span>{course.hours} hours</span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Link
                    href={`/courses/${getCourseId(course)}`}
                    className="w-full"
                  >
                    <Button className="w-full" variant={"hero"}>
                      <ArrowRight className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-4">
            {userData.trainings.map((course) => (
              <Card
                key={getCourseId(course) || Math.random().toString()}
                className="py-0"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-48 h-32 md:h-auto flex-shrink-0 overflow-hidden">
                    <img
                      src={course.imageUrl || "/placeholder.svg"}
                      alt={course.courseName}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-grow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">
                          {course.courseName}
                        </h3>
                      </div>
                    </div>

                    {/* Course Description */}
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-2">
                      {course.description || "No description available."}
                    </p>

                    <div className="grid md:grid-cols-3 gap-y-2 gap-x-4 mt-4">
                      <div className="flex items-start">
                        <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{course.location}</span>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">
                          {formatDate(course.date)}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{course.hours} hours</span>
                      </div>
                    </div>

                    <div className="mt-4 flex justify-end">
                      <Link href={`/course/${getCourseId(course)}`}>
                        <Button variant={"hero"} size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
