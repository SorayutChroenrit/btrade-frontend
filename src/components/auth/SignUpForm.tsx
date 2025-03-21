"use client";
import { useState } from "react";
import { Toaster, toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
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
import { PasswordInput } from "../ui/password";
import { ChevronRight } from "lucide-react";
import { Spinner } from "../ui/spinner";
import Link from "next/link";

const formSchema = z
  .object({
    fullname: z.string().min(1, { message: "Full Name is required" }),
    email: z.string().email({ message: "Invalid email address" }).min(1),
    idcard: z.string().min(8, { message: "ID Card is required" }),
    company: z.string().min(1, { message: "Company name is required" }),
    phonenumber: z
      .string()
      .regex(/^\+?\d{10,15}$/, { message: "Invalid phone number" }),
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" }),
    confirmpassword: z.string().min(8),
  })
  .refine((data) => data.password === data.confirmpassword, {
    message: "Passwords don't match",
    path: ["confirmpassword"],
  });

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"form">) {
  // Form state
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullname: "",
      email: "",
      idcard: "",
      company: "",
      phonenumber: "",
      password: "",
      confirmpassword: "",
    },
  });

  // Set up mutation with TanStack React Query
  const registerMutation = useMutation({
    mutationFn: async (data: any) => {
      // Send request to your backend API
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/register`,
        {
          name: data.fullname,
          email: data.email,
          idCard: data.idcard,
          company: data.company,
          phonenumber: data.phonenumber,
          password: data.password,
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
      toast.success("Registration successful!");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      form.reset();
      router.push("/sign-in");
    },
    onError: (error: any) => {
      const errorMessage =
        error.response?.data?.message ||
        "Registration failed. Please try again.";

      // Handle specific field errors if returned by the backend
      if (error.response?.data?.code === "Error-02-0002") {
        const conflictMessage = error.response.data.message;
        if (conflictMessage.includes("email")) {
          form.setError("email", {
            type: "manual",
            message: "This email is already in use",
          });
        } else if (conflictMessage.includes("phonenumber")) {
          form.setError("phonenumber", {
            type: "manual",
            message: "This phone number is already in use",
          });
        } else if (conflictMessage.includes("idcard")) {
          form.setError("idcard", {
            type: "manual",
            message: "This ID card is already in use",
          });
        }
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
    registerMutation.mutate(values);
  }

  return (
    <Form {...form}>
      <form
        className={cn("flex flex-col gap-4 w-full max-w-md mx-auto", className)}
        {...props}
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <div className="flex flex-col items-center gap-2 text-center mb-4">
          <h1 className="text-2xl md:text-3xl font-bold">Sign up to B-Trade</h1>
        </div>
        <div className="grid gap-4 w-full">
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input
                      id="fullname"
                      placeholder="John Doe"
                      type="text"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      id="email"
                      placeholder="you@example.com"
                      type="email"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="idcard"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>ID Card</FormLabel>
                  <FormControl>
                    <Input
                      id="idcard"
                      placeholder="ID Card Number"
                      type="text"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input
                      id="company"
                      placeholder="Company Name"
                      type="text"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="phonenumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      id="phonenumber"
                      placeholder="+66 (555) 123-4567"
                      type="text"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <FormLabel htmlFor="password">Password</FormLabel>
                  </div>
                  <FormControl>
                    <PasswordInput
                      id="password"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-2">
            <FormField
              control={form.control}
              name="confirmpassword"
              render={({ field }) => (
                <FormItem className="grid gap-2">
                  <div className="flex justify-between items-center">
                    <FormLabel htmlFor="password">Confirm Password</FormLabel>
                  </div>
                  <FormControl>
                    <PasswordInput
                      id="confirmpassword"
                      placeholder="••••••••"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            id="submitbutton"
            type="submit"
            className="w-full mt-2 flex items-center justify-center gap-2"
            variant="hero"
            disabled={isSubmitting}
          >
            <>
              {isSubmitting ? (
                <>
                  <Spinner size="small" />
                  <span>Loading...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </>
          </Button>

          <div className="text-balance text-center text-xs text-muted-foreground [&_a]:underline [&_a]:underline-offset-4 hover:[&_a]:text-primary">
            By clicking continue, you agree to our{" "}
            <Link href="#">Terms of Service</Link> and{" "}
            <Link href="#">Privacy Policy</Link>.
          </div>
        </div>
        <Toaster position="bottom-right" richColors />
      </form>
    </Form>
  );
}
