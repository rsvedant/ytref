import { createAuthClient } from "better-auth/react"
import { allowedOrigins } from "./cors"
export const authClient = createAuthClient({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    trustedOrigins: allowedOrigins
})

export const { signIn, signUp, signOut, useSession } = authClient