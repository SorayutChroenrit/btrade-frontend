"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

const SuccessPage = () => {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");
  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);
  const [shouldRedirect, setShouldRedirect] = useState(false);

  // Effect to handle authentication redirect
  useEffect(() => {
    // Only handle authentication issues here
    if (status === "unauthenticated") {
      const callbackUrl = encodeURIComponent(window.location.href);
      router.push(`/login?callbackUrl=${callbackUrl}`);
    }
  }, [status, router]);

  // Effect to handle session data fetching and training registration
  useEffect(() => {
    // Return early if session is still loading
    if (status === "loading") return;
    // Return early if we need to redirect for auth
    if (status === "unauthenticated") return;

    if (!sessionId) {
      setLoading(false);
      setError("No session ID found");
      return;
    }

    // Ensure we have the user and access token before proceeding
    if (!session?.user?.accessToken) {
      setLoading(false);
      setError("Authentication required");
      return;
    }

    async function fetchSessionData() {
      try {
        setLoading(true);
        const user = session?.user;

        // Step 1: Get session data from checkout
        const sessionResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/checkout-session/${sessionId}`,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        const sessionData = sessionResponse.data.data;
        const { userId, courseId } = sessionData.metadata;
        console.log("Session metadata:", { userId, courseId });

        if (!userId || !courseId) {
          setError("Missing user or course information");
          setLoading(false);
          return;
        }

        // Step 2: Register for the course
        const registerResponse = await axios.post(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/enrollment/registerCourse`,
          { userId, courseId },
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Registration Response:", registerResponse.data);

        // Step 3: Get the course name from the response
        const responseData = registerResponse.data.data;

        if (responseData && responseData.course) {
          // Get course name directly from the response
          setCourseName(
            responseData.course.courseName || responseData.course.name
          );
        } else if (responseData && responseData.trader) {
          // If course name isn't directly available, fetch the course details
          try {
            const courseResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/course/${courseId}`,
              {
                headers: {
                  Authorization: `Bearer ${user?.accessToken}`,
                  "Content-Type": "application/json",
                },
              }
            );

            if (courseResponse.data.data) {
              setCourseName(courseResponse.data.data.courseName);
            }
          } catch (courseError) {
            console.error("Error fetching course details:", courseError);
            // If we can't get the course name, use a default
            setCourseName("your selected course");
          }
        } else {
          // Fallback
          setCourseName("your selected course");
        }

        setLoading(false);
      } catch (error) {
        console.error(
          "Error handling session data or registering for course:",
          error
        );

        // Provide a more specific error message based on the error response
        if (axios.isAxiosError(error) && error.response) {
          console.log("Error details:", error.response.data);
          setError(
            error.response.data?.message ||
              "Failed to process your registration. Please contact support."
          );
        } else {
          setError(
            "Failed to process your registration. Please contact support."
          );
        }

        setLoading(false);
      }
    }

    fetchSessionData();
  }, [sessionId, session, status, router]);

  // Effect to handle countdown and redirect after completion
  useEffect(() => {
    if (loading || error) return; // Don't start countdown if still loading or if there was an error

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          setShouldRedirect(true);
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [loading, error]);

  // Effect to handle actual redirect
  useEffect(() => {
    if (shouldRedirect) {
      router.push("/my-courses");
    }
  }, [shouldRedirect, router]);

  // Navigation handlers
  const handleBackToCourses = () => {
    router.push("/courses");
  };

  const handleGoToMyCourses = () => {
    router.push("/my-courses");
  };

  // Loading states
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-4">
        <h1 className="text-xl font-bold text-blue-600">Loading session...</h1>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-4">
        <h1 className="text-xl font-bold text-blue-600">
          Processing your registration...
        </h1>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-4">
        <h1 className="text-xl font-bold text-red-600">Registration Error</h1>
        <p className="text-gray-700 mt-2">{error}</p>
        <Button onClick={handleBackToCourses} variant="hero" className="mt-4">
          Back to Courses
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-50 text-center p-4">
      <h1 className="text-2xl font-bold text-green-600">
        Payment Successful! 🎉
      </h1>
      <p className="text-gray-700 mt-2">
        Thank you for your purchase. You have successfully registered for the
        course.
      </p>

      {courseName && (
        <p className="text-gray-800 mt-2">
          <strong>Course Name:</strong> {courseName}
        </p>
      )}

      <p className="text-gray-500 mt-4">
        You will be redirected to your courses in{" "}
        <strong>{countdown} seconds</strong>.
      </p>

      <p className="text-gray-500 mt-2">If not, click the button below:</p>
      <Button onClick={handleGoToMyCourses} variant="hero">
        Go to My Courses
      </Button>
    </div>
  );
};

export default SuccessPage;
