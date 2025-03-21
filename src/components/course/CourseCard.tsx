"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ArrowRight, Calendar, Clock } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseData } from "@/lib/types";

const parseCourseTag = (course: CourseData): string[] => {
  return course.courseTags || [];
};

// Format date to display as DD MMM YYYY
const formatDate = (dateString: string): string => {
  if (!dateString) return "TBD";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch (error) {
    console.error("Date formatting error:", error);
    return "TBD";
  }
};

const CourseCard = () => {
  const [courses, setCourses] = useState<CourseData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await axios.get(
          "http://localhost:20000/api/v1/courses"
        );

        if (
          response.data.status === "Success" &&
          Array.isArray(response.data.data)
        ) {
          // Filter published courses
          const publishedCourses = response.data.data.filter(
            (course: CourseData) => course.isPublished
          );

          setCourses(publishedCourses);
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError(
          axios.isAxiosError(err)
            ? `Error fetching courses: ${
                err.response?.statusText || err.message
              }`
            : (err as Error).message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const handleImageError = (courseId: string) => {
    setImageErrors((prev) => ({
      ...prev,
      [courseId]: true,
    }));
  };

  if (loading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {[1, 2, 3, 4].map((item) => (
          <Card key={item} className="overflow-hidden h-full flex flex-col">
            <Skeleton className="h-48 w-full" />
            <CardHeader className="p-4">
              <Skeleton className="h-6 w-3/4" />
            </CardHeader>
            <CardFooter className="p-4 mt-auto">
              <Skeleton className="h-10 w-full rounded" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-6 text-center border border-red-200">
        <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-red-800">
          Error loading courses
        </h3>
        <p className="text-red-600 mt-1">{error}</p>
        <Button
          variant="outline"
          className="mt-4 border-red-300 text-red-600 hover:bg-red-50"
          onClick={() => window.location.reload()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (courses.length === 0) {
    return (
      <div className="text-center py-8 rounded-lg bg-gray-50 p-6 border border-gray-200">
        <p className="text-lg text-gray-500 font-medium">
          No courses available.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {courses.map((course, index) => {
        const hasImageError = imageErrors[course._id];
        const imageSrc = hasImageError
          ? "https://www.okayama-japan.jp/images/common/thumbs-noimage@2x.webp"
          : course.imageUrl ||
            "https://www.okayama-japan.jp/images/common/thumbs-noimage@2x.webp";

        return (
          <Card
            key={index}
            className="overflow-hidden h-full flex flex-col shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-200 rounded-xl"
          >
            <div className="relative overflow-hidden h-48 group">
              <img
                src={imageSrc}
                alt={`Image of the course ${course.courseName}`}
                onError={() => handleImageError(course._id)}
                className="w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110"
                loading="lazy"
              />
              <div className="absolute bottom-2 right-2 z-20">
                <span className="bg-white/80 text-gray-800 px-2 py-1 rounded-md text-sm font-medium shadow-sm">
                  {course.price.toLocaleString()} ฿
                </span>
              </div>
            </div>

            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-lg line-clamp-2 hover:text-[#FDAB04] transition-colors duration-300">
                {course.courseName}
              </CardTitle>
            </CardHeader>

            <CardContent className="px-4 pt-0 pb-2">
              {/* Course Date */}
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>Course Date: {formatDate(course.courseDate)}</span>
              </div>

              {/* Registration Period */}
              <div className="flex items-center text-sm text-gray-600 mb-3">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  Registration: {formatDate(course.startDate)} -{" "}
                  {formatDate(course.endDate)}
                </span>
              </div>

              <div className="flex flex-wrap gap-1">
                {parseCourseTag(course)
                  .slice(0, 3)
                  .map((tag, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                {parseCourseTag(course).length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{parseCourseTag(course).length - 3} more
                  </Badge>
                )}
              </div>
            </CardContent>

            <CardFooter className="p-4 mt-auto">
              <Link href={`/courses/${course._id}`} className="w-full">
                <Button
                  className="w-full transition-colors duration-300"
                  variant={"hero"}
                >
                  <ArrowRight className="mr-2 h-4 w-4" />
                  View Details
                </Button>
              </Link>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
};

export default CourseCard;
