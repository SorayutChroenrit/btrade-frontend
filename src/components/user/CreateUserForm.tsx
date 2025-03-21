"use client";

import { useState } from "react";
import { Toaster, toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import * as z from "zod";
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
import { PasswordInput } from "@/components/ui/password";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ChevronRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useSession } from "next-auth/react";

const userSchema = z
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

type UserFormData = z.infer<typeof userSchema>;

interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function CreateUserDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateUserDialogProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form
  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
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

  // Create mutation for adding user
  const createUserMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      setIsSubmitting(true);

      // Format data for API
      const userData = {
        name: data.fullname,
        email: data.email,
        idCard: data.idcard,
        company: data.company,
        phonenumber: data.phonenumber,
        password: data.password,
      };

      return axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/register`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );
    },
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      toast.success("User created successfully!");

      await new Promise((resolve) => setTimeout(resolve, 2000));
      onOpenChange(false);
      form.reset();
      onSuccess();
    },
    onError: (error: any) => {
      console.error("Error creating user:", error);

      // Handle specific field errors if returned by the backend
      if (
        axios.isAxiosError(error) &&
        error.response?.data?.code === "Error-02-0002"
      ) {
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
      } else if (axios.isAxiosError(error) && error.response) {
        toast.error(
          `Error: ${error.response.data.message || "Something went wrong"}`
        );
      } else {
        toast.error("Failed to create user");
      }
    },
    onSettled: () => {
      setIsSubmitting(false);
    },
  });

  // Form submission handler
  function onSubmit(values: UserFormData) {
    createUserMutation.mutate(values);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new user account.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-4 w-full"
          >
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" required {...field} />
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
                    <Input
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

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="idcard"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ID Card</FormLabel>
                    <FormControl>
                      <Input placeholder="ID Card Number" required {...field} />
                    </FormControl>
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
                      <Input placeholder="Company Name" required {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="phonenumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="0811234567" required {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmpassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <PasswordInput
                        placeholder="••••••••"
                        autoComplete="new-password"
                        required
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="text-xs text-muted-foreground mt-2">
              All fields are required. Password must be at least 8 characters.
            </div>

            <DialogFooter className="mt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="hero"
                className="flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="small" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Create User</span>
                    <ChevronRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
        <Toaster position="bottom-right" richColors />
      </DialogContent>
    </Dialog>
  );
}
