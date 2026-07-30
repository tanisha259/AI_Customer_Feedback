import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/session-provider";
import { ThemeProvider } from "@/components/theme-provider";
export const metadata: Metadata = {
  title: "LOOP — AI Customer-Feedback Intelligence",
  description: "Close the loop on customer feedback.",
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      {/* Suppress hydration warnings if any plugins modify the body class */}
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
// Note: Root layout initializes global styles and providers.
