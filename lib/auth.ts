import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

const authConfig = {
  adapter: PrismaAdapter(prisma),
  pages: {
    signIn: "/auth/login",
    signUp: "/auth/signup",
  },
  callbacks: {
    authorized({ auth, request: { pathname } }) {
      const isLoggedIn = !!auth?.user;
      const isOnAuthPage =
        pathname.startsWith("/auth/login") ||
        pathname.startsWith("/auth/signup") ||
        pathname.startsWith("/auth/onboarding");

      // Redirect authenticated users away from login/signup to dashboard, but allow onboarding
      if ((pathname.startsWith("/auth/login") || pathname.startsWith("/auth/signup")) && isLoggedIn) {
        return Response.redirect(new URL('/auth/onboarding', request.url));
      }

      // Allow access to auth pages for unauthenticated users
      if (isOnAuthPage) {
        return true;
      }

      // Require authentication for all other routes
      return isLoggedIn;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as any).role = token.role;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email as string },
          });

          if (!user || !user.password) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password as string,
            user.password
          );

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASS,
        },
      },
      from: process.env.EMAIL_FROM,
    }),
  ],
} satisfies NextAuthConfig;

export { authConfig };

const authResult = NextAuth(authConfig);
export const { auth, handlers, signIn, signOut } = authResult;
