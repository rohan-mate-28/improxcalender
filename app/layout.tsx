import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Improx Calendar",
  description: "A premium shared calendar."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
