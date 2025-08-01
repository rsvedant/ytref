import { createAuthClient } from "better-auth/react"
import { authOptions } from "./auth"

export const authClient = createAuthClient({
    ...authOptions,
    captcha: {
        provider: "google-recaptcha-v3",
        siteKey: process.env.GOOGLE_CAPTCHA_SITE_KEY,
    },
})

export const { signIn, signUp, signOut, useSession } = authClient