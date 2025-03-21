// auth.ts or route.ts (NextAuth handler)
import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios, { AxiosError } from "axios";
import { JWT } from "next-auth/jwt";
import { Session } from "next-auth";

// Define custom user type
interface User {
  id: string;
  email: string;
  role: string;
  traderId: string;
  traderInfo: any; // Consider creating a specific type for traderInfo
  accessToken: string;
}

// Define the structure of the API response
interface LoginResponse {
  data: {
    userId: string;
    email: string;
    role: string;
    traderId: string;
    traderInfo: any;
    token: string;
  };
}

// Define error response structure
interface ErrorResponse {
  code: string;
  message: string;
}

// Extend the built-in session type
interface CustomSession extends Session {
  user: {
    id: string;
    email: string;
    role: string;
    accessToken: string;
    traderId: string;
    traderInfo: any;
  } & Session["user"];
}

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          const response = await axios.post<LoginResponse>(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/v1/login`,
            {
              email: credentials.email,
              password: credentials.password,
            },
            {
              headers: {
                "Content-Type": "application/json",
              },
            }
          );

          const userData = response.data.data;
          if (userData && userData.token) {
            return {
              id: userData.userId,
              email: userData.email,
              role: userData.role,
              traderId: userData.traderId,
              traderInfo: userData.traderInfo,
              accessToken: userData.token,
            } as User;
          }

          // If we get here, the login was rejected
          throw new Error("Invalid email or password");
        } catch (error) {
          // Handle specific error codes from the backend
          const axiosError = error as AxiosError<{
            code: string;
            message: string;
          }>;

          if (axiosError.response) {
            const { status, data } = axiosError.response;

            // Map specific error codes to user-friendly messages
            switch (data?.code) {
              case "Error-02-0001":
                throw new Error("Email and password are required");
              case "Error-02-0003":
                throw new Error("User not found. Please check your email");
              case "Error-02-0004":
                throw new Error("Invalid password. Please try again");
              case "Error-02-0005":
                throw new Error(
                  data.message ||
                    "Account is not active. Please contact support"
                );
              default:
                // Use the message directly from the backend if available
                if (data?.message) {
                  throw new Error(data.message);
                }
            }
          }

          // Fallback error message
          const errorMessage =
            (axiosError.response?.data as ErrorResponse)?.message ||
            (error as Error).message ||
            "Authentication failed";

          console.error("Auth error:", errorMessage);
          throw new Error(errorMessage);
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: JWT; user: any }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.accessToken = user.accessToken;
        token.traderId = user.traderId;
        token.traderInfo = user.traderInfo;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: JWT }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.role = token.role as string;
        session.user.accessToken = token.accessToken as string;
        session.user.traderId = token.traderId as string;
        session.user.traderInfo = token.traderInfo;
      }
      return session as CustomSession;
    },
  },
  pages: {
    signIn: "/sign-in",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60,
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
