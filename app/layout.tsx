import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Teach Me Hub",
  description: "Tutoring platform",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
