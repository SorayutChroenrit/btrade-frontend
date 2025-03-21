"use client";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";

const SuccessPage = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionId = searchParams.get("session_id");

  const [courseName, setCourseName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(5);

  // Effect to handle session data fetching and training registration
  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError("No session ID found");
      return;
    }

    async function fetchSessionData() {
      try {
        setLoading(true);

        // Step 1: Get session data from checkout
        const sessionResponse = await axios.get(
          `http://localhost:20000/api/v1/checkout-session/${sessionId}`
        );

        const sessionData = sessionResponse.data.data;
        const { userId, courseId } = sessionData.metadata;
        console.log("Session metadata:", { userId, courseId });

        if (!userId || !courseId) {
          setError("Missing user or course information");
          setLoading(false);
          return;
        }

        // Get auth token from localStorage or wherever you store it
        const token = localStorage.getItem("token"); // Adjust based on your auth implementation

        if (!token) {
          console.warn(
            "No authentication token found, trying to register without auth"
          );
        }

        // Step 2: Register for the course
        const registerResponse = await axios.post(
          `http://localhost:20000/api/v1/registerCourse`,
          { userId, courseId },
          {
            headers: {
              Authorization: token ? `Bearer ${token}` : undefined,
              "Content-Type": "application/json",
            },
          }
        );

        console.log("Registration Response:", registerResponse.data);

        // Step 3: Get the course name from the response
        const responseData = registerResponse.data.data;

        if (responseData && responseData.course) {
          // Get course name directly from the response
          setCourseName(responseData.course.courseName);
        } else if (responseData && responseData.trader) {
          // If course name isn't directly available, fetch the course details
          try {
            const courseResponse = await axios.get(
              `http://localhost:20000/api/v1/courses/${courseId}`,
              {
                // headers: {
                //   Authorization: token ? `Bearer ${token}` : undefined,
                // },
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
  }, [sessionId]);

  // Effect to handle countdown and redirect after completion
  useEffect(() => {
    if (loading || error) return; // Don't start countdown if still loading or if there was an error

    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.push("/my-courses");
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [router, loading, error]);

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
        <button
          onClick={() => router.push("/courses")}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Back to Courses
        </button>
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
      <Button onClick={() => router.push("/my-courses")} variant={"hero"}>
        Go to My Courses
      </Button>
    </div>
  );
};

export default SuccessPage;
