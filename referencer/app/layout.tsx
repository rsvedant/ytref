import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "@/lib/providers" 
import { ThemeProvider } from "@/components/theme-provider"
import { GlassNav } from "@/components/ui/glass-nav"
import GridSmallBackgroundDemo from "@/components/ui/grid-small-background-demo"

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
        className={`${geistSans.variable} ${geistMono.variable} antialiased relative`}
      >
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {/* Background component for the entire application */}
          <div className="fixed inset-0 z-0">
            <div className="h-full w-full bg-white dark:bg-black [background-size:20px_20px] [background-image:linear-gradient(to_right,#e4e4e7_1px,transparent_1px),linear-gradient(to_bottom,#e4e4e7_1px,transparent_1px)] dark:[background-image:linear-gradient(to_right,#262626_1px,transparent_1px),linear-gradient(to_bottom,#262626_1px,transparent_1px)]" />
          </div>
          
          {/* Navigation */}
          <div className="fixed top-4 left-0 right-0 z-30 flex justify-center px-4">
            <GlassNav />
          </div>
          
          {/* Main content */}
          <div className="relative z-10">
            <Providers>{children}</Providers>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
