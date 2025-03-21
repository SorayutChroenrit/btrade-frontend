// lib/types/index.ts

import { DefaultSession, DefaultUser } from "next-auth";

// Define user roles and status as string literal types
export type UserRole = "admin" | "user";
export type UserStatus = "Active" | "Suspended";

export interface CourseData {
  _id: string;
  courseName: string;
  courseCode: string;
  description: string;
  startDate: any;
  endDate: any;
  courseDate: any;
  courseTags: string[];
  location: string;
  price: number;
  hours: number;
  maxSeats: number;
  availableSeats: number;
  imageUrl?: string;
  isPublished?: boolean;
}

export interface Training {
  date: Date;
  courseName: string;
  location?: string;
  hours: number;
}

export interface TimeDisplay {
  years: number;
  months: number;
  days: number;
}

export interface Trader {
  id: string;
  userId: string;
  company: string;
  name: string;
  idNumber: string;
  email: string;
  phoneNumber?: string;
  startDate: Date;
  endDate: Date;
  durationDisplay: TimeDisplay;
  remainingTimeDisplay: TimeDisplay;
  trainings: Training[];
  isDeleted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface StatusHistoryItem {
  status: string;
  reason: string;
  updatedAt: Date;
  updatedBy?: string;
}

export interface UserData {
  id?: string;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  statusReason: string;
  lastStatusUpdate: Date;
  lastLogin: Date | null;
  statusHistory: StatusHistoryItem[];
  createdAt?: Date;
  updatedAt?: Date;
}

// Next-Auth type extensions
declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
    accessToken?: string;
    traderId?: string;
    traderInfo?: Trader;
    status?: UserStatus;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role?: string;
      accessToken?: string;
      traderId?: string;
      traderInfo?: Trader;
      status?: UserStatus;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    email: string;
    role?: string;
    accessToken?: string;
    traderId?: string;
    traderInfo?: Trader;
    status?: UserStatus;
  }
}
