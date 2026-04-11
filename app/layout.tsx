import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HEVANIYA — Admin",
  description: "Content management system for HEVANIYA"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-screen bg-gradient-to-br from-brand-sand/40 via-white to-brand-sand/20">{children}</main>
      </body>
    </html>
  );
}
