import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24 text-center">
      <h2 className="mb-4 text-4xl font-bold tracking-tight">404 - Page Not Found</h2>
      <p className="mb-8 text-lg text-muted-foreground">
        Could not find the requested resource.
      </p>
      <Link
        href="/"
        className="rounded-md bg-ink px-4 py-2 text-paper hover:opacity-90 transition-opacity"
      >
        Return Home
      </Link>
    </div>
  );
}
