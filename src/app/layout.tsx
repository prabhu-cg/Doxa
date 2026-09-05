import type { Metadata } from "next";
import { Manrope, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { clientEnv } from "@/lib/env/client";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_NAME = "Doxa";
const DEFAULT_DESCRIPTION =
  "Doxa helps organisations collect feedback, understand what matters, prioritise with confidence, and communicate better decisions.";

export const metadata: Metadata = {
  metadataBase: new URL(clientEnv.NEXT_PUBLIC_APP_URL),
  title: {
    default: "Doxa — Turn community input into better decisions",
    template: `%s · ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: "Doxa — Turn community input into better decisions",
    description: DEFAULT_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: "Doxa — Turn community input into better decisions",
    description: DEFAULT_DESCRIPTION,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>{children}</TooltipProvider>
        <Toaster />
      </body>
    </html>
  );
}
