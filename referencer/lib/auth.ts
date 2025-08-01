import { betterAuth } from "better-auth"
import { prismaAdapter } from "better-auth/adapters/prisma"
import type { BetterAuthOptions } from "better-auth"
import { allowedOrigins } from "@/lib/cors"
import { prisma } from "./prisma"

const authOptions: BetterAuthOptions = {
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  trustedOrigins: allowedOrigins,
  emailAndPassword: {
    enabled: true, 
  }, 
  socialProviders: {
    google: {
    clientId: process.env.GOOGLE_CLIENT_ID as string, 
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string, 
    }, 
  }, 
  database: prismaAdapter(prisma, {
  provider: "postgresql",
  }),
}

export const auth = betterAuth(authOptions)