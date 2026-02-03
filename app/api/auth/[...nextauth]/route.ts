import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth";

const handler = NextAuth({
  ...authConfig,
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-key-change-in-production',
  trustHost: true,
});

export { handler as GET, handler as POST };
