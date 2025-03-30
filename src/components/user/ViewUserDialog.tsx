"use client";

import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  CalendarIcon,
  Mail,
  Phone,
  Building,
  CreditCard,
  UserCheck,
  Clock,
  ShieldCheck,
  BookOpen,
  AlertCircle,
  Calendar,
  MapPin,
  Timer,
  CheckCircle,
  AlertTriangle,
  History,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Combined types based on your MongoDB schemas
interface UserData {
  _id: string;
  email: string;
  role: string;
  status: "Active" | "Suspended" | "Locked" | "inactive";
  statusReason?: string;
  lastStatusUpdate?: Date;
  lastLogin?: Date | null;
  statusHistory?: {
    status: string;
    reason: string;
    updatedAt: Date;
    updatedBy: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

interface TrainingData {
  courseId: string;
  courseName: string;
  description: string;
  location?: string;
  hours: number;
  date: Date;
  imageUrl: string;
  isCompleted: boolean;
}

interface TraderData {
  _id: string;
  userId: string;
  company: string;
  name: string;
  idCard: string;
  email: string;
  phoneNumber: string;
  startDate?: Date;
  endDate?: Date;
  durationDisplay?: {
    years: number;
    months: number;
    days: number;
  };
  remainingTimeDisplay?: {
    years: number;
    months: number;
    days: number;
  };
  trainings: TrainingData[];
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ViewUserTrainingProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userData: UserData | null;
  traderData: TraderData | null;
  onEdit: () => void;
}

// User status mapping for colors
const userStatusColors: Record<string, string> = {
  active: "bg-green-100 text-green-800",
  pending: "bg-yellow-100 text-yellow-800",
  suspended: "bg-red-100 text-red-800",
  locked: "bg-red-100 text-red-800",
  inactive: "bg-gray-100 text-gray-800",
};

// User role mapping for display
const userRoleLabels: Record<string, string> = {
  admin: "Administrator",
  user: "Standard User",
  instructor: "Instructor",
  student: "Student",
  manager: "Manager",
};

export function ViewUserTrainingDialog({
  open,
  onOpenChange,
  userData,
  traderData,
  onEdit,
}: ViewUserTrainingProps) {
  if (!userData) return null;

  const formatDate = (date: any) => {
    try {
      if (!date) return "N/A";

      const dateValue = dayjs(date.$date || date);

      if (!dateValue.isValid()) {
        return "Invalid date";
      }

      return dateValue.format("MMMM D, YYYY");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  const formatDateTime = (date: any) => {
    try {
      if (!date) return "N/A";

      const dateValue = dayjs(date.$date || date);

      if (!dateValue.isValid()) {
        return "Invalid date";
      }

      return dateValue.format("MMMM D, YYYY [at] HH:mm");
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };

  // Format duration display
  const formatDuration = (duration?: {
    years: number;
    months: number;
    days: number;
  }) => {
    if (!duration) return "N/A";

    const parts = [];
    // Always include years, even if zero
    parts.push(`${duration.years} year${duration.years !== 1 ? "s" : ""}`);

    // Always include months, even if zero
    parts.push(`${duration.months} month${duration.months !== 1 ? "s" : ""}`);

    // Always include days, even if zero
    parts.push(`${duration.days} day${duration.days !== 1 ? "s" : ""}`);

    return parts.length > 0 ? parts.join(", ") : "N/A";
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle>{traderData?.name || userData.email}</DialogTitle>
          <DialogDescription>
            <span className="flex items-center gap-1">
              <Badge
                className={
                  userStatusColors[userData.status?.toLowerCase() || "inactive"]
                }
              >
                {userData.status || "Unknown Status"}
              </Badge>
              <span className="text-muted-foreground"> • </span>
              {userRoleLabels[userData.role?.toLowerCase()] ||
                userData.role ||
                "No role assigned"}
            </span>
          </DialogDescription>
        </DialogHeader>

        <Tabs
          defaultValue="user-info"
          className="w-full flex-1 flex flex-col overflow-hidden"
        >
          <TabsList className="w-full justify-start px-6 pt-2">
            <TabsTrigger value="user-info">User Information</TabsTrigger>
            <TabsTrigger value="training-info">
              Training Information
            </TabsTrigger>
            {userData.statusHistory && userData.statusHistory.length > 0 && (
              <TabsTrigger value="status-history">Status History</TabsTrigger>
            )}
          </TabsList>

          <div className="flex-1 overflow-auto">
            <TabsContent value="user-info" className="p-6 pt-4 h-full">
              <Card className="pt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Personal Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email
                      </h3>
                      <p className="text-gray-700">{userData.email}</p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Phone className="h-4 w-4" /> Phone Number
                      </h3>
                      <p className="text-gray-700">
                        {traderData?.phoneNumber || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <CreditCard className="h-4 w-4" /> ID Card
                      </h3>
                      <p className="text-gray-700">
                        {traderData?.idCard || "Not provided"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Building className="h-4 w-4" /> Company
                      </h3>
                      <p className="text-gray-700">
                        {traderData?.company || "Not provided"}
                      </p>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4" /> Last Login
                      </h3>
                      <p className="text-gray-700">
                        {userData.lastLogin ? (
                          formatDateTime(userData.lastLogin)
                        ) : (
                          <span className="text-muted-foreground italic">
                            Not logged in yet
                          </span>
                        )}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-sm font-medium flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4" /> Created At
                      </h3>
                      <p className="text-gray-700">
                        {formatDateTime(userData.createdAt)}
                      </p>
                    </div>
                  </div>

                  {traderData?.startDate || traderData?.endDate ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> Start Date
                        </h3>
                        <p className="text-gray-700">
                          {traderData?.startDate
                            ? formatDate(traderData.startDate)
                            : "N/A"}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Calendar className="h-4 w-4" /> End Date
                        </h3>
                        <p className="text-gray-700">
                          {traderData?.endDate
                            ? formatDate(traderData.endDate)
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ) : null}

                  {(traderData?.durationDisplay ||
                    traderData?.remainingTimeDisplay ||
                    (!traderData?.startDate && !traderData?.endDate)) && (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Timer className="h-4 w-4" /> Total Duration
                        </h3>
                        <p className="text-gray-700">
                          {formatDuration(traderData?.durationDisplay)}
                        </p>
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-sm font-medium flex items-center gap-2">
                          <Timer className="h-4 w-4" /> Remaining Time
                        </h3>
                        <p className="text-gray-700">
                          {!traderData?.startDate && !traderData?.endDate
                            ? "N/A"
                            : formatDuration(traderData?.remainingTimeDisplay)}
                        </p>
                      </div>
                    </div>
                  )}
                  {userData.status === "Suspended" && userData.statusReason && (
                    <div className="space-y-2 mt-4 bg-amber-50 p-3 rounded-md border border-amber-200">
                      <h3 className="text-sm font-medium flex items-center gap-2 text-amber-800">
                        <AlertCircle className="h-4 w-4" /> Suspension Reason
                      </h3>
                      <p className="text-amber-700">{userData.statusReason}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="training-info" className="p-6 pt-4 h-full">
              {traderData &&
              traderData.trainings &&
              traderData.trainings.length > 0 ? (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">Training Courses</h3>
                    <Badge variant="outline" className="ml-2">
                      {traderData.trainings.length} Course
                      {traderData.trainings.length !== 1 ? "s" : ""}
                    </Badge>
                  </div>

                  {traderData.trainings.map((training, index) => (
                    <Card
                      key={index}
                      className={`pt-6 ${
                        training.isCompleted ? "border-green-200" : ""
                      }`}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-base">
                              {training.courseName}
                            </CardTitle>
                            <CardDescription>
                              {training.description}
                            </CardDescription>
                          </div>
                          {training.isCompleted ? (
                            <Badge className="bg-green-100 text-green-800">
                              Completed
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-100 text-blue-800">
                              Pending
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <h4 className="text-xs font-medium flex items-center gap-1 text-gray-500">
                              <Calendar className="h-3 w-3" /> Date
                            </h4>
                            <p>{formatDate(training.date)}</p>
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-xs font-medium flex items-center gap-1 text-gray-500">
                              <Timer className="h-3 w-3" /> Duration
                            </h4>
                            <p>
                              {training.hours} hour
                              {training.hours !== 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>

                        {training.location && (
                          <div className="space-y-1">
                            <h4 className="text-xs font-medium flex items-center gap-1 text-gray-500">
                              <MapPin className="h-3 w-3" /> Location
                            </h4>
                            <p>{training.location}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-muted-foreground">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <h3 className="text-lg font-medium mb-1">
                    No Training Courses
                  </h3>
                  <p>
                    This user has not been enrolled in any training courses yet.
                  </p>
                </div>
              )}
            </TabsContent>

            {userData.statusHistory && userData.statusHistory.length > 0 && (
              <TabsContent value="status-history" className="p-6 pt-4 h-full">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <History className="h-5 w-5" /> Status History
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {userData.statusHistory.map((historyItem, index) => (
                        <div key={index} className="border rounded-md p-3">
                          <div className="flex justify-between mb-2">
                            <Badge
                              className={
                                userStatusColors[
                                  historyItem.status.toLowerCase() || "inactive"
                                ]
                              }
                            >
                              {historyItem.status}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              {formatDateTime(historyItem.updatedAt)}
                            </span>
                          </div>
                          {historyItem.reason && (
                            <p className="text-sm mt-1">{historyItem.reason}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </div>
        </Tabs>

        <DialogFooter className="flex justify-end gap-3 p-6 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button
            onClick={onEdit}
            className="bg-amber-500 hover:bg-amber-600 text-white"
          >
            Edit User
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
