"use client";

import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { CalendarIcon, X } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useSession } from "next-auth/react";

// Define the validation schema
const userSchema = z.object({
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
  imageUrl: z.string().url("Image URL must be a valid URL").optional(),
});

type UserFormData = z.infer<typeof userSchema>;

interface UserFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: any;
}

export function UserForm({ open, onOpenChange, initialData }: UserFormProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const isEditing = !!initialData;
  const queryClient = useQueryClient();
  const [showTagPopover, setShowTagPopover] = useState(false);

  // Course tag options
  const courseTags = [
    { value: "programming", label: "Programming" },
    { value: "design", label: "Design" },
    { value: "business", label: "Business" },
    { value: "marketing", label: "Marketing" },
    { value: "science", label: "Science" },
    { value: "language", label: "Language" },
    { value: "math", label: "Mathematics" },
    { value: "other", label: "Other" },
  ];

  // Convert string dates to Date objects for editing
  const prepareInitialData = () => {
    if (!initialData) return null;

    return {
      ...initialData,
      startDate: initialData.startDate
        ? new Date(initialData.startDate)
        : new Date(),
      endDate: initialData.endDate ? new Date(initialData.endDate) : new Date(),
      courseDate: initialData.courseDate
        ? new Date(initialData.courseDate)
        : new Date(),
      courseTags: initialData.courseTags || [],
    };
  };

  // Initialize form with default values or editing data
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: prepareInitialData() || {
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
      imageUrl: "",
    },
  });

  // Create mutation for adding/editing course
  const mutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      // Format dates for API
      const formattedData = {
        ...data,
        startDate: format(data.startDate, "yyyy-MM-dd"),
        endDate: format(data.endDate, "yyyy-MM-dd"),
        courseDate: format(data.courseDate, "yyyy-MM-dd"),
      };

      if (isEditing) {
        return axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course/${initialData._id}`,
          formattedData,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        // Set available seats to maxSeats for new courses
        formattedData.availableSeats = formattedData.maxSeats;
        return axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course`,
          formattedData,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      onOpenChange(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Error creating/updating course:", error);
      // You can add error handling here, such as displaying an error message
    },
  });

  const onSubmit = (data: UserFormData) => {
    // When submitting, we need to handle the availableSeats field
    // For new courses, availableSeats equals maxSeats
    const submitData = {
      ...data,
      availableSeats: isEditing ? initialData.availableSeats : data.maxSeats,
    };

    mutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Course" : "Create New Course"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Update the course details below."
              : "Fill in the details to create a new course."}
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
                  <FormLabel>Description</FormLabel>
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
                    <FormLabel>Start Date</FormLabel>
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
                    <FormLabel>End Date</FormLabel>
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
                    <FormLabel>Course Date</FormLabel>
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

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price (฿)</FormLabel>
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
                    <FormLabel>Hours</FormLabel>
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

              <FormField
                control={form.control}
                name="maxSeats"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Seats</FormLabel>
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
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://example.com/course-image.jpg"
                      {...field}
                    />
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
                type="submit"
                variant={"hero"}
                disabled={mutation.isPending}
              >
                {mutation.isPending
                  ? "Saving..."
                  : isEditing
                  ? "Update Course"
                  : "Create Course"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
