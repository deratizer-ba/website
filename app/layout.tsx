import type { Metadata } from "next"
import { Geist } from "next/font/google"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import {
  GoogleTagManager,
  GoogleTagManagerNoscript,
} from "@/components/analytics/google-tag-manager"
import { CookieConsentBar } from "@/components/analytics/cookie-consent-bar"
import { getSiteName, getSiteUrl } from "@/lib/site-config"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
})

const siteUrl = getSiteUrl()
const siteName = getSiteName()

export const metadata: Metadata = {
  ...(siteUrl ? { metadataBase: new URL(siteUrl) } : {}),
  title: siteName
    ? `${siteName} - Profesionálna deratizácia`
    : "Profesionálna deratizácia",
  description:
    "Spoľahlivé služby deratizácie, dezinfekcie a dezinsekcie pre váš domov aj firmu.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="sk" className={geistSans.variable} suppressHydrationWarning>
      <body className="antialiased">
        <GoogleTagManager />
        <GoogleTagManagerNoscript />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <CookieConsentBar />
        </ThemeProvider>
      </body>
    </html>
  )
}
