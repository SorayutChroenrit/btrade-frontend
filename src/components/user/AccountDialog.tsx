"use client";

import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import duration from "dayjs/plugin/duration";

import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, Lock } from "lucide-react";

// Initialize dayjs plugins
dayjs.extend(relativeTime);
dayjs.extend(duration);

// Define the form schema
const accountFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  phoneNumber: z.string().min(10, {
    message: "Phone number must be at least 10 digits.",
  }),
  company: z.string().min(1, {
    message: "Company name is required.",
  }),
  idCard: z.string().min(1, {
    message: "ID Card number is required.",
  }),
});

type AccountFormValues = z.infer<typeof accountFormSchema>;

// Define the trader info type based on the JSON structure
interface TrainingInfo {
  _id: { $oid: string };
  courseId: { $oid: string };
  courseName: string;
  location: string;
  hours: number;
  date: { $date: string };
  imageUrl: string;
  description: string;
}

interface TraderInfo {
  userId: { $oid: string };
  company: string;
  name: string;
  idCard: string;
  email: string;
  phoneNumber: string;
  startDate: { $date: string };
  endDate: { $date: string };
  durationDisplay: { years: number; months: number; days: number };
  remainingTimeDisplay: { years: number; months: number; days: number };
  trainings: TrainingInfo[];
  isDeleted: boolean;
  createdAt: { $date: string };
  updatedAt: { $date: string };
  __v: number;
}

interface AccountDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  traderId: string;
  onUpdate: (values: AccountFormValues) => Promise<void>;
}

// Function to mask sensitive data
const maskData = (value: string, visibleChars: number = 4): string => {
  if (!value) return "";
  if (value.length <= visibleChars) return "*".repeat(value.length);

  const visiblePart = value.slice(-visibleChars);
  const maskedPart = "*".repeat(value.length - visibleChars);
  return maskedPart + visiblePart;
};

export function AccountDialog({
  open,
  onOpenChange,
  traderId,
  onUpdate,
}: AccountDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [traderInfo, setTraderInfo] = useState<TraderInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [showIdCard, setShowIdCard] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  // Initialize form
  const form = useForm<AccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phoneNumber: "",
      company: "",
      idCard: "",
    },
  });

  // Function to fetch trader data from the backend
  const fetchTraderData = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/traders/${traderId}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Failed to fetch trader information"
        );
      }

      const responseData = await response.json();

      if (responseData.status !== "Success" || !responseData.data) {
        throw new Error(responseData.message || "Failed to fetch trader data");
      }

      return responseData.data;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch trader info when dialog opens
  useEffect(() => {
    const loadTraderInfo = async () => {
      if (open && traderId) {
        try {
          const data = await fetchTraderData(traderId);
          setTraderInfo(data);

          // Reset form with fresh data
          form.reset({
            name: data.name,
            email: data.email,
            phoneNumber: data.phoneNumber,
            company: data.company,
            idCard: data.idCard,
          });
        } catch (error) {
          console.error("Failed to fetch trader info:", error);
          toast.error("Failed to load account information.");
        }
      }
    };

    loadTraderInfo();
  }, [open, traderId, form]);

  // Format dates for display using dayjs
  const formatDate = (dateObj: any): string => {
    if (!dateObj) return "TBD";
    try {
      // Handle both string dates and MongoDB date objects
      const dateString = dateObj.$date || dateObj;
      const date = dayjs(dateString);

      // Check if the date is valid
      if (!date.isValid()) {
        return "TBD";
      }

      return date.format("DD MMMM YYYY");
    } catch (error) {
      console.error("Date formatting error:", error);
      return "TBD";
    }
  };

  // Calculate durations with dayjs
  const calculateDuration = (startDate: any, endDate: any) => {
    if (!startDate || !endDate) {
      return { years: 0, months: 0, days: 0 };
    }

    try {
      const start = dayjs(startDate.$date || startDate);
      const end = dayjs(endDate.$date || endDate);

      if (!start.isValid() || !end.isValid()) {
        return { years: 0, months: 0, days: 0 };
      }

      const diffInDays = end.diff(start, "day");
      const duration = dayjs.duration(diffInDays, "day");

      return {
        years: duration.years(),
        months: duration.months(),
        days: duration.days(),
      };
    } catch (error) {
      console.error("Duration calculation error:", error);
      return { years: 0, months: 0, days: 0 };
    }
  };

  // Calculate remaining time with dayjs
  const calculateRemainingTime = (endDate: any) => {
    if (!endDate) {
      return { years: 0, months: 0, days: 0 };
    }

    try {
      const end = dayjs(endDate.$date || endDate);
      const now = dayjs();

      if (!end.isValid() || end.isBefore(now)) {
        return { years: 0, months: 0, days: 0 };
      }

      const diffInDays = end.diff(now, "day");
      const duration = dayjs.duration(diffInDays, "day");

      return {
        years: duration.years(),
        months: duration.months(),
        days: duration.days(),
      };
    } catch (error) {
      console.error("Remaining time calculation error:", error);
      return { years: 0, months: 0, days: 0 };
    }
  };

  async function onSubmit(values: AccountFormValues) {
    try {
      setIsSubmitting(true);
      await onUpdate(values);
      toast.success("Your account information has been updated successfully.");

      // Refresh trader info after update
      if (traderId) {
        try {
          const updatedData = await fetchTraderData(traderId);
          setTraderInfo(updatedData);

          // Reset form with updated data
          form.reset({
            name: updatedData.name,
            email: updatedData.email,
            phoneNumber: updatedData.phoneNumber,
            company: updatedData.company,
            idCard: updatedData.idCard,
          });
        } catch (error) {
          console.error("Failed to refresh trader data:", error);
          // We don't show an error toast here since the update was successful
          // But we log the error for debugging purposes
        }
      }

      setIsEditMode(false);
    } catch (error) {
      toast.error("Failed to update account information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleEditToggle = (checked: boolean) => {
    setIsEditMode(checked);
    // Reset visibility states when toggling edit mode
    setShowPhoneNumber(false);
    setShowIdCard(false);

    if (!checked && traderInfo) {
      // Reset form to original values when exiting edit mode
      form.reset({
        name: traderInfo.name,
        email: traderInfo.email,
        phoneNumber: traderInfo.phoneNumber,
        company: traderInfo.company,
        idCard: traderInfo.idCard,
      });
    }
  };

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Account Information</DialogTitle>
            <DialogDescription>
              Loading your account information...
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-40">
            <p>Loading account information...</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (error || !traderInfo) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[625px]">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
            <DialogDescription>
              There was a problem loading your account information.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center items-center h-40 text-center">
            <p className="text-red-500">
              {error ||
                "Failed to load trader information. Please try again later."}
            </p>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Calculate durations with dayjs
  const duration = calculateDuration(traderInfo.startDate, traderInfo.endDate);
  const remainingTime = calculateRemainingTime(traderInfo.endDate);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Account Information</DialogTitle>
          <DialogDescription>
            View your account details below.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end space-x-2 mb-4">
          <Label htmlFor="edit-mode" className="text-sm font-medium">
            {isEditMode ? "Edit Mode" : "View Mode"}
          </Label>
          <Switch
            id="edit-mode"
            checked={isEditMode}
            onCheckedChange={handleEditToggle}
          />
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      {isEditMode ? (
                        <Input placeholder="Your name" {...field} />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/50">
                          {field.value}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      {isEditMode ? (
                        <Input placeholder="Your email" {...field} />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/50">
                          {field.value}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      Phone Number{" "}
                      <Lock className="h-3 w-3 text-muted-foreground" />
                    </FormLabel>
                    {isEditMode ? (
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="Your phone number"
                            type={showPhoneNumber ? "text" : "password"}
                            {...field}
                            value={
                              showPhoneNumber
                                ? field.value
                                : maskData(field.value, 4)
                            }
                            onChange={(e) => {
                              if (showPhoneNumber) {
                                field.onChange(e);
                              }
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowPhoneNumber(!showPhoneNumber)}
                        >
                          {showPhoneNumber ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/50 flex items-center justify-between">
                        <span>{maskData(field.value, 4)}</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company</FormLabel>
                    <FormControl>
                      {isEditMode ? (
                        <Input placeholder="Your company" {...field} />
                      ) : (
                        <div className="p-2 border rounded-md bg-muted/50">
                          {field.value}
                        </div>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="idCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      ID Card <Lock className="h-3 w-3 text-muted-foreground" />
                    </FormLabel>
                    {isEditMode ? (
                      <div className="relative">
                        <FormControl>
                          <Input
                            placeholder="Your ID card number"
                            type={showIdCard ? "text" : "password"}
                            {...field}
                            value={
                              showIdCard
                                ? field.value
                                : maskData(field.value, 4)
                            }
                            onChange={(e) => {
                              if (showIdCard) {
                                field.onChange(e);
                              }
                            }}
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="absolute right-0 top-0 h-full px-3 py-2"
                          onClick={() => setShowIdCard(!showIdCard)}
                        >
                          {showIdCard ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="p-2 border rounded-md bg-muted/50 flex items-center justify-between">
                        <span>{maskData(field.value, 4)}</span>
                      </div>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Account Status</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Start Date
                  </p>
                  <p>{formatDate(traderInfo.startDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    End Date
                  </p>
                  <p>{formatDate(traderInfo.endDate)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Duration
                  </p>
                  <p>
                    {`${duration.years} years, 
                    ${duration.months} months, 
                    ${duration.days} days`}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    Remaining Time
                  </p>
                  <p>
                    {`${remainingTime.years} years, 
                    ${remainingTime.months} months, 
                    ${remainingTime.days} days`}
                  </p>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Close
              </Button>
              {isEditMode && (
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#FDAB04] text-white hover:bg-[#FDAB04]/90"
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              )}
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
