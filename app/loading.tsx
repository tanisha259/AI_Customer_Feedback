/**
 * Global loading UI for the Next.js App Router.
 * Automatically wraps page transitions in a React Suspense boundary.
 */
export default function Loading() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-ink"></div>
      <p className="mt-4 text-muted-foreground animate-pulse">Loading...</p>
    </div>
  );
}
