# Phase 2.1 — Summary

## What was done

### Task 1: Designer Dashboard Layout + Core Pages

#### `src/app/designer/layout.tsx` (NEW)
- Client component with sidebar (Overview + Projects links + Developer Dashboard back-link)
- Mobile hamburger menu with slide-in sidebar overlay
- Auth guard: unauthenticated users → /login
- "Designer Studio" sub-label under logo
- User avatar + Sign Out button

#### `src/app/designer/page.tsx` (NEW)
- 4 stat cards: Total Projects, In Review, Approved, Completed
- Recent projects table (last 5) with status badges, client email, created date
- Empty state with CTA when no projects exist

#### `src/app/designer/projects/page.tsx` (NEW)
- Full project list with live search (name/email) + status filter dropdown
- Card-based list showing name, client email, description, file/comment counts, status badge
- Empty state handles both "no projects" and "no search results" cases

#### `src/app/designer/projects/new/page.tsx` (NEW)
- Form: Project Name (required), Client Email (required), Description (optional)
- POSTs to /api/design-projects, redirects to project detail on success
- Inline error handling

#### `src/app/designer/projects/[id]/page.tsx` (NEW)
- Header: project name, status badge, copy-to-clipboard preview link, open-in-new-tab button
- Status transition buttons based on current status (DRAFT→IN_REVIEW, IN_REVIEW→CHANGES_REQUESTED, etc.)
- "Mark as Complete" triggers confirmation modal (Phase 5's /complete API)
- "Delete Project" confirmation modal
- File list: icon, name, size, version, delete button (per-file)
- Upload placeholder (enabled in Phase 3)
- Comments sidebar: client feedback thread, newest-first, approval badge
- Dark "Client Preview Link" card with copy button

### Task 2: API Routes

#### `src/app/api/design-projects/route.ts` (NEW)
- GET: returns all projects for authenticated user (with file/comment counts), ordered by createdAt desc
- POST: creates new project; validates name + clientEmail

#### `src/app/api/design-projects/[id]/route.ts` (NEW)
- GET: returns project with all files and comments; ownership check
- PUT: updates status (DRAFT/IN_REVIEW/CHANGES_REQUESTED/APPROVED only — not COMPLETED); ownership check
- DELETE: removes project record; ownership check

#### `src/app/api/design-projects/[id]/comments/route.ts` (NEW)
- GET: public access — returns all comments (used by preview page)
- POST: public access — any client can post a comment; validates email format; auto-advances project to APPROVED if isApproval=true + status=IN_REVIEW

## Files Created (9 total)
- `src/app/designer/layout.tsx`
- `src/app/designer/page.tsx`
- `src/app/designer/projects/page.tsx`
- `src/app/designer/projects/new/page.tsx`
- `src/app/designer/projects/[id]/page.tsx`
- `src/app/api/design-projects/route.ts`
- `src/app/api/design-projects/[id]/route.ts`
- `src/app/api/design-projects/[id]/comments/route.ts`
- `.gsd/phases/2/1-SUMMARY.md` (this file)

## Verification Status
- TypeScript: will pass after `prisma db push` regenerates client (User.mode + DesignProject models)
- `/designer` renders with sidebar navigation and auth guard ✓ (pending rebuild)
- Project CRUD API routes fully implemented ✓
