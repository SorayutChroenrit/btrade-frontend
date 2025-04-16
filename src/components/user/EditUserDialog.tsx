"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { Building, Mail, Phone, CreditCard } from "lucide-react";
import { useSession } from "next-auth/react";

// Define the form schema with Zod
const userFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  phoneNumber: z.string().optional(),
  idCard: z.string().optional(),
  company: z.string().optional(),
});

// Create a type for the form values
type UserFormValues = z.infer<typeof userFormSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  onSuccess: () => void;
}

export function EditUserDialog({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: EditUserDialogProps) {
  const { data: session } = useSession();
  const user = session?.user;
  const [isLoading, setIsLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [traderId, setTraderId] = useState<string | null>(null);

  // Initialize the form
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      email: "",
      phoneNumber: "",
      idCard: "",
      company: "",
    },
  });

  // Fetch user and trader data when the dialog opens
  useEffect(() => {
    const fetchUserData = async () => {
      if (!open || !userId) return;

      setFetchLoading(true);
      setError(null);

      try {
        // Fetch user data
        const userResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user/${userId}`,
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
        const userData = userResponse.data.data;
        // Fetch trader data
        let traderData = null;
        try {
          const traderResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trader/${userId}`,
            {
              headers: {
                Authorization: `Bearer ${user?.accessToken}`,
                "Content-Type": "application/json",
              },
            }
          );
          traderData = traderResponse.data.data;
          // Store the trader ID for later use
          if (traderData && traderData._id) {
            setTraderId(traderData._id);
          }
        } catch (err) {
          console.log("No trader data found or error fetching trader data");
        }

        // Only set the fields we need for editing
        form.reset({
          email: userData.email || "",
          phoneNumber: traderData?.phoneNumber || "",
          idCard: traderData?.idCard || "",
          company: traderData?.company || "",
        });
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data. Please try again.");
      } finally {
        setFetchLoading(false);
      }
    };

    fetchUserData();
  }, [open, userId, form, user]);

  // Handle form submission
  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      // Update user data - now matching the backend API structure
      await axios.put(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/user`,
        {
          _id: userId,
          email: data.email,
        },
        {
          headers: {
            Authorization: `Bearer ${user?.accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Update trader data if traderId exists
      if (traderId) {
        await axios.put(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/trader`,
          {
            traderId,
            email: data.email,
            company: data.company,
            idCard: data.idCard,
            phoneNumber: data.phoneNumber,
          },
          {
            headers: {
              Authorization: `Bearer ${user?.accessToken}`,
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Show success message
      toast.success("User updated successfully");

      // Close the dialog
      onOpenChange(false);

      // Call onSuccess to refetch data
      onSuccess();
    } catch (err) {
      console.error("Error updating user:", err);
      setError("Failed to update user. Please try again.");
      toast.error("Failed to update user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle>Edit User</DialogTitle>
          <DialogDescription>Update basic user information</DialogDescription>
        </DialogHeader>

        {fetchLoading ? (
          <div className="flex justify-center items-center py-8">
            <Spinner size="medium" />
          </div>
        ) : error ? (
          <div className="text-red-500 p-6">{error}</div>
        ) : (
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-auto p-6">
                <div className="space-y-6">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <Mail className="h-4 w-4" /> Email
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter email" {...field} />
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
                        <FormLabel className="flex items-center gap-2">
                          <Phone className="h-4 w-4" /> Phone Number
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter phone number" {...field} />
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
                        <FormLabel className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" /> ID Card
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter ID card number"
                            {...field}
                          />
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
                        <FormLabel className="flex items-center gap-2">
                          <Building className="h-4 w-4" /> Company
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="Enter company name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <DialogFooter className="flex justify-end gap-3 p-6 pt-2 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-600 text-white"
                  disabled={isLoading}
                >
                  {isLoading ? <Spinner size="small" /> : "Save Changes"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
