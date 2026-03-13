---
phase: 4
plan: 1
wave: 1
---

# Plan 4.1: Public Preview Page + Client Comment Flow

## Objective
Build the public-facing preview page clients access via a share link. Clients view watermarked previews, leave comments, and can mark the design as approved. The designer sees all comments on their project detail page.

## Context
- `.gsd/SPEC.md`
- `src/app/designer/projects/[id]/page.tsx` — reference for design system
- `prisma/schema.prisma` — DesignComment, DesignProject, DesignFile models
- `src/lib/r2.ts`

## Tasks

<task type="auto">
  <name>Create public preview API route</name>
  <files>
    src/app/api/preview/[token]/route.ts
  </files>
  <action>
    `GET /api/preview/[token]`:
    - No auth required
    - Look up DesignProject by previewToken
    - If not found or status === "COMPLETED" (files purged), return 404 with { error: "Preview not available" }
    - Fetch all DesignFiles for project
    - For each file:
      - If previewKey exists: generate signed GET URL (expiresIn: 3600) for previewKey
      - If previewKey is null AND fileType === "video": previewUrl = null (show placeholder)
      - If previewKey is null AND fileType === "pdf": previewUrl = null (show PDF placeholder)
    - Fetch all DesignComments for project (order by createdAt asc)
    - Return:
      ```json
      {
        "project": { "id", "name", "clientEmail", "status", "description" },
        "files": [{ "id", "fileName", "fileType", "previewUrl", "version" }],
        "comments": [{ "id", "clientEmail", "message", "isApproval", "createdAt" }]
      }
      ```

    IMPORTANT: Never expose originalKey or originalUrl. Only previewKey signed URLs are returned.
  </action>
  <verify>npx tsc --noEmit; curl /api/preview/[valid-token] returns files array with previewUrl</verify>
  <done>API returns project, files with signed preview URLs, and comments; original files never exposed</done>
</task>

<task type="auto">
  <name>Build public preview page UI</name>
  <files>
    src/app/preview/[token]/page.tsx
  </files>
  <action>
    Create `src/app/preview/[token]/page.tsx` — Client component with `"use client"`.

    Data fetching: on mount, fetch `/api/preview/${token}`. Handle 404 gracefully (show "Preview not available" screen).

    Layout (single-column, max-w-4xl, centred):

    **Header:**
    - check402 logo (top-left, links to /)
    - Project name (h1, large)
    - Status badge (same badge style as dashboard)
    - "Designed for: [clientEmail]" line

    **File Gallery:**
    - Grid: 2 columns on md+, 1 column on mobile
    - Each file card:
      - If previewUrl: `<img src={previewUrl} />` with object-contain, rounded-xl, border
      - If fileType === "pdf" and no previewUrl: show PDF icon card with filename
      - If fileType === "video" and no previewUrl: show video camera icon card with filename
      - Version badge (top-right corner of card): "v{version}" pill
    - Below gallery: "These are watermarked previews. Original files are released upon project completion."

    **Comments Section:**
    - Section heading: "Leave Feedback"
    - If status === "APPROVED" or "COMPLETED": show "✓ This design has been approved." banner, hide comment form
    - Comment form (unauthenticated):
      - Email input (required)
      - Message textarea (required, 4 rows)
      - "Submit Feedback" button
      - "Approve This Design" button (secondary, teal outline) — sets isApproval: true in POST
    - Comment thread below: each comment shows email, message, date, and "✓ Approved" badge if isApproval
    - POST comments to `/api/design-projects/${project.id}/comments`
    - On submit, re-fetch to refresh comment list

    **Design Style:**
    - Background: slate-950 (dark, premium client-facing feel — different from the white dashboard)
    - Cards: slate-900 border slate-800
    - Text: white / slate-300
    - Accent: teal-400
    - This dark aesthetic makes the watermark stand out more on the preview images

    No auth required — this is fully public.
  </action>
  <verify>npx tsc --noEmit; navigate to /preview/[valid-token] in browser</verify>
  <done>Preview page renders file gallery with watermarked images; comment form submits and comment appears; "Approve" button triggers isApproval:true comment and page shows approved status</done>
</task>

## Success Criteria
- [ ] `/api/preview/[token]` returns files with signed preview URLs
- [ ] `/preview/[token]` renders gallery of watermarked images
- [ ] Client can submit a text comment (no login)
- [ ] Client can click "Approve This Design" — project status updates to APPROVED
- [ ] After COMPLETED, preview page shows "Preview not available"
- [ ] Original files are never exposed
