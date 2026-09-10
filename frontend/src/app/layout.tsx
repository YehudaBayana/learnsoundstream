import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import AudioPlayer from "@/components/AudioPlayer";
import DashboardShell from "@/components/DashboardShell";
import { ThemeProvider } from "@/context/ThemeContext";
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
  title: "Soundstream | High-Performance Music Streaming",
  description:
    "A premium music streaming experience powered by Go and Next.js.",
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
            <AudioPlayer />
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
