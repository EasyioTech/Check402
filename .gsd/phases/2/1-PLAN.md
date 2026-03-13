---
phase: 2
plan: 1
wave: 1
---

# Plan 2.1: Designer Dashboard Layout + Project CRUD

## Objective
Create the `/designer` authenticated area with a sidebar layout matching the existing dashboard style, plus full project list/create/detail pages and their backing API routes.

## Context
- `.gsd/SPEC.md`
- `src/app/dashboard/layout.tsx` — reference for sidebar pattern
- `src/app/dashboard/page.tsx` — reference for page structure
- `prisma/schema.prisma` — DesignProject model
- `src/lib/prisma.ts`

## Tasks

<task type="auto">
  <name>Create /designer layout and core pages</name>
  <files>
    src/app/designer/layout.tsx
    src/app/designer/page.tsx
    src/app/designer/projects/page.tsx
    src/app/designer/projects/new/page.tsx
    src/app/designer/projects/[id]/page.tsx
  </files>
  <action>
    1. `src/app/designer/layout.tsx` — Client component. Sidebar with:
       - Logo + "Designer Studio" label
       - Nav links: Overview (/designer), Projects (/designer/projects)
       - Back to Dashboard link (/dashboard)
       - Mobile hamburger (reuse same pattern as dashboard/layout.tsx)
       - Auth guard: useSession, if mode !== "DESIGNER" redirect to /dashboard
       - Wrap in SessionProvider if not already provided by root layout (it is, so just use useSession)

    2. `src/app/designer/page.tsx` — Overview page. Show:
       - Stats: Total Projects, In Review, Approved, Completed
       - Recent design projects table (name, client email, status, created date)
       - "New Project" button

    3. `src/app/designer/projects/page.tsx` — Full project list with search + status filter

    4. `src/app/designer/projects/new/page.tsx` — Form: Project Name, Client Email, Description. On submit POST to /api/design-projects. On success redirect to /designer/projects/[id].

    5. `src/app/designer/projects/[id]/page.tsx` — Project detail:
       - Header: project name, client email, status badge, "Share Preview" button (copies preview link to clipboard)
       - Status control buttons (DRAFT → IN_REVIEW, IN_REVIEW → CHANGES_REQUESTED, etc.)
       - File section: list of uploaded files with preview thumbnails, version number, delete button
       - Upload section (button that opens file picker) — actual upload logic comes in Phase 3, for now show placeholder
       - Comments section: list of DesignComments, newest first

    Apply the established design system throughout: white bg, slate/teal palette, rounded-2xl cards, font-extrabold headings.
  </action>
  <verify>npx tsc --noEmit; navigate to /designer in browser (after rebuild)</verify>
  <done>All 5 files exist and TypeScript compiles cleanly; /designer renders with sidebar and overview stats</done>
</task>

<task type="auto">
  <name>Create design project API routes</name>
  <files>
    src/app/api/design-projects/route.ts
    src/app/api/design-projects/[id]/route.ts
    src/app/api/design-projects/[id]/comments/route.ts
  </files>
  <action>
    1. `GET /api/design-projects` — return all DesignProjects for the authenticated user, include _count of files and comments. Order by createdAt desc.

    2. `POST /api/design-projects` — create new DesignProject. Body: { name, clientEmail, description }. userId from session. Return created project.

    3. `GET /api/design-projects/[id]` — return single project with files and comments. Auth check: project.userId === session.user.id.

    4. `PUT /api/design-projects/[id]` — update status. Body: { status } where status ∈ [DRAFT, IN_REVIEW, CHANGES_REQUESTED, APPROVED]. Auth check. DO NOT allow setting COMPLETED via this route (that is Phase 5's dedicated route).

    5. `DELETE /api/design-projects/[id]` — delete project record (R2 cleanup is Phase 5's job; for now just cascade-delete DB records). Auth check.

    6. `GET /api/design-projects/[id]/comments` — return all comments for project. Public access (no session check needed — client-side preview will call this).

    7. `POST /api/design-projects/[id]/comments` — create comment. Body: { clientEmail, message, isApproval }. No auth required. Validate clientEmail format. If isApproval === true and current status === IN_REVIEW, auto-update project status to APPROVED.

    All routes: return JSON, use try/catch, return 401 for auth failures, 404 for not found, 500 for errors.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>5 API files exist; TypeScript compiles cleanly; GET /api/design-projects returns empty array for authenticated user</done>
</task>

## Success Criteria
- [ ] `/designer` renders with sidebar navigation and auth guard
- [ ] Creating a project via the form POSTs to API and redirects to project detail
- [ ] Project detail page fetches and displays project data
- [ ] Status can be updated via PUT /api/design-projects/[id]
- [ ] Comments API accepts POST without auth and updates project to APPROVED when isApproval=true
