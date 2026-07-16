import { withAuth } from "next-auth/middleware";

// Redirects unauthenticated requests to /login before they ever reach a
// page component. Route-level role checks (Admin/Analyst/Viewer) still
// happen per-page and per-API-route — this only gates "logged in or not".
export default withAuth({
  pages: { signIn: "/login" },
});

// Define paths where the middleware should run
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/inbox/:path*",
    "/trends/:path*",
    "/ask/:path*",
    "/reports/:path*",
  ],
};
