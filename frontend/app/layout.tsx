import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { DesktopOnlyGuard } from "@/components/shared/DesktopOnlyGuard";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "DocFinder",
  description: "Find and book trusted doctors near you",
};

// suppressHydrationWarning - stops a harmless warning that happens because the theme is decided in the browser, not on the server
// {children} is where Next.js automatically drops in whichever page you're currently on, so this layout wraps all pages in the app
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <Toaster />
          {children}</ThemeProvider>   
        {/* <ThemeProvider>
          <DesktopOnlyGuard>{children}</DesktopOnlyGuard>
        </ThemeProvider>  - alrets to use this site on desktop if the user is on a mobile device, but this is not needed for now since the app is responsive and works on mobile */}
      </body>
    </html>
  );
}


