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
