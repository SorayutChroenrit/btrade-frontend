"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { format, addDays } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, UploadCloud, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "../ui/label";
import { DateTimePicker24h } from "../ui/24datetimepicker";
import { Toaster, toast } from "sonner";
import { useSession } from "next-auth/react";
import { Spinner } from "../ui/spinner";

// Define the validation schema with refined date validation
const courseSchema = z
  .object({
    courseName: z.string().min(3, "Course name must be at least 3 characters"),
    courseCode: z.string().min(2, "Course code is required"),
    description: z
      .string()
      .min(10, "Description must be at least 10 characters"),
    startDate: z.date({
      required_error: "Start date is required",
    }),
    endDate: z.date({
      required_error: "End date is required",
    }),
    courseDate: z.date({
      required_error: "Course date is required",
    }),
    courseTags: z.array(z.string()).min(1, "Select at least one course tag"),
    location: z.string(),
    price: z.number().positive("Price must be a positive number"),
    hours: z.number().positive("Hours must be a positive number"),
    maxSeats: z.number().positive("Max seats must be a positive number"),
    courseImage: z.instanceof(File),
  })
  .refine(
    (data) => {
      // Ensure endDate is after startDate
      return data.endDate >= data.startDate;
    },
    {
      message: "End date must be after or equal to start date",
      path: ["endDate"],
    }
  )
  .refine(
    (data) => {
      // Ensure courseDate is after endDate
      return data.courseDate > data.endDate;
    },
    {
      message: "Course date must be after end date",
      path: ["courseDate"],
    }
  );

type CourseFormData = z.infer<typeof courseSchema>;

interface CourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateCourseForm({
  open,
  onOpenChange,
  onSuccess,
}: CourseFormProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const [showTagPopover, setShowTagPopover] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const tomorrow = addDays(new Date(), 1);
  // Course tag options
  const courseTags = [
    { value: "newcourse", label: "NewCourse" },
    { value: "recentlyupdated", label: "RecentlyUpdated" },
    { value: "comingsoon", label: "ComingSoon" },
  ];

  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseName: "",
      courseCode: "",
      description: "",
      startDate: tomorrow,
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // Default to 30 days from now
      courseDate: new Date(),
      courseTags: [],
      location: "",
      price: 0,
      hours: 0,
      maxSeats: 0,
      courseImage: undefined,
    },
    mode: "onChange",
  });

  // Get form values for validation
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const courseDate = form.watch("courseDate");

  const isDateAfterEndDate = courseDate > endDate;

  // Create mutation for adding course
  const mutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      // Create a FormData object instead of JSON
      const formData = new FormData();

      // Format dates for API
      const formattedStartDate = format(data.startDate, "yyyy-MM-dd");
      const formattedEndDate = format(data.endDate, "yyyy-MM-dd");
      const formattedCourseDate = format(data.courseDate, "yyyy-MM-dd");

      // Add all your form fields to FormData
      formData.append("courseName", data.courseName);
      formData.append("courseCode", data.courseCode);
      formData.append("description", data.description);
      formData.append("startDate", formattedStartDate);
      formData.append("endDate", formattedEndDate);
      formData.append("courseDate", formattedCourseDate);
      formData.append("location", data.location);
      formData.append("courseTags", JSON.stringify(data.courseTags));
      formData.append("maxSeats", data.maxSeats.toString());
      formData.append("availableSeats", data.maxSeats.toString());
      formData.append("price", data.price.toString());
      formData.append("hours", data.hours.toString());
      formData.append("courseImage", data.courseImage);

      return axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/courses`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course created successfully!");

      await new Promise((resolve) => setTimeout(resolve, 2000));
      onOpenChange(false);
      form.reset();
      onSuccess();
    },
    onError: (error) => {
      console.error("Error creating course:", error);
      if (axios.isAxiosError(error) && error.response) {
        toast.error(
          `Error: ${error.response.data.message || "Something went wrong"}`
        );
      } else {
        toast.error("Failed to create course");
      }
    },
  });

  const onSubmit = (data: CourseFormData) => {
    mutation.mutate(data);
  };

  // Update course date when start/end dates change
  const updateCourseDateIfNeeded = () => {
    const currentCourseDate = form.getValues("courseDate");
    if (currentCourseDate <= endDate) {
      form.setValue("courseDate", addDays(endDate, 1));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Course</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new course.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Name</FormLabel>
                    <FormControl>
                      <Input
                        id="coursename"
                        placeholder="Introduction to Programming"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Code</FormLabel>
                    <FormControl>
                      <Input id="coursecode" placeholder="CS101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      id="description"
                      placeholder="A comprehensive introduction to programming concepts..."
                      {...field}
                      rows={4}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Start Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            id="startdate"
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            // Update after change
                            setTimeout(updateCourseDateIfNeeded, 0);
                          }}
                          initialFocus
                          disabled={(date) => date < tomorrow}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>End Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            id="enddate"
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={(date) => {
                            field.onChange(date);
                            // Update after change
                            setTimeout(updateCourseDateIfNeeded, 0);
                          }}
                          initialFocus
                          disabled={(date) => date < startDate}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="courseDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Course Date</FormLabel>
                    <DateTimePicker24h
                      selectedDate={field.value}
                      onChange={field.onChange}
                      minDate={startDate}
                      maxDate={endDate}
                    />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="courseTags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Course Tags</FormLabel>
                    <Popover
                      open={showTagPopover}
                      onOpenChange={setShowTagPopover}
                    >
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className="w-full pl-3 text-left font-normal"
                            id="coursetag"
                          >
                            {field.value.length > 0
                              ? `${field.value.length} tag${
                                  field.value.length > 1 ? "s" : ""
                                } selected`
                              : "Select tags"}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-full p-2" align="start">
                        <div className="space-y-2">
                          {courseTags.map((tag) => (
                            <div
                              key={tag.value}
                              className="flex items-center space-x-2"
                            >
                              <Checkbox
                                id={`tag-${tag.value}`}
                                checked={field.value.includes(tag.value)}
                                onCheckedChange={(checked) => {
                                  const updatedTags = checked
                                    ? [...field.value, tag.value]
                                    : field.value.filter(
                                        (value) => value !== tag.value
                                      );
                                  field.onChange(updatedTags);
                                }}
                              />
                              <label
                                htmlFor={`tag-${tag.value}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {tag.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </PopoverContent>
                    </Popover>
                    {field.value.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {field.value.map((tag) => {
                          const tagLabel =
                            courseTags.find((t) => t.value === tag)?.label ||
                            tag;
                          return (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1"
                            >
                              {tagLabel}
                              <X
                                className="h-3 w-3 cursor-pointer"
                                onClick={() => {
                                  field.onChange(
                                    field.value.filter((t) => t !== tag)
                                  );
                                }}
                              />
                            </Badge>
                          );
                        })}
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input
                      id="location"
                      placeholder="Main Campus, Room 101"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (฿)</FormLabel>
                    <FormControl>
                      <Input
                        id="price"
                        type="number"
                        placeholder="499.99"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? "" : parseInt(value, 10) || 0
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hours"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hours</FormLabel>
                    <FormControl>
                      <Input
                        id="hours"
                        type="number"
                        placeholder="40"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? "" : parseInt(value, 10) || 0
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxSeats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Seats</FormLabel>
                    <FormControl>
                      <Input
                        id="maxseats"
                        type="number"
                        placeholder="30"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value;
                          field.onChange(
                            value === "" ? "" : parseInt(value, 10) || 0
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="courseImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Course Image</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <div className="flex items-center gap-4 w-full">
                        {/* Upload area - 50% width */}
                        <Label
                          htmlFor="course-image"
                          className="cursor-pointer w-1/2"
                        >
                          <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg border-gray-300 hover:border-gray-400 transition-colors">
                            <UploadCloud className="h-8 w-8 text-gray-500 mb-2" />
                            <span className="text-sm text-gray-500">
                              {field.value ? "Change image" : "Upload image"}
                            </span>
                          </div>
                          <Input
                            id="course-image"
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                // Store the file object for form submission
                                field.onChange(file);

                                // Create preview URL
                                const reader = new FileReader();
                                reader.onload = (e) => {
                                  setImagePreview(e.target?.result as string);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </Label>

                        {/* Preview area - 50% width, always visible but conditionally shows content */}
                        <div className="w-1/2 h-32">
                          {imagePreview || field.value ? (
                            <div className="relative h-full w-full rounded-lg overflow-hidden border border-gray-200">
                              <img
                                src={
                                  imagePreview ||
                                  (field.value instanceof File
                                    ? URL.createObjectURL(field.value)
                                    : undefined)
                                }
                                alt="Course preview"
                                className="h-full w-full object-cover"
                              />
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="absolute top-1 right-1 h-6 w-6 rounded-full"
                                onClick={() => {
                                  field.onChange(null);
                                  setImagePreview(null);
                                }}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full w-full rounded-lg border border-dashed border-gray-200">
                              <span className="text-sm text-gray-400">
                                Preview will appear here
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {field.value && (
                        <p className="text-sm text-gray-500">
                          {field.value instanceof File
                            ? field.value.name
                            : "Image selected"}
                        </p>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                id="submit"
                type="submit"
                variant={"hero"}
                disabled={mutation.isPending || !isDateAfterEndDate}
              >
                {mutation.isPending ? (
                  <>
                    <Spinner size="small" />
                    Creating...
                  </>
                ) : (
                  "Create Course"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
      <Toaster position="bottom-right" richColors />
    </Dialog>
  );
}
