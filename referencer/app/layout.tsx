import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers" 
import { ThemeProvider } from "@/components/theme-provider"
import { GlassNav } from "@/components/ui/glass-nav"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "YT Referencer",
  description: "A YouTube video clip management tool",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-40 w-full flex justify-center px-4">
            <GlassNav />
          </div>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  )
}
