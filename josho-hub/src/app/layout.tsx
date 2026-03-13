import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "JoSho Empire Central Hub",
  description: "Unified identity and dashboard core for Music, Real Estate, and IT Solutions."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
