import type { Metadata } from "next";
import "./globals.css";
import { Inter } from "next/font/google";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: "Field Helper",
  description: "Field Helper",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        {/* Optionally include meta tags for theme colors */}
        <meta name="theme-color" content="#000000" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
