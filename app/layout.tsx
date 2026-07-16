import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/session-provider";

export const metadata: Metadata = {
  title: "LOOP — AI Customer-Feedback Intelligence",
  description: "Close the loop on customer feedback.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Suppress hydration warnings if any plugins modify the body class */}
      <body className="font-sans antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
