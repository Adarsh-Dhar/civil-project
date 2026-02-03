import NextAuth from "next-auth";
import { authConfig } from "./lib/auth";

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production',
  trustHost: true,
});
