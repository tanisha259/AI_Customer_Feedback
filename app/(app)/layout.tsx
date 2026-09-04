import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import AppShell from "@/components/app-shell";

/**
 * Layout for all authenticated application routes.
 * Guards all child pages by redirecting unauthenticated users to /login,
 * then wraps the content in the AppShell (sidebar + header + nav).
 */
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");
  return <AppShell>{children}</AppShell>;
}
