"use client"

import { AuthUIProvider } from "@daveyplate/better-auth-ui"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { ReactNode } from "react"

import { authClient } from "@/lib/auth-client"

export function Providers({ children }: { children: ReactNode }) {
    const router = useRouter()

    return (
        <AuthUIProvider
          authClient={authClient}
          navigate={router.push}
          replace={router.replace}
          onSessionChange={() => router.refresh()}
          social={{
            providers: ["google"]
          }}
          Link={Link}
          captcha={{
            provider: "google-recaptcha-v3",
            siteKey: process.env.GOOGLE_CAPTCHA_SITE_KEY || ""
          }}
        >
          {children}
        </AuthUIProvider>
    )
}