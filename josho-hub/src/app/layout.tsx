import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sohaya",
  description: "Mumbai's premier music marketplace. Find, book, and enjoy the best musicians for your event."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
