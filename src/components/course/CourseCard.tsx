"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

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

// Mock data for courses
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
    imageUrl: "/placeholder.svg",
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
    imageUrl: "/placeholder.svg",
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
    imageUrl: "/placeholder.svg",
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
    imageUrl: "/placeholder.svg",
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
  "default" | "secondary" | "updated" | "new" | "outline"
> = {
  "New Course": "new",
  "Recently Updated": "updated",
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {filteredCourses.map((course) => {
        const tags = parseCourseTag(course.courseTag);
        const hasImageError = imageErrors[course.courseId];
        const imageSrc = hasImageError
          ? "/image_placeholder.webp"
          : course.imageUrl || "/image_placeholder.webp";

        return (
          <div
            key={course.courseId}
            className="shadow-lg rounded-lg overflow-hidden h-full flex flex-col transform transition duration-300 hover:shadow-xl hover:scale-[1.02]"
          >
            <div className="relative overflow-hidden bg-gray-100 h-48">
              <img
                src={imageSrc}
                alt={`Image of the course ${course.courseName}`}
                onError={() => handleImageError(course.courseId)}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-110"
                loading="lazy"
              />
            </div>
            <div className="p-4 flex flex-col gap-2 flex-grow">
              <div className="min-h-16 flex items-start">
                <h2 className="text-lg font-bold line-clamp-2 hover:text-[#FDAB04] transition-colors duration-300">
                  {course.courseName}
                </h2>
              </div>

              {tags.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {tags.map((tag, index) => (
                    <Badge
                      key={index}
                      variant={badgeVariants[tag] || "secondary"}
                      className="transition-all duration-300 hover:opacity-80"
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <div className="flex gap-2 mt-auto">
                <Calendar className="text-[#9196a1]" />
                <p className="text-[#9196a1] text-sm pt-1">
                  {formatDate(course.courseDate)}
                </p>
              </div>
              <hr className="my-1" />
              {isAdmin ? (
                <div className="mt-2">
                  <p className="text-sm text-gray-600 mb-2">
                    Enrollment: {course.currentEnrollment} /{" "}
                    {course.enrollmentLimit}
                  </p>
                  <Progress
                    value={
                      (course.currentEnrollment / course.enrollmentLimit) * 100
                    }
                    className="h-2 transition-all duration-500"
                  />
                </div>
              ) : (
                <div className="flex justify-between items-center mt-2">
                  {(() => {
                    const now = new Date();
                    const startDate = new Date(
                      course.applicationPeriod.startDate
                    );
                    const endDate = new Date(course.applicationPeriod.endDate);
                    const isRegistered = registeredCourses.includes(
                      course.courseId
                    );

                    if (now < startDate) {
                      return (
                        <Button disabled className="opacity-70">
                          Not open
                        </Button>
                      );
                    }

                    if (isRegistered) {
                      return (
                        <p className="text-green-500 font-semibold">
                          Already registered
                        </p>
                      );
                    }

                    if (now >= startDate && now <= endDate) {
                      return (
                        <Link
                          href={`/courses/${course.courseId}/onlineregister`}
                        >
                          <Button className="bg-black hover:bg-gray-800 transition-colors duration-300">
                            Register
                          </Button>
                        </Link>
                      );
                    }

                    return (
                      <Button disabled className="opacity-70">
                        Registration closed
                      </Button>
                    );
                  })()}
                  <p className="text-lg font-bold">{course.price} ฿</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CourseCard;
