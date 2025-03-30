"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Check,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
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
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

// Initialize Stripe promise
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""
);

interface CourseData {
  id: string;
  courseName: string;
  description?: string;
  imageUrl?: string;
  location?: string;
  price: number;
  startDate?: string;
  endDate?: string;
  courseDate?: string;
  maxSeats: number;
  availableSeats: number;
  isPublished: boolean;
  courseTags?: string[];
  syllabus?: string;
  stripePriceId?: string;
  [key: string]: any;
}

interface ErrorResponse {
  code: string;
  status: string;
  message: string;
}

// Utility functions
const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

// ID Card verification form schema
const idCardSchema = z.object({
  idCard: z
    .string()
    .length(13, "ID Card must be exactly 13 digits")
    .regex(/^\d+$/, "ID Card must contain only numbers"),
});

export default function CourseDetail() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const user = session?.user;
  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [verificationError, setVerificationError] =
    useState<ErrorResponse | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);
  const [isProcessingPayment, setIsProcessingPayment] =
    useState<boolean>(false);
  const [isAlreadyRegistered, setIsAlreadyRegistered] =
    useState<boolean>(false);
  const [registrationStatusMessage, setRegistrationStatusMessage] = useState<
    string | null
  >(null);
  const courseId = params.courseId as string;

  // Initialize the form
  const form = useForm<z.infer<typeof idCardSchema>>({
    resolver: zodResolver(idCardSchema),
    defaultValues: {
      idCard: "",
    },
  });

  useEffect(() => {
    if (session?.user?.role === "admin") {
      setIsAdmin(true);
    }
  }, [session]);

  // Calculate registration status message
  const calculateRegistrationStatus = useCallback(() => {
    if (!course) return null;

    const now = new Date();
    const startDate = course.startDate ? new Date(course.startDate) : null;
    const endDate = course.endDate ? new Date(course.endDate) : null;
    const courseDate = course.courseDate ? new Date(course.courseDate) : null;

    if (courseDate && now >= courseDate) {
      return "This course has already started";
    } else if (startDate && now < startDate) {
      return `Registration opens on ${formatDate(course.startDate)}`;
    } else if (endDate && now > endDate) {
      return "Registration period has ended";
    } else if (course.availableSeats <= 0) {
      return "No available seats";
    }

    return null;
  }, [course]);

  // Check if course is open for registration
  const isRegistrationOpen = useCallback(() => {
    if (!course) return false;

    const now = new Date();
    const startDate = course.startDate ? new Date(course.startDate) : null;
    const endDate = course.endDate ? new Date(course.endDate) : null;
    const courseDate = course.courseDate ? new Date(course.courseDate) : null;

    // Check if the courseDate is in the past
    const isCourseInFuture = courseDate === null || now < courseDate;

    // Course is open for registration if:
    // 1. Current date is between registration start and end dates
    // 2. There are available seats
    // 3. The course date hasn't passed yet
    return (
      startDate !== null &&
      endDate !== null &&
      now >= startDate &&
      now <= endDate &&
      course.availableSeats > 0 &&
      isCourseInFuture
    );
  }, [course]);

  const checkUserRegistration = async (
    courseId: string,
    userId: string,
    accessToken: string
  ) => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enrollment/check-registration`,
        {
          params: {
            courseId,
            userId,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      return response.data.isRegistered || false;
    } catch (err) {
      console.error("Failed to check registration status:", err);
      // Return false by default if there's an error
      return false;
    }
  };

  // Effect to fetch course details and check registration status
  useEffect(() => {
    // Only fetch course details when session status is determined (authenticated or unauthenticated)
    if (sessionStatus === "loading") {
      return; // Exit early if session is still loading
    }

    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course/${courseId}`,
          {
            headers: {
              ...(user?.accessToken
                ? {
                    Authorization: `Bearer ${user.accessToken}`,
                  }
                : {}),
              "Content-Type": "application/json",
            },
          }
        );

        const result = response.data;

        if (result.status === "Success" && result.data) {
          setCourse(result.data);

          // Check if the user is already registered for this course (only for authenticated users)
          if (user?.id && user?.accessToken) {
            const isRegistered = await checkUserRegistration(
              courseId,
              user.id,
              user.accessToken
            );
            setIsAlreadyRegistered(isRegistered);
          }
        } else {
          throw new Error("Invalid response format from API");
        }
      } catch (err) {
        console.error("Failed to fetch course details:", err);
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message ||
              `Error fetching course: ${err.message}`
          );
        } else {
          setError((err as Error).message);
        }
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId, sessionStatus, user]);

  // Effect to update registration status message when course changes
  useEffect(() => {
    const message = calculateRegistrationStatus();
    setRegistrationStatusMessage(message);
  }, [course, calculateRegistrationStatus]);

  const getEnrollmentStatus = () => {
    if (!course) return { percent: 0, color: "bg-gray-300" };

    const currentEnrollment = course.maxSeats - course.availableSeats;
    const percentFull =
      course.maxSeats > 0 ? (currentEnrollment / course.maxSeats) * 100 : 0;

    let progressColor = "bg-green-600";

    if (percentFull >= 90) {
      progressColor = "bg-red-500";
    } else if (percentFull >= 70) {
      progressColor = "bg-amber-500";
    }

    return {
      percent: percentFull,
      color: progressColor,
    };
  };

  // Handle opening the ID verification dialog
  const handleOpenDialog = () => {
    setIsDialogOpen(true);
    setVerificationError(null);
    form.reset();
  };

  // Handle ID card verification and direct checkout
  const onVerifyIdCard = async (values: z.infer<typeof idCardSchema>) => {
    try {
      setIsVerifying(true);
      setVerificationError(null);

      // Make a call to your backend API to verify the ID card
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enrollment/verify-id`,
        {
          userId: session?.user?.id,
          idCard: values.idCard,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      const result = response.data;

      if (result.status === "Success") {
        // ID verification successful
        setIsDialogOpen(false);

        // Show verification success toast
        toast.success("ID Verification Successful", {});

        // Get course data
        if (!course) {
          throw new Error("Course data is missing");
        }

        // Set processing payment state
        setIsProcessingPayment(true);
        // Create checkout session
        const checkoutResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/create-checkout-session`,
          {
            stripePriceId: course.stripePriceId,
            metadata: {
              userId: session?.user?.id,
              courseId: courseId,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        // Get the session ID from the response
        const sessionId = checkoutResponse.data.sessionId;

        // Small delay to allow toast to be seen
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Redirect to Stripe checkout
        const stripe = await stripePromise;
        if (stripe && sessionId) {
          await stripe.redirectToCheckout({ sessionId });
        } else {
          throw new Error("Failed to initialize Stripe checkout");
        }
      } else {
        // ID verification failed with a success response but error status
        setVerificationError({
          code: result.code || "ERROR",
          status: "Error",
          message: result.message || "ID verification failed",
        });
      }
    } catch (err) {
      console.error("ID verification or checkout error:", err);

      // Handle axios error using the backend's error response format
      if (axios.isAxiosError(err) && err.response?.data) {
        const serverError = err.response.data as ErrorResponse;
        setVerificationError(serverError);

        // Show error toast
        toast.error(getErrorTitle(serverError.code), {
          description: serverError.message,
        });
      } else {
        // Fallback error when backend response isn't available
        const errorMessage =
          (err as Error).message ||
          "Failed to verify ID card or create checkout session";
        setVerificationError({
          code: "CLIENT-ERROR",
          status: "Error",
          message: errorMessage,
        });

        // Show error toast
        toast.error("Error", {
          description: errorMessage,
        });
      }
    } finally {
      setIsVerifying(false);
      setIsProcessingPayment(false);
    }
  };

  const getErrorTitle = (errorCode: string) => {
    const errorTitles: Record<string, string> = {
      "Error-01-0001": "Invalid Request",
      "Error-01-0002": "Missing Information",
      "Error-01-0004": "ID Not Found",
      "Error-01-0007": "ID Card Mismatch",
      "Error-03-0001": "Server Error",
    };

    return errorTitles[errorCode] || "Verification Failed";
  };

  // Show loading state while session is loading
  if (sessionStatus === "loading" || loading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Skeleton className="h-48 w-full rounded-lg" />
                <Skeleton className="h-20 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-10 w-full rounded" />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-24 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load course details: {error}
          </AlertDescription>
        </Alert>

        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="container max-w-6xl mx-auto p-4">
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Not Found</AlertTitle>
          <AlertDescription>
            The course you are looking for does not exist or has been removed.
          </AlertDescription>
        </Alert>

        <Button onClick={() => router.back()} className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Go Back
        </Button>
      </div>
    );
  }

  const enrollmentStatus = getEnrollmentStatus();
  const courseTags = course.courseTags || [];
  const currentEnrollment = course.maxSeats - course.availableSeats;
  const canRegister = !isAdmin && isRegistrationOpen() && !isAlreadyRegistered;

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="pt-4">
            <CardHeader>
              <CardTitle className="text-2xl">{course.courseName}</CardTitle>
              <CardDescription>
                {courseTags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="mr-1">
                    {tag}
                  </Badge>
                ))}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {course.imageUrl && (
                <img
                  src={course.imageUrl}
                  alt={course.courseName}
                  className="w-full h-auto rounded-lg object-cover max-h-80"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      "/image_placeholder.webp";
                  }}
                />
              )}

              <div>
                <h3 className="text-lg font-medium mb-2">Description</h3>
                <div className="text-gray-700">
                  {course.description || "No description available"}
                </div>
              </div>

              {course.syllabus && (
                <div>
                  <h3 className="text-lg font-medium mb-2">Syllabus</h3>
                  <div className="text-gray-700">{course.syllabus}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {isAdmin && (
            <Card className="pt-4">
              <CardHeader>
                <CardTitle className="text-lg">Enrollment Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span>Enrollment Progress</span>
                  <span>
                    {currentEnrollment}/{course.maxSeats} seats filled
                  </span>
                </div>
                <Progress
                  value={enrollmentStatus.percent}
                  className={`h-2 ${enrollmentStatus.color}`}
                />
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Remaining Seats</h4>
                  <p className="text-2xl font-bold">
                    {course.availableSeats}{" "}
                    <span className="text-sm font-normal text-gray-500">
                      of {course.maxSeats}
                    </span>
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card className="pt-4">
            <CardHeader>
              <CardTitle className="text-lg">Course Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                <span>{course.location || "No location specified"}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <span>Course Date: {formatDate(course.courseDate)}</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>
                  Registration: {formatDate(course.startDate)} -{" "}
                  {formatDate(course.endDate)}
                </span>
              </div>
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-gray-500" />
                <span>Max Participants: {course.maxSeats}</span>
              </div>
              <div className="py-2 px-4 bg-gray-50 rounded-lg">
                <p className="text-2xl font-bold text-right">
                  {course.price.toLocaleString()} ฿
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Registration status/button card - Updated version */}
          {!isAdmin && (
            <Card
              className={`${
                isRegistrationOpen()
                  ? "bg-blue-50 border-blue-200"
                  : "bg-gray-50 border-gray-200"
              } overflow-hidden`}
            >
              <CardContent className="pt-6 pb-6">
                <div className="space-y-4">
                  {isAlreadyRegistered ? (
                    <div className="flex items-center justify-center text-green-600">
                      <Check className="h-6 w-6 mr-2" />
                      <span className="font-medium">
                        You are already registered
                      </span>
                    </div>
                  ) : registrationStatusMessage ? (
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="font-medium">
                        {registrationStatusMessage}
                      </span>
                      {course.availableSeats > 0 && (
                        <Badge
                          variant="outline"
                          className="bg-white text-gray-700 border-gray-300"
                        >
                          {course.availableSeats} seats left
                        </Badge>
                      )}
                    </div>
                  ) : isRegistrationOpen() ? (
                    <div className="flex items-center justify-between text-blue-700">
                      <span className="font-medium">Registration Open</span>
                      <Badge
                        variant="outline"
                        className="bg-white text-blue-700 border-blue-300"
                      >
                        {course.availableSeats} seats left
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between text-gray-700">
                      <span className="font-medium">Registration Closed</span>
                    </div>
                  )}

                  {canRegister && (
                    <Button
                      className="w-full"
                      variant="hero"
                      onClick={handleOpenDialog}
                    >
                      Register Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {isAdmin && course.isPublished && (
            <Card className="bg-green-50 border-green-200 pt-4">
              <CardContent className="pt-6">
                <div className="flex items-center justify-center text-green-600">
                  <Check className="h-6 w-6 mr-2" />
                  <span className="font-medium">Published</span>
                </div>
              </CardContent>
            </Card>
          )}

          <Button
            onClick={() => router.push("/courses")}
            variant="outline"
            className="w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Courses
          </Button>
        </div>
      </div>

      {/* ID Card Verification Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Identity</DialogTitle>
            <DialogDescription>
              Please enter your ID card number to continue with registration.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onVerifyIdCard)}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="idCard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Card Number</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter your 13-digit ID card number"
                        {...field}
                        maxLength={13}
                      />
                    </FormControl>
                    <FormMessage />
                    {verificationError && (
                      <div className="text-sm font-medium text-destructive mt-1">
                        {verificationError.message}
                      </div>
                    )}
                  </FormItem>
                )}
              />

              <DialogFooter className="sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={"hero"}
                  disabled={isVerifying || isProcessingPayment}
                >
                  {isVerifying
                    ? "Verifying..."
                    : isProcessingPayment
                    ? "Processing Payment..."
                    : "Verify and Continue"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
