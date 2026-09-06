import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EZEE Fee & Attendance",
  description: "Simple tuition fee and attendance management for teachers."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
