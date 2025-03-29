"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { LayoutGrid, Sparkles, Clock } from "lucide-react";

export type CourseFilterType = "all" | "new" | "coming-soon";

interface CourseFilterButtonsProps {
  activeFilter: CourseFilterType;
  onFilterChange: (filter: CourseFilterType) => void;
}

const CourseFilterButtons: React.FC<CourseFilterButtonsProps> = ({
  activeFilter,
  onFilterChange,
}) => {
  return (
    <div className="flex flex-wrap gap-2 mb-6">
      <Button
        variant={activeFilter === "all" ? "hero" : "outline"}
        size="sm"
        onClick={() => onFilterChange("all")}
        className="flex items-center gap-2"
      >
        <LayoutGrid className="h-4 w-4" />
        All Courses
      </Button>

      <Button
        variant={activeFilter === "new" ? "hero" : "outline"}
        size="sm"
        onClick={() => onFilterChange("new")}
        className="flex items-center gap-2"
      >
        <Sparkles className="h-4 w-4" />
        New Courses
      </Button>

      <Button
        variant={activeFilter === "coming-soon" ? "hero" : "outline"}
        size="sm"
        onClick={() => onFilterChange("coming-soon")}
        className="flex items-center gap-2"
      >
        <Clock className="h-4 w-4" />
        Coming Soon
      </Button>
    </div>
  );
};

export default CourseFilterButtons;
