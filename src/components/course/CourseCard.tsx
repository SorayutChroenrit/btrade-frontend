"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface ApplicationPeriod {
  startDate: string;
  endDate: string;
}

interface Course {
  courseId: string;
  courseName: string;
  price: string;
  description: string;
  applicationPeriod: ApplicationPeriod;
  courseDate: string;
  location: string;
  imageUrl?: string;
  courseTag: string | string[];
  isPublished: boolean;
  currentEnrollment: number;
  enrollmentLimit: number;
}

// Mock data for courses (this would typically come from an API)
const mockCourses: Course[] = [
  {
    courseId: "course-1",
    courseName: "Introduction to Web Development",
    price: "5,000",
    description: "Learn the basics of HTML, CSS, and JavaScript.",
    applicationPeriod: {
      startDate: "2025-02-01T00:00:00Z",
      endDate: "2025-04-01T00:00:00Z",
    },
    courseDate: "2025-05-15T09:00:00Z",
    location: "Bangkok",
    imageUrl:
      "https://firstbenefits.org/wp-content/uploads/2017/10/placeholder-1024x1024.png",
    courseTag: ["New Course", "Web Development"],
    isPublished: true,
    currentEnrollment: 15,
    enrollmentLimit: 30,
  },
  {
    courseId: "course-2",
    courseName:
      "Advanced React Techniques for Modern Web Applications and User Interfaces",
    price: "7,500",
    description:
      "Master React hooks, context API, and performance optimization.",
    applicationPeriod: {
      startDate: "2025-01-15T00:00:00Z",
      endDate: "2025-03-15T00:00:00Z",
    },
    courseDate: "2025-04-10T09:00:00Z",
    location: "Online",
    imageUrl:
      "https://firstbenefits.org/wp-content/uploads/2017/10/placeholder-1024x1024.png",
    courseTag: ["Recently Updated", "React"],
    isPublished: true,
    currentEnrollment: 25,
    enrollmentLimit: 40,
  },
  {
    courseId: "course-3",
    courseName: "UX/UI Design Fundamentals",
    price: "6,000",
    description: "Learn user-centered design principles and prototyping.",
    applicationPeriod: {
      startDate: "2025-03-01T00:00:00Z",
      endDate: "2025-05-01T00:00:00Z",
    },
    courseDate: "2025-06-01T09:00:00Z",
    location: "Chiang Mai",
    imageUrl:
      "https://firstbenefits.org/wp-content/uploads/2017/10/placeholder-1024x1024.png",
    courseTag: ["Design", "UX/UI"],
    isPublished: true,
    currentEnrollment: 10,
    enrollmentLimit: 20,
  },
  {
    courseId: "course-4",
    courseName: "Full Stack Development Bootcamp",
    price: "12,000",
    description: "Comprehensive training in frontend and backend technologies.",
    applicationPeriod: {
      startDate: "2024-12-01T00:00:00Z",
      endDate: "2025-02-01T00:00:00Z",
    },
    courseDate: "2025-03-15T09:00:00Z",
    location: "Bangkok",
    imageUrl:
      "https://firstbenefits.org/wp-content/uploads/2017/10/placeholder-1024x1024.png",
    courseTag: ["Bootcamp", "Full Stack"],
    isPublished: true,
    currentEnrollment: 30,
    enrollmentLimit: 30,
  },
];

// Mock user data
const mockUserData = {
  role: "user", // Change to "admin" to see admin view
  trainingInfo: [
    { courseId: "course-4" }, // User is already registered for this course
  ],
};

const badgeVariants: Record<
  string,
  "default" | "secondary" | "outline" | "destructive"
> = {
  "New Course": "default",
  "Recently Updated": "secondary",
  Bootcamp: "destructive",
  "Web Development": "outline",
  React: "outline",
  Design: "outline",
  "UX/UI": "outline",
  "Full Stack": "outline",
};

const parseCourseTag = (tag: string | string[]): string[] => {
  if (Array.isArray(tag)) {
    if (
      tag.length === 1 &&
      typeof tag[0] === "string" &&
      tag[0].startsWith("[")
    ) {
      try {
        return JSON.parse(tag[0]);
      } catch {
        return [];
      }
    }
    return tag;
  }
  return [tag];
};

const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// Format application period dates
const formatApplicationPeriod = (
  startDate: string,
  endDate: string
): string => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  const startFormatted = start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });

  const endFormatted = end.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return `${startFormatted} - ${endFormatted}`;
};

interface CourseCardProps {
  activeTags?: string[];
}

const CourseCard: React.FC<CourseCardProps> = ({ activeTags = [] }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [registeredCourses, setRegisteredCourses] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Simulate API loading delay
    const timer = setTimeout(() => {
      // Filter published courses from mock data
      const publishedCourses = mockCourses.filter(
        (course) => course.isPublished
      );
      setCourses(publishedCourses);
      setFilteredCourses(publishedCourses);

      // Set user data from mock
      const userInfo = mockUserData;
      const trainingInfo = userInfo.trainingInfo || [];
      const registeredCourseIds = trainingInfo.map(
        (training: any) => training.courseId
      );
      setRegisteredCourses(registeredCourseIds);

      setIsAdmin(userInfo.role === "admin");
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (activeTags.length === 0) {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter((course) => {
        const courseTags = parseCourseTag(course.courseTag);
        return activeTags.some((tag) => courseTags.includes(tag));
      });
      setFilteredCourses(filtered);
    }
  }, [activeTags, courses]);

  const handleImageError = (courseId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [courseId]: true,
    }));
  };

  const getRegistrationStatus = (course: Course) => {
    const now = new Date();
    const startDate = new Date(course.applicationPeriod.startDate);
    const endDate = new Date(course.applicationPeriod.endDate);
    const isRegistered = registeredCourses.includes(course.courseId);
    const isFull = course.currentEnrollment >= course.enrollmentLimit;

    if (isRegistered) {
      return {
        status: "registered",
        text: "Already Registered",
        element: (
          <Button
            variant="outline"
            className="w-full bg-green-50 text-green-600 border-green-200 hover:bg-green-100 hover:text-green-700"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Enrolled
          </Button>
        ),
      };
    }

    if (isFull) {
      return {
        status: "full",
        text: "Course Full",
        element: (
          <Button disabled className="w-full opacity-70">
            Course Full
          </Button>
        ),
      };
    }

    if (now < startDate) {
      return {
        status: "upcoming",
        text: `Registration opens ${formatDate(
          course.applicationPeriod.startDate
        )}`,
        element: (
          <Button disabled className="w-full opacity-70">
            Coming Soon
          </Button>
        ),
      };
    }

    if (now >= startDate && now <= endDate) {
      return {
        status: "open",
        text: `Register by ${formatDate(course.applicationPeriod.endDate)}`,
        element: (
          <Link
            href={`/courses/${course.courseId}/onlineregister`}
            className="w-full"
          >
            <Button className="w-full bg-black hover:bg-gray-800 transition-colors duration-300">
              Register Now
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ),
      };
    }

    return {
      status: "closed",
      text: "Registration closed",
      element: (
        <Button disabled className="w-full opacity-70">
          Registration Closed
        </Button>
      ),
    };
  };

  // Function to get a color for the seats remaining label
  const getSeatsColor = (course: Course) => {
    const percentFull =
      (course.currentEnrollment / course.enrollmentLimit) * 100;
    if (percentFull >= 90) return "text-red-500";
    if (percentFull >= 70) return "text-amber-500";
    return "text-green-600";
  };

  if (loading) return <p>Loading courses...</p>;
  if (filteredCourses.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-lg text-gray-500">
          No courses match your current filters.
        </p>
        {activeTags.length > 0 && (
          <p className="text-sm text-gray-400 mt-2">
            Try adjusting your filter criteria.
          </p>
        )}
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredCourses.map((course) => {
          const tags = parseCourseTag(course.courseTag);
          const hasImageError = imageErrors[course.courseId];
          const imageSrc = hasImageError
            ? "/image_placeholder.webp"
            : course.imageUrl || "/image_placeholder.webp";
          const registrationStatus = getRegistrationStatus(course);
          const seatsRemaining =
            course.enrollmentLimit - course.currentEnrollment;
          const seatsColor = getSeatsColor(course);

          return (
            <Card
              key={course.courseId}
              className="overflow-hidden h-full flex flex-col shadow-md hover:shadow-xl transition-all duration-300"
            >
              <div className="relative overflow-hidden bg-gray-100 h-48 group">
                <img
                  src={imageSrc}
                  alt={`Image of the course ${course.courseName}`}
                  onError={() => handleImageError(course.courseId)}
                  className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                  loading="lazy"
                />
                <div className="absolute top-2 right-2 flex flex-col gap-1">
                  {tags
                    .filter(
                      (tag) =>
                        tag === "New Course" || tag === "Recently Updated"
                    )
                    .map((tag, index) => (
                      <Badge
                        key={index}
                        variant={badgeVariants[tag] || "secondary"}
                        className="shadow-sm"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>
                <div className="absolute bottom-2 right-2">
                  <Badge
                    variant="outline"
                    className="bg-white bg-opacity-90 shadow-sm"
                  >
                    {course.location}
                  </Badge>
                </div>
              </div>

              <CardHeader className="p-4 pb-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <h2 className="text-lg font-bold line-clamp-2 hover:text-[#FDAB04] transition-colors duration-300 cursor-pointer">
                      {course.courseName}
                    </h2>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>{course.courseName}</p>
                  </TooltipContent>
                </Tooltip>

                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                  {course.description}
                </p>
              </CardHeader>

              <CardContent className="p-4 pt-2 pb-0 flex-grow">
                <div className="flex flex-wrap gap-1 mb-3">
                  {tags
                    .filter(
                      (tag) =>
                        tag !== "New Course" && tag !== "Recently Updated"
                    )
                    .map((tag, index) => (
                      <Badge
                        key={index}
                        variant={badgeVariants[tag] || "outline"}
                        className="transition-all duration-300 hover:opacity-80"
                      >
                        {tag}
                      </Badge>
                    ))}
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Course date: {formatDate(course.courseDate)}</span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>
                      Registration:{" "}
                      {formatApplicationPeriod(
                        course.applicationPeriod.startDate,
                        course.applicationPeriod.endDate
                      )}
                    </span>
                  </div>

                  <div className="flex items-center text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{course.location}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Users className="h-4 w-4 mr-2" />
                      <span>
                        {course.currentEnrollment}/{course.enrollmentLimit}{" "}
                        enrolled
                      </span>
                    </div>
                    {registrationStatus.status === "open" && (
                      <span className={seatsColor + " text-sm font-medium"}>
                        {seatsRemaining}{" "}
                        {seatsRemaining === 1 ? "seat" : "seats"} left
                      </span>
                    )}
                  </div>

                  {!isAdmin && (
                    <div className="mt-2">
                      <Progress
                        value={
                          (course.currentEnrollment / course.enrollmentLimit) *
                          100
                        }
                        className="h-2 transition-all duration-500"
                      />
                    </div>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 mt-4 flex justify-between items-center">
                <p className="text-xl font-bold text-[#FDAB04]">
                  {course.price} ฿
                </p>
                {!isAdmin && registrationStatus.element}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </TooltipProvider>
  );
};

export default CourseCard;
