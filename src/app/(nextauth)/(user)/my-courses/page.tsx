"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Calendar,
  MapPin,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  MoreVertical,
  Filter,
} from "lucide-react";

export default function MyCoursesPage() {
  const [filter, setFilter] = useState("all");

  const courses = [
    {
      id: 1,
      title: "Introduction to React",
      description:
        "Learn the fundamentals of React including hooks, state management, and component lifecycle.",
      instructor: "Sarah Johnson",
      category: "Web Development",
      progress: 6,
      totalSessions: 12,
      completedSessions: 6,
      nextSession: "March 15, 2025 • 10:00 AM",
      location: "Tech Hub, 123 Main Street, Building A, Room 305",
      image: "/placeholder.svg",
      status: "in-progress",
      attendees: 18,
      maxCapacity: 20,
    },
    {
      id: 2,
      title: "Advanced JavaScript Patterns",
      description:
        "Master advanced JS concepts like closures, prototypes, and asynchronous programming.",
      instructor: "Michael Chen",
      category: "Programming",
      progress: 3,
      totalSessions: 10,
      completedSessions: 3,
      nextSession: "March 14, 2025 • 2:00 PM",
      location: "Downtown Learning Center, 456 Oak Avenue, Suite 200",
      image: "/placeholder.svg",
      status: "in-progress",
      attendees: 12,
      maxCapacity: 15,
    },
    {
      id: 3,
      title: "UI/UX Design Principles",
      description:
        "Learn essential design concepts to create beautiful and functional user interfaces.",
      instructor: "Emily Rodriguez",
      category: "Design",
      progress: 8,
      totalSessions: 8,
      completedSessions: 8,
      nextSession: "Completed",
      location: "Creative Space, 789 Elm Street, Floor 2",
      image: "/placeholder.svg",
      status: "completed",
      attendees: 15,
      maxCapacity: 15,
    },
    {
      id: 4,
      title: "Next.js for Production",
      description:
        "Build scalable applications with Next.js, focusing on SSR, SSG, and API routes.",
      instructor: "David Wilson",
      category: "Web Development",
      progress: 0,
      totalSessions: 10,
      completedSessions: 0,
      nextSession: "Starts April 5, 2025 • 9:00 AM",
      location: "Tech Hub, 123 Main Street, Building A, Room 201",
      image: "/placeholder.svg",
      status: "upcoming",
      attendees: 8,
      maxCapacity: 20,
    },
  ];

  // Calculate progress percentage for each course
  const coursesWithPercentage = courses.map((course) => ({
    ...course,
    progressPercentage: Math.round(
      (course.completedSessions / course.totalSessions) * 100
    ),
  }));

  // Filter courses based on selected filter
  const filteredCourses =
    filter === "all"
      ? coursesWithPercentage
      : coursesWithPercentage.filter((course) => course.status === filter);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Courses</h1>
        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 h-4 w-4" />
                Filter
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilter("all")}>
                All Courses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("in-progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilter("upcoming")}>
                Upcoming
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="grid" className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="grid">Grid View</TabsTrigger>
            <TabsTrigger value="list">List View</TabsTrigger>
          </TabsList>

          <div className="text-sm text-muted-foreground">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </div>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCourses.map((course) => (
              <Card
                key={course.id}
                className="overflow-hidden flex flex-col pt-0 pb-8"
              >
                <div className="relative h-48 w-full overflow-hidden">
                  <img
                    src={course.image}
                    alt={course.title}
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute top-2 right-2">
                    <Badge
                      variant={
                        course.status === "completed"
                          ? "success"
                          : course.status === "in-progress"
                          ? "default"
                          : course.status === "upcoming"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {course.status === "completed"
                        ? "Completed"
                        : course.status === "in-progress"
                        ? "In Progress"
                        : course.status === "upcoming"
                        ? "Upcoming"
                        : "Not Started"}
                    </Badge>
                  </div>
                </div>

                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-xl">{course.title}</CardTitle>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Contact Instructor</DropdownMenuItem>
                        <DropdownMenuItem>Request Certificate</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardDescription>
                    Instructor: {course.instructor}
                  </CardDescription>
                </CardHeader>

                <CardContent className="py-2 flex-grow">
                  {course.status !== "upcoming" && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{course.progressPercentage}%</span>
                      </div>
                      <Progress value={course.progressPercentage} />
                      <p className="text-sm mt-1 text-muted-foreground">
                        {course.completedSessions} of {course.totalSessions}{" "}
                        sessions completed
                      </p>
                    </div>
                  )}

                  <div className="space-y-2 text-sm">
                    <div className="flex items-start">
                      <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-2">{course.location}</span>
                    </div>

                    <div className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span>{course.nextSession}</span>
                    </div>

                    <div className="flex items-center">
                      <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                      <span>
                        {course.attendees}/{course.maxCapacity} participants
                      </span>
                    </div>
                  </div>
                </CardContent>

                <CardFooter className="pt-2">
                  <Button
                    className="w-full"
                    variant={
                      course.status === "upcoming" ? "outline" : "default"
                    }
                  >
                    {course.status === "completed" ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        View Certificate
                      </>
                    ) : course.status === "in-progress" ? (
                      <>
                        <Calendar className="mr-2 h-4 w-4" />
                        View Schedule
                      </>
                    ) : (
                      <>
                        <ArrowRight className="mr-2 h-4 w-4" />
                        View Details
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-4">
            {filteredCourses.map((course) => (
              <Card key={course.id} className="py-0">
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-48 h-32 md:h-auto overflow-hidden">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="object-cover w-full h-full"
                    />
                  </div>

                  <div className="flex-grow p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-medium">{course.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Instructor: {course.instructor}
                        </p>
                      </div>

                      <Badge
                        variant={
                          course.status === "completed"
                            ? "completed"
                            : course.status === "in-progress"
                            ? "in-progress"
                            : course.status === "upcoming"
                            ? "upcoming"
                            : "outline"
                        }
                      >
                        {course.status}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-y-2 gap-x-4 mt-4">
                      <div className="flex items-start">
                        <MapPin className="mr-2 h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{course.location}</span>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">{course.nextSession}</span>
                      </div>

                      <div className="flex items-center">
                        <Users className="mr-2 h-4 w-4 flex-shrink-0" />
                        <span className="text-sm">
                          {course.attendees}/{course.maxCapacity} participants
                        </span>
                      </div>

                      {course.status !== "upcoming" && (
                        <div className="flex items-center">
                          <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                          <span className="text-sm">
                            {course.completedSessions}/{course.totalSessions}{" "}
                            sessions completed
                          </span>
                        </div>
                      )}
                    </div>

                    {course.status !== "upcoming" && (
                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{course.progressPercentage}%</span>
                        </div>
                        <Progress value={course.progressPercentage} />
                      </div>
                    )}

                    <div className="mt-4 flex justify-end">
                      <Button
                        size="sm"
                        variant={
                          course.status === "upcoming" ? "outline" : "default"
                        }
                      >
                        {course.status === "completed"
                          ? "View Certificate"
                          : course.status === "in-progress"
                          ? "View Schedule"
                          : "View Details"}
                      </Button>
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
