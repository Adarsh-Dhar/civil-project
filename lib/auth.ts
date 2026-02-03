import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";

// Test credentials
const testUsers = [
  {
    id: "1",
    email: "test@gmail.com",
    password: "test123",
    name: "Test User",
    role: "Project Manager",
  },
];

export const authConfig = {
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

      // Redirect authenticated users away from auth pages
      if (isOnAuthPage && isLoggedIn) {
        return false; // Will redirect to default redirect URL
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
        token.role = (user as any).role;
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
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = testUsers.find(
          (u) =>
            u.email === credentials.email &&
            u.password === credentials.password
        );

        if (user) {
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          };
        }

        return null;
      },
    }),
  ],
} satisfies NextAuthConfig;
