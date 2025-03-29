"use client";

import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
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
import { CalendarIcon, X, UploadCloud } from "lucide-react";
import { format, parse } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { DateTimePicker24h } from "../ui/24datetimepicker";
import { Spinner } from "../ui/spinner";

// Define the validation schema
const courseSchema = z.object({
  courseName: z.string().min(3, "Course name must be at least 3 characters"),
  courseCode: z.string().min(2, "Course code is required"),
  description: z.string().min(10, "Description must be at least 10 characters"),
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
  location: z.string().optional(),
  price: z.number().positive("Price must be a positive number"),
  hours: z.number().positive("Hours must be a positive number"),
  maxSeats: z.number().positive("Max seats must be a positive number"),
  availableSeats: z.number().nonnegative("Available seats cannot be negative"),
  courseImage: z.instanceof(File).optional().nullable(),
  isPublished: z.boolean().default(false),
});

type CourseFormData = z.infer<typeof courseSchema>;

// Define a proper type for the courseId
type CourseIdType = string | { _id: string } | null;

interface EditCourseFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseId: CourseIdType;
}

export function EditCourseForm({
  open,
  onOpenChange,
  courseId,
}: EditCourseFormProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const [showTagPopover, setShowTagPopover] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Initialize form with default values
  const form = useForm<CourseFormData>({
    resolver: zodResolver(courseSchema),
    defaultValues: {
      courseName: "",
      courseCode: "",
      description: "",
      startDate: new Date(),
      endDate: new Date(),
      courseDate: new Date(),
      courseTags: [],
      location: "",
      price: 0,
      hours: 0,
      maxSeats: 0,
      availableSeats: 0,
      courseImage: null,
      isPublished: false,
    },
  });

  const courseTags = [
    { value: "New Course", label: "New Course" },
    { value: "Recently Updated", label: "Recently Updated" },
    { value: "comingsComing Soonoon", label: "Coming Soon" },
  ];

  // Function to extract the actual ID from courseId
  const getActualId = (courseId: CourseIdType): string | null => {
    if (!courseId) return null;
    if (typeof courseId === "string") return courseId;
    if (typeof courseId === "object" && courseId !== null && "_id" in courseId)
      return courseId._id;
    return null;
  };

  // Get the actual ID
  const actualId = getActualId(courseId);

  // Reset image preview when form opens or closes
  useEffect(() => {
    if (!open) {
      setImagePreview(null);
    }
  }, [open]);

  // Fetch course data when courseId changes
  const { data: courseResponse, isLoading } = useQuery({
    queryKey: ["course", actualId],
    queryFn: async () => {
      if (!actualId) return null;

      console.log("Using ID:", actualId);

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course/${actualId}`,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
      console.log("API Response:", response.data);
      return response.data;
    },
    enabled: !!actualId && open,
  });

  // Update form when courseData changes
  useEffect(() => {
    if (courseResponse && courseResponse.data) {
      // Reset the image preview first
      setImagePreview(null);

      const courseData = courseResponse.data;

      // Safely parse numbers
      const safeParseInt = (value: any): number => {
        const parsed = parseInt(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      const safeParseFloat = (value: any): number => {
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      // Safely parse dates
      const safeParseDate = (dateString: any): Date => {
        if (!dateString) return new Date();

        try {
          // Try multiple date formats
          // First try ISO format
          const date = new Date(dateString);
          if (!isNaN(date.getTime())) return date;

          // Then try your custom format
          return parse(dateString, "yyyy-MM-dd", new Date());
        } catch (e) {
          console.error("Date parsing error:", e, dateString);
          return new Date();
        }
      };

      form.reset({
        courseName: courseData.courseName || "",
        courseCode: courseData.courseCode || "",
        description: courseData.description || "",
        startDate: safeParseDate(courseData.startDate),
        endDate: safeParseDate(courseData.endDate),
        courseDate: safeParseDate(courseData.courseDate),
        courseTags: Array.isArray(courseData.courseTags)
          ? courseData.courseTags
          : [],
        location: courseData.location || "",
        price: safeParseFloat(courseData.price),
        hours: safeParseInt(courseData.hours),
        maxSeats: safeParseInt(courseData.maxSeats),
        availableSeats: safeParseInt(courseData.availableSeats),
        courseImage: null,
        isPublished: courseData.isPublished || false,
      });

      // Set image preview if course has an image
      if (courseData.imageUrl) {
        setImagePreview(courseData.imageUrl);
      }
    }
  }, [courseResponse, form]);

  // Create mutation for updating course
  const mutation = useMutation({
    mutationFn: async (data: CourseFormData) => {
      if (!actualId) throw new Error("Course ID is required for editing");

      // Create a FormData object for the update
      const formData = new FormData();
      formData.append("courseId", actualId);

      // Format dates for API
      const formattedStartDate = format(data.startDate, "yyyy-MM-dd");
      const formattedEndDate = format(data.endDate, "yyyy-MM-dd");
      const formattedCourseDate = format(
        data.courseDate,
        "yyyy-MM-dd'T'HH:mm:ss"
      );

      // Add all fields to FormData
      formData.append("courseName", data.courseName);
      formData.append("courseCode", data.courseCode);
      formData.append("description", data.description);
      formData.append("startDate", formattedStartDate);
      formData.append("endDate", formattedEndDate);
      formData.append("courseDate", formattedCourseDate);
      formData.append("location", data.location || "");
      formData.append("courseTags", JSON.stringify(data.courseTags));
      formData.append("price", data.price.toString());
      formData.append("hours", data.hours.toString());
      formData.append("maxSeats", data.maxSeats.toString());
      formData.append("availableSeats", data.availableSeats.toString());
      formData.append("isPublished", data.isPublished.toString());

      // Only append courseImage if it exists
      if (data.courseImage instanceof File) {
        formData.append("courseImage", data.courseImage);
      }

      // Create the request payload with FormData
      return axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    },
    onSuccess: () => {
      toast.success("Course updated successfully");
      setImagePreview(null); // Clear image preview

      queryClient.invalidateQueries({ queryKey: ["courses"] });
      queryClient.invalidateQueries({ queryKey: ["course", actualId] });
      onOpenChange(false);
    },
    onError: (error) => {
      console.error("Error updating course:", error);
      toast.error("Failed to update course. Please try again.");
    },
  });

  const onSubmit = (data: CourseFormData) => {
    // Ensure the data is valid before submitting
    mutation.mutate(data);
  };

  // Get form values for validation
  const startDate = form.watch("startDate");
  const endDate = form.watch("endDate");
  const courseDate = form.watch("courseDate");

  return (
    <Dialog
      open={open}
      onOpenChange={(newOpenState) => {
        if (!newOpenState) {
          setImagePreview(null); // Clear image preview when closing the dialog
        }
        onOpenChange(newOpenState);
      }}
    >
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex flex-col space-y-2">
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>
              Update the course details. Fields marked with * are required.
            </DialogDescription>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-6">Loading course data...</div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Status Toggle at the top */}
              <FormField
                control={form.control}
                name="isPublished"
                render={({ field }) => (
                  <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <Label htmlFor="course-status">Course Status</Label>
                      <p className="text-sm text-muted-foreground">
                        {field.value
                          ? "Course is public and visible to all users"
                          : "Course is private and only visible to administrators"}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Label
                        htmlFor="course-status"
                        className={
                          field.value ? "text-primary" : "text-muted-foreground"
                        }
                      >
                        {field.value ? "Published" : "Private"}
                      </Label>
                      <Switch
                        id="course-status"
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </div>
                  </div>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="courseName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Course Name*</FormLabel>
                      <FormControl>
                        <Input
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
                      <FormLabel>Course Code*</FormLabel>
                      <FormControl>
                        <Input placeholder="CS101" {...field} />
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
                    <FormLabel>Description*</FormLabel>
                    <FormControl>
                      <Textarea
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
                      <FormLabel>Start Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
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
                            onSelect={field.onChange}
                            initialFocus
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
                      <FormLabel>End Date*</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
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
                            onSelect={field.onChange}
                            initialFocus
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
                      <FormLabel>Course Date*</FormLabel>
                      <DateTimePicker24h
                        selectedDate={field.value}
                        onChange={field.onChange}
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
                      <FormLabel>Course Tags*</FormLabel>
                      <Popover
                        open={showTagPopover}
                        onOpenChange={setShowTagPopover}
                      >
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              className="w-full pl-3 text-left font-normal"
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
                      <Input placeholder="Main Campus, Room 101" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="price"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Price (฿)*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="499.99"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseFloat(e.target.value))
                          }
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
                      <FormLabel>Hours*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="40"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="maxSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Max Seats*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availableSeats"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Available Seats*</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="30"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
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
                    <FormLabel>Course Image (Optional)</FormLabel>
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
                                {field.value || imagePreview
                                  ? "Change image"
                                  : "Upload image"}
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

                          {/* Preview area - 50% width */}
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
                  onClick={() => {
                    setImagePreview(null);
                    onOpenChange(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={"hero"}
                  disabled={mutation.isPending}
                >
                  {mutation.isPending ? (
                    <>
                      <Spinner size="small" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
