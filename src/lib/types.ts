import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
export interface ApplicationPeriod {
  startDate: string;
  endDate: string;
}

export interface Course {
  courseId: string;
  courseName: string;
  price: string;
  description: string;
  applicationPeriod: ApplicationPeriod;
  courseDate: string;
  location: string;
  imageUrl?: string;
  courseTag: string | string[];
  isPublished: boolean;
  currentEnrollment: number;
  enrollmentLimit: number;
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
