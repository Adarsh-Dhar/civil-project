# NextAuth Authentication Setup - LoopBuild

## Overview

LoopBuild uses **NextAuth.js** with Credentials provider for email/password authentication. All routes are protected with automatic redirection to login for unauthenticated users.

## Test Credentials

```
Email:    test@gmail.com
Password: test123
```

## Architecture

### Files Created

1. **`/lib/auth.ts`** - NextAuth configuration with Credentials provider
2. **`/auth.ts`** - NextAuth instance wrapper
3. **`/app/api/auth/[...nextauth]/route.ts`** - NextAuth API route handler
4. **`/proxy.ts`** - Request interceptor for route protection (Next.js 16)
5. **`/app/providers.tsx`** - SessionProvider wrapper for client-side session
6. **`/app/auth/layout.tsx`** - Auth pages layout styling
7. **`/app/auth/login/page.tsx`** - Login page with NextAuth integration
8. **`/app/auth/signup/page.tsx`** - Demo signup page (redirects to login)
9. **`/app/auth/onboarding/page.tsx`** - Onboarding flow after login

### Key Components Updated

- **`/app/layout.tsx`** - Wrapped with SessionProvider
- **`/components/header.tsx`** - Added logout button
- **`/components/sidebar.tsx`** - Added Next.js Link routing

## Authentication Flow

```
1. User visits any protected route (e.g., /dashboard)
2. Proxy.ts checks if user is authenticated
3. If not authenticated → Redirect to /auth/login
4. User enters credentials (test@gmail.com / test123)
5. NextAuth Credentials provider validates credentials
6. If valid → Create session and redirect to /dashboard
7. User can logout via header button → Redirect to /auth/login
8. Session persists across page refreshes
```

## Protected Routes

All routes except `/auth/*` are protected:

### Public Routes
- `/auth/login` - Login page
- `/auth/signup` - Signup info page
- `/auth/onboarding` - Onboarding wizard

### Protected Routes (Require Auth)
- `/dashboard` - Main dashboard
- `/projects` - Projects list
- `/projects/[projectId]/*` - All project sub-pages
- `/settings` - Settings page
- `/reports` - Reports page

## How It Works

### 1. Proxy/Middleware Pattern (proxy.ts)

Runs on every request to intercept and check authentication:

```typescript
// If user is NOT authenticated
if (!req.auth) {
  return Response.redirect(new URL("/auth/login", req.nextUrl));
}

// If user IS authenticated but on auth page
if (pathname.startsWith("/auth/") && req.auth) {
  return Response.redirect(new URL("/dashboard", req.nextUrl));
}
```

### 2. Session Provider (app/providers.tsx)

Wraps the entire app to provide session context to client components:

```typescript
<SessionProvider>
  {children}
</SessionProvider>
```

### 3. Credentials Provider (lib/auth.ts)

Validates username/password against test user database:

```typescript
const testUsers = [
  {
    id: "1",
    email: "test@gmail.com",
    password: "test123",
    name: "Test User",
    role: "Project Manager",
  },
];
```

### 4. Login Flow (app/auth/login/page.tsx)

Uses `signIn()` from NextAuth:

```typescript
const result = await signIn('credentials', {
  email: formData.email,
  password: formData.password,
  redirect: false,
});
```

### 5. Logout (components/header.tsx)

Uses `signOut()` from NextAuth:

```typescript
onClick={() => signOut({ redirect: true, redirectUrl: '/auth/login' })}
```

## Session Management

Sessions are stored by NextAuth and validated on every request through the proxy.

- Session persists across page refreshes
- Session expires based on NextAuth default (30 days)
- JWT tokens handle session serialization

## For Production

### Add Database User Storage

Replace the in-memory `testUsers` array with:

```typescript
// lib/auth.ts
async authorize(credentials) {
  // Query your database instead of hardcoded array
  const user = await db.user.findUnique({
    where: { email: credentials.email }
  });

  // Compare hashed password with bcrypt
  const passwordMatch = await bcrypt.compare(
    credentials.password,
    user.passwordHash
  );
}
```

### Add Email Provider

```typescript
import EmailProvider from "next-auth/providers/email";

providers: [
  EmailProvider({
    server: {
      host: process.env.EMAIL_SERVER_HOST,
      port: process.env.EMAIL_SERVER_PORT,
      auth: { ... }
    },
    from: process.env.EMAIL_FROM,
  }),
]
```

### Add Password Reset

Implement password reset flow:
1. User clicks "Forgot Password"
2. NextAuth sends reset token via email
3. User resets password in secure link
4. Password hash updated in database

### Environment Variables for Production

```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-random-secret-key
DATABASE_URL=your-database-url
EMAIL_SERVER_HOST=your-email-service
EMAIL_SERVER_PORT=your-port
EMAIL_FROM=noreply@your-domain.com
```

## Testing

1. Navigate to `http://localhost:3000/auth/login`
2. Enter credentials:
   - Email: `test@gmail.com`
   - Password: `test123`
3. Click "Login"
4. Should redirect to `/dashboard`
5. Click logout button (top right) to test logout
6. Should redirect back to login

## Debugging

Check NextAuth logs in console for debugging:

```typescript
// Add to lib/auth.ts
pages: {
  signIn: "/auth/login",
  error: "/auth/error",
}

// Check current session in any client component
import { useSession } from "next-auth/react";

export function MyComponent() {
  const { data: session, status } = useSession();
  console.log("Session:", session);
  console.log("Status:", status); // loading | authenticated | unauthenticated
}
```

## Useful Links

- NextAuth Docs: https://next-auth.js.org
- Credentials Provider: https://next-auth.js.org/providers/credentials
- Session Management: https://next-auth.js.org/getting-started/example
