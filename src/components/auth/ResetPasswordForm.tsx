"use client";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import * as z from "zod";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Spinner } from "../ui/spinner";
import { PasswordInput } from "../ui/password";

const formSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long" })
      .regex(/[a-zA-Z0-9]/, { message: "Password must be alphanumeric" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

export default function ResetPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Send request to your backend API for password reset
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/reset-password`,
        {
          token: token,
          newPassword: data.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      return response.data;
    },
    onSuccess: async (data) => {
      toast.success(data.message || "Password reset successful!");
      form.reset();
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/sign-in");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Password reset failed. Please try again.";

      // Handle different error codes
      if (error.response?.data?.code === "Error-01-0003") {
        form.setError("confirmPassword", {
          type: "manual",
          message: error.response.data.message,
        });
        // Token related errors
        toast.error(errorMessage);
      } else if (error.response?.data?.code === "Error-02-0003") {
        form.setError("confirmPassword", {
          type: "manual",
          message: error.response.data.message,
        });
        // User not found errors
        toast.error(errorMessage);
      } else if (error.response?.data?.code === "Error-02-0001") {
        form.setError("confirmPassword", {
          type: "manual",
          message: error.response.data.message,
        });
        toast.error(errorMessage);
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    if (!token) {
      toast.error(
        "Invalid or missing reset token. Please request a new password reset link."
      );
      return;
    }
    setIsSubmitting(true);
    resetPasswordMutation.mutate(values);
  }

  return (
    <div
      className={cn(
        "flex min-h-[50vh] h-full w-full items-center justify-center px-4",
        className
      )}
      {...props}
    >
      <Card className="mx-auto max-w-sm py-6">
        <CardHeader>
          <CardTitle className="text-2xl">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password to reset your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <div className="grid gap-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="password">New Password</FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="password"
                          placeholder="********"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem className="grid gap-2">
                      <FormLabel htmlFor="confirmPassword">
                        Confirm Password
                      </FormLabel>
                      <FormControl>
                        <PasswordInput
                          id="confirmPassword"
                          placeholder="********"
                          autoComplete="new-password"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full"
                  variant="hero"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Spinner size="small" />
                      <span>Resetting...</span>
                    </>
                  ) : (
                    <span>Reset Password</span>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
