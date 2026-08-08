/**
 * @file middleware.ts
 * Global Next.js middleware used to secure routes.
 */
import { withAuth } from "next-auth/middleware";

// Redirects unauthenticated requests to the /login page before they ever reach a
// page component. Route-level role checks (Admin/Analyst/Viewer) still
// happen per-page and per-API-route — this only gates "logged in or not".
export default withAuth({
  pages: { signIn: "/login" },
});

// Protect all authenticated app routes.
// Auth-routes (/login, /register) and static assets are intentionally excluded
// so unauthenticated users can reach the sign-in page without a redirect loop.
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inbox/:path*",
    "/trends/:path*",
    "/ask/:path*",
    "/reports/:path*",
  ],
};
