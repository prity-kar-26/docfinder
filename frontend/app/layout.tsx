import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/ThemeProvider";

export const metadata: Metadata = {
  title: "DocFinder",
  description: "Find and book trusted doctors near you",
};

// suppressHydrationWarning - stops a harmless warning that happens because the theme is decided in the browser, not on the server
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode}>) {
  return (
    <html lang="en" suppressHydrationWarning>    
      <body>
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}

