"use client";

import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Users,
  Clock,
  MapPin,
  Tag,
  DollarSign,
} from "lucide-react";
import { CourseData } from "@/lib/types";

interface ViewCourseProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  course: CourseData | null;
  onEdit: () => void;
}

// Course tag mapping for display
const courseTagLabels: Record<string, string> = {
  programming: "Programming",
  design: "Design",
  business: "Business",
  marketing: "Marketing",
  science: "Science",
  language: "Language",
  math: "Mathematics",
  other: "Other",
};

export function ViewCourseDialog({
  open,
  onOpenChange,
  course,
  onEdit,
}: ViewCourseProps) {
  if (!course) return null;

  const formatDate = (date: any) => {
    try {
      if (!date) return "N/A";

      const dateValue = dayjs(date.$date || date);

      if (!dateValue.isValid()) {
        return "Invalid date";
      }

      return dateValue.format("MMM D, YYYY");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course.courseName}</DialogTitle>
          <DialogDescription>
            {course.courseCode} • {course.availableSeats} seats available
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {course.imageUrl && (
            <div className="w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={course.imageUrl}
                alt={course.courseName}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          <div>
            <h3 className="text-lg font-medium">Description</h3>
            <p className="text-gray-700 mt-1">{course.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Course Period
              </h3>
              <p className="text-gray-700">
                {formatDate(course.startDate)} - {formatDate(course.endDate)}
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Course Date
              </h3>
              <p className="text-gray-700">{formatDate(course.courseDate)}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4" /> Price
              </h3>
              <p className="text-gray-700">฿{course.price.toLocaleString()}</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" /> Hours
              </h3>
              <p className="text-gray-700">{course.hours} hours</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4" /> Seats
              </h3>
              <p className="text-gray-700">
                {course.availableSeats} available / {course.maxSeats} total
              </p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Location
              </h3>
              <p className="text-gray-700">
                {course.location || "No location specified"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Tag className="h-4 w-4" /> Tags
            </h3>
            <div className="flex flex-wrap gap-1 mt-2">
              {course.courseTags.map((tag) => (
                <Badge key={tag} variant="secondary">
                  {courseTagLabels[tag] || tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={onEdit} variant="hero">
            Edit Course
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
