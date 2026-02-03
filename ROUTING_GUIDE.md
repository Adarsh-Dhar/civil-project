# LoopBuild Routing Structure

Complete Next.js App Router structure for the Construction Project Management Dashboard.

## Directory Structure

```
app/
├── page.tsx                          # Root redirect to /dashboard
├── layout.tsx                        # Global layout
├── globals.css                       # Global styles
│
├── auth/                            # Authentication routes (public)
│   ├── login/
│   │   └── page.tsx                 # Login page
│   ├── signup/
│   │   └── page.tsx                 # Sign up page
│   └── onboarding/
│       └── page.tsx                 # Onboarding wizard
│
├── dashboard/                       # Protected routes with sidebar
│   ├── layout.tsx                   # Dashboard layout wrapper
│   ├── page.tsx                     # Main dashboard overview
│   ├── summary-cards.tsx            # Summary cards component
│   ├── analytics-section.tsx        # Analytics component
│   └── recent-activity.tsx          # Activity feed component
│
├── projects/                        # Projects routes
│   ├── layout.tsx                   # Projects layout wrapper
│   ├── page.tsx                     # Projects list view
│   └── [projectId]/                 # Dynamic project routes
│       ├── layout.tsx               # Project details layout with tabs
│       ├── page.tsx                 # Project overview
│       ├── jobs/
│       │   └── page.tsx             # Construction jobs table
│       ├── raci/
│       │   └── page.tsx             # RACI matrix view
│       ├── proofs/
│       │   └── page.tsx             # Proof vault
│       ├── timeline/
│       │   └── page.tsx             # Project timeline
│       ├── compliance/
│       │   └── page.tsx             # Compliance checklist
│       └── audit-log/
│           └── page.tsx             # Audit log
│
├── settings/                        # Settings routes
│   ├── layout.tsx                   # Settings layout wrapper
│   ├── page.tsx                     # Settings main
│   └── users/
│       └── page.tsx                 # User management
│
└── reports/                         # Reports routes
    ├── layout.tsx                   # Reports layout wrapper
    └── page.tsx                     # Reports dashboard
```

## Route Map

### Public Routes (No Authentication Required)
- `/auth/login` - User login
- `/auth/signup` - User registration
- `/auth/onboarding` - Onboarding wizard after signup

### Protected Routes (Requires Authentication)

#### Dashboard
- `/dashboard` - Main dashboard with overview, analytics, recent activity

#### Projects
- `/projects` - Projects list (grid/list view toggle)
- `/projects/[projectId]` - Project overview with tabs
  - `/projects/[projectId]/jobs` - Construction jobs table (RACI columns)
  - `/projects/[projectId]/raci` - RACI matrix visualization
  - `/projects/[projectId]/proofs` - Proof vault with file uploads
  - `/projects/[projectId]/timeline` - Gantt-style timeline
  - `/projects/[projectId]/compliance` - Compliance checklist
  - `/projects/[projectId]/audit-log` - Immutable audit trail

#### Settings
- `/settings` - Settings menu
- `/settings/users` - Team member management

#### Reports
- `/reports` - Reports dashboard with export options

## Layout Hierarchy

```
RootLayout (app/layout.tsx)
  ├── Public Routes
  │   └── page.tsx (redirect to /dashboard)
  │   └── auth/* (no sidebar)
  │
  └── ProtectedLayout (app/layout-protected.tsx)
      ├── Sidebar (navigation)
      ├── Header (breadcrumbs, search, notifications)
      └── DashboardLayout (app/dashboard/layout.tsx)
          ├── ProjectsLayout (app/projects/layout.tsx)
          ├── ProjectDetailsLayout (app/projects/[projectId]/layout.tsx)
          │   └── Project sub-routes with tabs
          ├── SettingsLayout (app/settings/layout.tsx)
          └── ReportsLayout (app/reports/layout.tsx)
```

## Navigation Components

### Sidebar (`components/sidebar.tsx`)
- Logo and branding
- Main navigation links:
  - Dashboard
  - Projects
  - Reports
- Settings link
- User profile section
- Responsive: Hidden on mobile, visible on lg screens

### Header (`components/header.tsx`)
- Hamburger menu button (mobile only)
- Breadcrumb navigation
- Search bar (hidden on mobile, icon only on small screens)
- Notifications bell
- "Add New Project" button
- Responsive design

### Project Tabs (`app/projects/[projectId]/layout.tsx`)
- Sticky tab navigation
- Overview, Jobs, RACI Matrix, Proofs, Timeline, Compliance, Audit Log
- Active tab highlighting
- Mobile-friendly horizontal scroll

## Data Flow & Components

### Dashboard Page
- Summary cards showing project statistics
- Analytics section with charts
- Recent activity feed

### Projects List Page
- Grid view (card layout) and list view toggle
- Search and filter functionality
- Create new project button
- Status badges and progress bars

### Project Details
- Multi-tab interface
- Project header with info
- Tab-specific content

#### Jobs Tab
- RACI matrix columns (Responsible, Accountable, Consulted, Informed)
- Status badges
- Proof upload buttons
- Action menus

#### RACI Tab
- Color-coded matrix (R=Blue, A=Purple, C=Amber, I=Green)
- Export functionality
- Sticky headers

#### Proofs Tab
- File upload area (drag & drop)
- File list with metadata
- Download/delete actions
- File type icons

#### Timeline Tab
- Vertical timeline with phases
- Progress bars
- Phase status indicators
- Dependency tracking

#### Compliance Tab
- Status cards (Approved, Pending, Rejected counts)
- Checklist items
- Inspector notes
- Resubmit buttons

#### Audit Log Tab
- Immutable activity feed
- Timestamps and user avatars
- Filterable by user/action
- Export to CSV/PDF

## Navigation Patterns

### Primary Navigation
- Sidebar links to main sections
- Current page highlighted
- Mobile hamburger menu toggles sidebar overlay

### Secondary Navigation (Project Pages)
- Sticky tab navigation
- Back button to projects list
- Breadcrumb trail

### Tertiary Navigation (Settings)
- Settings menu cards
- Back buttons in sub-pages

## Styling & Colors

- Primary color: Indigo (#6366f1)
- Accent colors: Purple, Emerald, Amber
- Status colors: Green (success), Amber (pending), Red (error)
- Backgrounds: White cards on light gray (#f3f4f6)
- Text: Dark gray (#1a1a1a) for primary, lighter gray for secondary

## Responsive Breakpoints

- **Mobile (< 640px)**: Single column, hidden non-essential UI
- **Tablet (640px - 1024px)**: Two columns, simplified navigation
- **Desktop (> 1024px)**: Full layout, sidebar always visible

## Mobile-Specific Changes

- Sidebar hidden, toggled via hamburger menu
- Table columns hidden progressively (Status, Consulted, Informed hidden on small screens)
- Icons-only buttons on mobile
- Vertical stacking of form fields
- Touch-friendly button sizes (44px minimum)

## Route Transitions

All route transitions preserve sidebar state and show smooth animations. The active navigation item updates based on `pathname` from `usePathname()`.

## Future Enhancements

- Breadcrumb navigation with history
- Route-based permission checking
- Loading skeletons for data-heavy pages
- Error boundary pages
- 404/not found pages
