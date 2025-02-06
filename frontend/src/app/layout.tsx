import { GeistSans } from "geist/font/sans"
import type { Metadata } from "next"
import "./globals.css"

import Footer from "@/components/ui/footer"
import { siteConfig } from "./siteConfig"
import { ThemeProvider } from "@/providers/theme-provider"
import ContextProvider from "@/providers/context"
import { cookieToInitialState } from "wagmi"
import { wagmiAdapter } from "@/config"
import { headers } from "next/headers"

export const metadata: Metadata = {
  metadataBase: new URL("https://yoururl.com"),
  title: siteConfig.name,
  description: siteConfig.description,
  keywords: ["AI Agents", "Flow", "No-Code Tool"],
  authors: [
    {
      name: "yourname",
      url: "",
    },
  ],
  creator: "yourname",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    creator: "@yourname",
  },
  icons: {
    icon: "/favicon.ico",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const initialState = cookieToInitialState(
    wagmiAdapter.wagmiConfig,
    (await headers()).get("cookie"),
  )

  return (
    <html lang="en">
      <body
        className={`${GeistSans.className} min-h-screen overflow-x-hidden scroll-auto bg-gray-50 antialiased selection:bg-orange-100 selection:text-orange-600`}
      >
        <ContextProvider initialState={initialState}>
          <ThemeProvider attribute="class" defaultTheme="dark">
            {children}
            <Footer />
          </ThemeProvider>
        </ContextProvider>
      </body>
    </html>
  )
}
