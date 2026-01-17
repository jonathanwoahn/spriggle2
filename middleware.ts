import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Paths that should bypass setup/auth checks
const SETUP_BYPASS_PATHS = [
  '/setup',
  '/api/setup',
  '/_next',
  '/favicon.ico',
];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Allow setup paths and static assets through without any checks
  if (SETUP_BYPASS_PATHS.some(path => pathname.startsWith(path))) {
    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  }

  // Check if database is configured via env var
  // If not, redirect to setup wizard
  if (!process.env.DATABASE_URL) {
    return NextResponse.redirect(new URL('/setup', req.url));
  }

  // Check setup status via cookie (set by setup completion)
  const setupComplete = req.cookies.get('setup_complete')?.value === 'true';

  if (!setupComplete) {
    // Check with API to confirm (only if cookie not set)
    try {
      const baseUrl = req.nextUrl.origin;
      const response = await fetch(`${baseUrl}/api/setup/status`, {
        headers: {
          cookie: req.headers.get('cookie') || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (!data.isComplete) {
          // Redirect to setup wizard
          return NextResponse.redirect(new URL('/setup', req.url));
        }
      }
    } catch {
      // If we can't check, redirect to setup
      return NextResponse.redirect(new URL('/setup', req.url));
    }
  }

  // Now apply auth middleware for authenticated routes
  // Import auth dynamically to avoid database connection at module load
  const { auth } = await import("@/auth");

  // Check if this is a protected route
  const protectedPaths = ['/admin', '/protected'];
  const isProtectedRoute = protectedPaths.some(path => pathname.startsWith(path));

  return auth(async (authReq) => {
    // If it's a protected route and user is not authenticated, redirect to sign-in
    if (isProtectedRoute && !authReq.auth) {
      const signInUrl = new URL('/sign-in', req.url);
      signInUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(signInUrl);
    }

    const response = NextResponse.next();
    response.headers.set('x-pathname', pathname);
    return response;
  })(req, { params: Promise.resolve({}) });
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
