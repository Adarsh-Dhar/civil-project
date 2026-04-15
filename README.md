# Conzimer Civil Project Platform

Conzimer is a Next.js application for civil and construction project operations, centered around project tracking, RACI-driven task execution, weighted progress analytics, compliance tracking, and proof/audit traceability.

This README documents the app end-to-end based on the current implementation in this repository.

## What This App Does

- User signup, login, and onboarding with role-aware session data.
- Project creation with automatic seeding of RACI task templates.
- Task lifecycle management across stages (pending, in progress, blocked, done).
- Weighted progress calculations from cost and time contributions.
- Proof Vault with real file upload and task-level assignment.
- Compliance register and immutable audit timeline per project.
- Dashboard APIs for summary, analytics, and recent activity.

## Tech Stack

### Application Framework

- Next.js 16.1.6 (App Router)
- React 19.2.4
- TypeScript 5.9

### Authentication

- NextAuth v4 (credentials provider)
- JWT session strategy
- bcryptjs password hashing

### Data Layer

- Prisma ORM 7.7 (generated client output to app/generated/prisma)
- PostgreSQL via @prisma/adapter-pg and PrismaPg adapter

### UI and Styling

- Tailwind CSS v4
- Radix UI primitives
- lucide-react icons
- next-themes for theme mode handling

### File and Document Handling

- xlsx for RACI workbook import
- Node filesystem APIs for proof uploads to public/uploads

### Infra and DevOps

- pnpm package manager
- Docker multi-stage build
- Docker Compose for app + PostgreSQL local orchestration

## High-Level Architecture

### 1. App Router Layout Hierarchy

- Root layout initializes providers and analytics.
- Protected layout renders sidebar + header shell.
- Section layouts (dashboard/projects/settings/reports) enforce authentication server-side.

### 2. Session and Auth Flow

- Signup API creates users with bcrypt-hashed password.
- Credentials login validates against User table.
- JWT callback enriches token with id and role.
- Session callback maps token fields to session.user.

### 3. Project Execution Model

- Creating a project seeds ProjectTask rows from ProjectTaskTemplate.
- RACI templates can be imported from Excel and propagated to projects.
- Task status updates emit audit events.
- Weighted progress uses costWeight and timeWeight from task records.

### 4. Evidence and Traceability

- Project-level and task-level proofs are persisted in Proof and TaskProof.
- Upload API validates extension and size, stores files under public/uploads/proofs/{projectId}.
- Every proof operation writes an audit event.

## Repository Structure

Top-level important directories:

- app: Next.js App Router pages and API routes.
- components: shared UI and domain components.
- lib: auth, prisma, RACI/task utilities.
- prisma: schema, migrations, seed, generated artifacts.
- scripts: debug, import, and test utilities.
- public: static assets and runtime upload target (ignored in git).

## Route Map

### Public Pages

- /auth/login
- /auth/signup
- /auth/onboarding

### Protected Pages

- /dashboard
- /projects
- /projects/add
- /projects/[projectId]
- /projects/[projectId]/jobs
- /projects/[projectId]/raci
- /projects/[projectId]/proofs
- /projects/[projectId]/timeline
- /projects/[projectId]/compliance
- /projects/[projectId]/audit
- /projects/[projectId]/audit-log
- /reports
- /settings
- /settings/appearance
- /settings/users

## API Surface

### Auth and User

- GET/POST /api/auth/[...nextauth]
- POST /api/signup
- POST /api/onboarding
- GET /api/users/me

### Dashboard

- GET /api/dashboard/summary
- GET /api/dashboard/analytics
- GET /api/dashboard/activity

### Projects

- GET/POST /api/projects
- GET /api/projects/[projectId]
- GET/PATCH /api/projects/[projectId]/tasks
- GET/POST /api/projects/[projectId]/tasks/[taskId]/proofs
- POST /api/projects/[projectId]/proofs

### RACI Import

- POST /api/raci/import (Excel workbook import)

## Data Model Summary

Core entities in prisma/schema.prisma:

- User, Account, Session, VerificationToken
- Role, Team
- Project
- ProjectTaskTemplate, ProjectTask
- Proof (project-level evidence)
- TaskProof (task-assigned evidence)
- ComplianceItem
- AuditLog
- RaciEntry

Task statuses:

- pending
- in_progress
- blocked
- done

Compliance statuses:

- pending
- compliant
- non-compliant

## RACI and Progress Logic

Weighted progress is based on completed task contributions:

- Cost progress = sum(costWeight for done tasks)
- Time progress = sum(timeWeight for done tasks)
- Overall progress = alpha * costProgress + beta * timeProgress

RACI task templates are managed by:

- lib/raci-template.ts
- lib/project-tasks.ts
- lib/raci-import.ts

Workbook import supports:

- xlsx upload
- alias-based column matching
- status parsing
- optional propagation to one project or all projects

## Proof Vault Upload Flow

Implemented upload behavior:

1. User selects file in Proof Vault page.
2. Allowed extensions: pdf, jpg, jpeg, png, dwg.
3. User can assign upload to:
	- project level, or
	- a specific task from RACI task list.
4. API validates file size (<= 100 MB), extension, project/task linkage.
5. File saved to public/uploads/proofs/{projectId}.
6. DB record created in Proof or TaskProof.
7. Audit event created.
8. UI refreshes merged proof list.

## Local Development Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- PostgreSQL (local) or Docker

### 1. Install Dependencies

- pnpm install

### 2. Configure Environment

Create .env.local with at least:

- DATABASE_URL
- NEXTAUTH_SECRET
- NEXTAUTH_URL

Optional email settings:

- EMAIL_SERVER_HOST
- EMAIL_SERVER_PORT
- EMAIL_SERVER_USER
- EMAIL_SERVER_PASS
- EMAIL_FROM

Example DATABASE_URL for local Postgres:

- postgresql://postgres:postgres@localhost:5433/civil_project

### 3. Generate Client and Migrate

- pnpm generate
- pnpm migrate

### 4. Seed Data

- pnpm seed

Seed creates:

- user: seed.admin@civil.local
- password: Password123!
- default seeded project and tasks

### 5. Start App

- pnpm dev

## Docker Setup

Compose services:

- db: postgres:16-alpine (host port 5433)
- app: production Next.js container (host port 3001)

Run:

- docker compose up --build

Container startup command handles:

- prisma generate
- prisma migrate deploy
- prisma db seed
- pnpm start

## Script Inventory

- pnpm raci:import: import workbook into task templates/projects
- pnpm db:test: DB connectivity checks
- pnpm db:studio: open Prisma Studio
- pnpm test:api: API route checks

Additional utility scripts in scripts folder:

- debug-auth.ts
- debug-session-raw.ts
- final-e2e-test.ts
- import-raci-xlsx.ts
- test-api-routes.ts
- test-auth-export.ts
- test-auth-flow.ts
- test-database.ts

## Important Implementation Notes

### Build Configuration

next.config.mjs currently sets:

- typescript.ignoreBuildErrors = true

This allows production builds to pass even with TypeScript errors. For stricter production quality, set this to false and resolve all TS errors before deployment.

### Upload Storage Strategy

Current proof uploads are written to local filesystem under public/uploads.

For scalable production deployments (especially stateless/serverless), migrate to object storage such as S3/R2/GCS and persist remote URLs in Proof/TaskProof.

### Authorization Posture

Authentication is enforced on APIs via NextAuth session checks.

Some project-level APIs currently prioritize developer flow over strict multi-tenant authorization checks. If this is a shared production environment, add owner/team-based access constraints consistently across all project/task/proof routes.

## Troubleshooting

### Common Issues

1. Unauthorized API responses:
	- Verify NEXTAUTH_SECRET and NEXTAUTH_URL.
	- Ensure session cookie is present.

2. Prisma errors:
	- Verify DATABASE_URL.
	- Run pnpm generate and pnpm migrate.

3. Missing seeded tasks:
	- Run pnpm seed.
	- Confirm ProjectTaskTemplate rows exist.

4. Proof upload failures:
	- Check extension and file size.
	- Verify write permissions for public/uploads.

5. Docker app cannot reach DB:
	- Ensure db service is healthy in compose.
	- Confirm DATABASE_URL points to db:5432 in container network.

## Suggested Next Hardening Steps

- Re-enable strict TypeScript build failures.
- Add role-based authorization boundaries per route.
- Move proof storage to object storage provider.
- Add API integration tests for project proof upload and task linkage.
- Add request rate-limiting and audit export retention strategy.

