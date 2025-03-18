import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
export interface ApplicationPeriod {
  startDate: string;
  endDate: string;
}

export interface CourseData {
  id: string;
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

declare module "next-auth" {
  interface User extends DefaultUser {
    role?: string;
    accessToken?: string;
    traderId?: string;
    traderInfo?: any;
  }

  interface Session {
    user: {
      id: string;
      email: string;
      role?: string;
      accessToken?: string;
      traderId?: string;
      traderInfo?: any;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: string;
    email: string;
    role?: string;
    accessToken?: string;
    traderId?: string;
    traderInfo?: any;
  }
}
