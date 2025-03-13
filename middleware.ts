import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Define public paths that don't require authentication
  const publicPaths = ["/", "/sign-in", "/sign-up", "/forgot-password"];
  const isPublicPath = publicPaths.includes(path);

  // Get the token
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect logic
  if (!token && !isPublicPath) {
    // If no token and trying to access a protected route, redirect to login
    return NextResponse.redirect(new URL("/sign-in", request.url));
  }

  if (token && isPublicPath) {
    // If has token and trying to access a public route, redirect to dashboard
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

// Match all routes except for api routes, static files, etc.
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
