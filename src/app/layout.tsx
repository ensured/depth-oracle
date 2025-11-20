import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/lib/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { Header } from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://depth-oracle.vercel.app"),
  title: "Depth Oracle - AI Jungian Psychology Companion",
  description:
    "Transform your self-awareness with AI-powered Jungian psychology tools. Explore archetypes, shadow work, and personal growth.",
  keywords:
    "Jungian psychology, shadow work, AI therapy, personal growth, self-discovery, archetypes, individuation, emotional intelligence",
  authors: [{ name: "Depth Oracle Team" }],
  icons: {
    icon: "/og-image.ico",
  },
  openGraph: {
    title: "Depth Oracle - AI Jungian Psychology Companion",
    description:
      "Transform your self-awareness with AI-powered Jungian psychology tools.",
    url: "https://depth-oracle.vercel.app", // Replace with your actual URL
    siteName: "Depth Oracle",
    images: [
      {
        url: "/og-image.ico", // Use the same image for OG
        width: 1200,
        height: 630,
        alt: "Depth Oracle - AI Jungian Insights",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Depth Oracle - AI Jungian Shadow Work",
    description:
      "Transform your self-awareness with AI-powered Jungian psychology tools.",
    images: ["/og-image.ico"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // <ClerkProvider>
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          rel="icon"
          href="/lucid-evolution-al-red.svg"
          type="image/svg+xml"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
    // </ClerkProvider>
  );
}
