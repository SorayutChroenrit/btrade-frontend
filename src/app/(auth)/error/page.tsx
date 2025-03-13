"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, ArrowLeft } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState<string>(
    "An authentication error occurred"
  );
  const [errorDescription, setErrorDescription] = useState<string>(
    "Please try again or contact support if the problem persists."
  );

  useEffect(() => {
    // Get error type from URL
    const error = searchParams.get("error");

    // Handle specific error types
    if (error) {
      switch (error) {
        case "Configuration":
          setErrorMessage("Server configuration error");
          setErrorDescription(
            "There is a problem with the server configuration. Please contact support."
          );
          break;
        case "AccessDenied":
          setErrorMessage("Access denied");
          setErrorDescription("You do not have permission to sign in.");
          break;
        case "Verification":
          setErrorMessage("Verification error");
          setErrorDescription(
            "The verification link is invalid or has expired."
          );
          break;
        case "OAuthSignin":
        case "OAuthCallback":
        case "OAuthCreateAccount":
        case "EmailCreateAccount":
        case "Callback":
          setErrorMessage("Sign in error");
          setErrorDescription(
            "There was a problem signing you in. Please try again."
          );
          break;
        case "OAuthAccountNotLinked":
          setErrorMessage("Account not linked");
          setErrorDescription(
            "This email is already associated with another account. Please sign in using the original provider."
          );
          break;
        case "EmailSignin":
          setErrorMessage("Email sign in error");
          setErrorDescription(
            "The email could not be sent or there was a problem with the email link."
          );
          break;
        case "CredentialsSignin":
          setErrorMessage("Invalid credentials");
          setErrorDescription(
            "The email or password you entered is incorrect."
          );
          break;
        case "SessionRequired":
          setErrorMessage("Session required");
          setErrorDescription("You must be signed in to access this page.");
          break;
        default:
          setErrorMessage("Authentication error");
          setErrorDescription(
            "An unexpected error occurred during authentication."
          );
      }
    }
  }, [searchParams]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-red-600">
            Authentication Error
          </CardTitle>
          <CardDescription>
            There was a problem with your authentication
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>{errorMessage}</AlertTitle>
            <AlertDescription>{errorDescription}</AlertDescription>
          </Alert>

          <div className="text-sm text-gray-500">
            <p>Error code: {searchParams.get("error") || "Unknown"}</p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" asChild>
            <Link href="/sign-in">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Sign In
            </Link>
          </Button>
          <Button asChild variant="hero">
            <Link href="/">Go to Homepage</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
