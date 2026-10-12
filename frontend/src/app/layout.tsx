import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import DashboardShell from "@/features/dashboard/components/DashboardShell";
import { ThemeProvider } from "@/shared/context/ThemeContext";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Dance Journal | Private Video Archive",
  description: "A local private dance journal for uploading and reviewing practice videos.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <QueryProvider>
          <ThemeProvider>
            <DashboardShell>{children}</DashboardShell>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
