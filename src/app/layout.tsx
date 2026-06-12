import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Nursing Efficiency Dashboard",
  description: "Vive Now — Nursing Efficiency Prototype",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#F4F7FA] antialiased">{children}</body>
    </html>
  );
}
