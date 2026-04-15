# NextAuth Authentication Setup - Conzimer

## Overview

Conzimer uses **NextAuth.js v4** with **Prisma database adapter** for secure email/password authentication. Users can sign up, log in, and reset passwords. All routes are protected with automatic redirection to login for unauthenticated users.

## Database Setup

- **Database**: SQLite (development) / PostgreSQL (production)
- **ORM**: Prisma with NextAuth adapter
- **Models**: User, Account, Session, VerificationToken

## Environment Variables

Create `.env.local` with:

```bash
NEXTAUTH_SECRET=your-super-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL="file:./dev.db"

# Email configuration (optional for password reset)
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

## Architecture

### Files Created/Updated

1. **`/prisma/schema.prisma`** - Database schema with NextAuth models
2. **`/lib/auth.ts`** - NextAuth configuration with Credentials and Email providers
3. **`/app/api/auth/[...nextauth]/route.ts`** - NextAuth API route handler
4. **`/app/api/signup/route.ts`** - Custom signup API for user registration
5. **`/app/auth/signup/page.tsx`** - Real signup form with validation
6. **`/app/providers.tsx`** - SessionProvider wrapper for client-side session
7. **`/app/auth/layout.tsx`** - Auth pages layout styling
8. **`/app/auth/login/page.tsx`** - Login page with NextAuth integration
9. **`/app/auth/onboarding/page.tsx`** - Onboarding flow after login

### Key Components Updated

- **`/app/layout.tsx`** - Wrapped with SessionProvider
- **`/components/header.tsx`** - Added logout button
- **`/components/sidebar.tsx`** - Added Next.js Link routing

## Authentication Flow

```
1. User visits signup page and creates account
2. Password is hashed with bcrypt and stored in database
3. User logs in with email/password
4. NextAuth validates credentials against database
5. If valid → Create session and redirect to /dashboard
6. User can logout via header button → Redirect to /auth/login
7. Optional: Password reset via email verification
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

### 1. Database Integration (Prisma)

Users are stored in SQLite/PostgreSQL database:

```typescript
// prisma/schema.prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?   // Hashed with bcrypt
  accounts      Account[]
  sessions      Session[]
}
```

### 2. Signup Process (app/api/signup/route.ts)

Creates new user with hashed password:

```typescript
const hashedPassword = await bcrypt.hash(password, 12);
const user = await prisma.user.create({
  data: { name, email, password: hashedPassword },
});
```

### 3. Credentials Provider (lib/auth.ts)

Validates login against database:

```typescript
async authorize(credentials) {
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  if (user && await bcrypt.compare(credentials.password, user.password)) {
    return { id: user.id, email: user.email, name: user.name };
  }
  return null;
}
```

### 4. Email Provider (Optional)

For password reset functionality:

```typescript
EmailProvider({
  server: process.env.EMAIL_SERVER,
  from: process.env.EMAIL_FROM,
})
```

## Session Management

Sessions are stored by NextAuth and validated on every request through the proxy.

- Session persists across page refreshes
- Session expires based on NextAuth default (30 days)
- JWT tokens handle session serialization

## For Production

### Database Migration

Switch to PostgreSQL for production:

```bash
# Update .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/Conzimer"

# Run migration
npx prisma migrate deploy
```

### Email Configuration

Configure email service for password reset:

```bash
# Gmail example
EMAIL_SERVER_HOST=smtp.gmail.com
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER=your-email@gmail.com
EMAIL_SERVER_PASS=your-app-password
EMAIL_FROM=noreply@yourdomain.com
```

### Security Enhancements

- Add rate limiting for login attempts
- Implement account lockout after failed attempts
- Add CSRF protection
- Configure proper session settings
- Use HTTPS in production

### Environment Variables

```bash
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=generate-a-secure-random-key
DATABASE_URL=your-production-database-url
```

## Testing

1. Navigate to `http://localhost:3000/auth/signup`
2. Create a new account with email/password
3. Navigate to `http://localhost:3000/auth/login`
4. Login with the created credentials
5. Should redirect to `/dashboard`
6. Click logout button (top right) to test logout
7. Should redirect back to login

## Database Commands

```bash
# Generate Prisma client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# View database
npx prisma studio

# Reset database
npx prisma migrate reset
```
