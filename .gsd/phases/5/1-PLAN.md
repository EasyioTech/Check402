---
phase: 5
plan: 1
wave: 1
---

# Plan 5.1: Project Completion + R2 File Purge

## Objective
When a designer marks a project as Complete, atomically update the DB status to COMPLETED and delete all R2 objects under that project. Show the designer a confirmation screen with purge details.

## Context
- `.gsd/SPEC.md`
- `src/lib/r2.ts`
- `src/app/designer/projects/[id]/page.tsx`
- `prisma/schema.prisma` — DesignFile model

## Tasks

<task type="auto">
  <name>Create completion + purge API route</name>
  <files>
    src/app/api/design-projects/[id]/complete/route.ts
  </files>
  <action>
    `POST /api/design-projects/[id]/complete`:
    - Auth check: session user must own project
    - Verify project.status === "APPROVED" (only approved projects can be completed). If not, return 400 with { error: "Project must be approved before completing" }
    - Fetch all DesignFiles for project
    - Collect all R2 keys: for each file, collect originalKey + previewKey (if exists)
    - Delete R2 objects in batches of 1000 using `DeleteObjectsCommand`:
      ```typescript
      import { DeleteObjectsCommand } from "@aws-sdk/client-s3";
      await r2.send(new DeleteObjectsCommand({
        Bucket: R2_BUCKET,
        Delete: { Objects: keys.map(k => ({ Key: k })) }
      }));
      ```
    - Update project status to COMPLETED:
      ```prisma
      await prisma.designProject.update({
        where: { id },
        data: { status: "COMPLETED" }
      });
      ```
    - Delete all DesignFile DB records for this project (cascade should handle this, but explicitly clean up):
      ```prisma
      await prisma.designFile.deleteMany({ where: { designProjectId: id } });
      ```
    - Return { success: true, purgedCount: keys.length, completedAt: new Date().toISOString() }

    Error handling: if R2 deletion fails partially, still mark DB as COMPLETED and log the error. Files can be manually cleaned up from the R2 dashboard.
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>TypeScript compiles; calling POST /complete on an APPROVED project returns purgedCount > 0; R2 objects no longer accessible; DesignFile records deleted from DB</done>
</task>

<task type="auto">
  <name>Add completion flow UI to project detail page</name>
  <files>src/app/designer/projects/[id]/page.tsx</files>
  <action>
    In the project detail page, add completion flow:

    1. If project.status === "APPROVED", show a prominent "Mark as Complete & Purge Files" button (teal background, with a trash/shield icon).

    2. On click, open a confirmation modal (inline state, not a separate component needed):
       - Heading: "Permanently delete all project files?"
       - Body: "This will delete all [n] uploaded files from our servers. This action cannot be undone. Only do this after you have delivered the final designs to your client."
       - Two buttons: "Cancel" (slate outline) and "Confirm & Complete" (red filled)
       - On Confirm: POST to `/api/design-projects/${id}/complete`
       - Show loading state during POST

    3. On successful completion:
       - Replace the entire page content with a success screen:
         - Large ✓ icon (teal)
         - "Project Completed" heading
         - "X file(s) have been permanently deleted from our servers." (use purgedCount from response)
         - Completed at timestamp
         - "Back to Projects" button → /designer/projects

    4. If project.status === "COMPLETED" on load:
       - Show the same success/completed state immediately
       - File upload section and file list are hidden
       - Status badge shows "COMPLETED"

    Use the existing design system: white bg, slate/teal, rounded-2xl, font-extrabold.
  </action>
  <verify>npx tsc --noEmit; test completion flow on an APPROVED project</verify>
  <done>Completion button appears only for APPROVED projects; modal shows; after confirm, success screen shows purge count; /api/preview/[token] returns 404 after completion</done>
</task>

## Success Criteria
- [ ] Only APPROVED projects can be completed (400 returned otherwise)
- [ ] All R2 objects (originals + previews) are deleted on completion
- [ ] DesignFile DB records are removed
- [ ] Project status is COMPLETED in DB
- [ ] Preview page returns 404/unavailable for COMPLETED projects  
- [ ] Designer sees "X files purged" confirmation screen
- [ ] `npx tsc --noEmit` passes cleanly
