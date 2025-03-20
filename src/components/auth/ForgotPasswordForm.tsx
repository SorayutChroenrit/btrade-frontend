"use client";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import * as z from "zod";
import { cn } from "@/lib/utils";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Spinner } from "../ui/spinner";

// Define the schema for forgot password
const formSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

export default function ForgetPassword({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  const forgotPasswordMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/forgot-password`,
        {
          email: data.email,
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
      toast.success("Reset link sent successfully!");
      form.reset();
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Failed to send reset link. Please try again.";
      // Handle specific field errors if returned by the backend
      if (error.response?.data?.code === "Error-02-0003") {
        form.setError("email", {
          type: "manual",
          message: error.response.data.message,
        });
      }
      toast.error(errorMessage);
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Form submission handler
  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    forgotPasswordMutation.mutate(values);
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <div className="flex min-h-[40vh] h-full w-full items-center justify-center px-4">
        <Card className="mx-auto max-w-sm py-6">
          <CardHeader>
            <CardTitle className="text-2xl">Forgot Password</CardTitle>
            <CardDescription>
              Enter your email address to receive a password reset link.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem className="grid gap-2">
                        <FormLabel htmlFor="email">Email</FormLabel>
                        <FormControl>
                          <Input
                            id="email"
                            placeholder="johndoe@mail.com"
                            type="email"
                            autoComplete="email"
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
                        <Spinner size="large" color={"hero"} />
                        <span>Sending...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Reset Link</span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
