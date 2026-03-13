---
phase: 3
plan: 1
wave: 1
---

# Plan 3.1: File Upload Pipeline (Presigned R2 URLs + Client-Side Upload)

## Objective
Wire up the full file upload flow: designer selects files → API returns presigned PUT URLs → client uploads directly to R2 → upload confirmed. UI shows upload progress.

## Context
- `.gsd/SPEC.md`
- `src/lib/r2.ts`
- `src/app/designer/projects/[id]/page.tsx`
- `prisma/schema.prisma` — DesignFile model

## Tasks

<task type="auto">
  <name>Create presigned upload URL API route</name>
  <files>
    src/app/api/design-projects/[id]/upload-url/route.ts
    src/app/api/design-projects/[id]/files/route.ts
  </files>
  <action>
    1. `POST /api/design-projects/[id]/upload-url`
       - Auth check: session user must own project
       - Body: { fileName: string, mimeType: string, fileSize: number }
       - Validate: fileSize <= 50MB (52_428_800 bytes); reject otherwise with 400
       - Validate mimeType is in allowed list: image/jpeg, image/png, image/webp, image/gif, image/svg+xml, application/pdf, video/mp4, video/quicktime
       - Generate R2 object key: `designs/{projectId}/originals/{uuid}-{sanitized-filename}`
       - Use `getSignedUrl` + `PutObjectCommand` with expiresIn: 300 (5 min)
       - Return: { uploadUrl, objectKey }

    2. `GET /api/design-projects/[id]/files`
       - Auth check
       - Fetch all DesignFiles for project
       - For each file with a previewKey, generate signed GET URL (expiresIn: 3600) using `getSignedUrl` + `GetObjectCommand`
       - Return files array with `previewUrl` field appended

    3. `DELETE /api/design-projects/[id]/files/[fileId]`
       - Auth check
       - Fetch DesignFile record
       - Delete R2 objects: originalKey + previewKey (if exists) using `DeleteObjectCommand`
       - Delete DB record
       - Return 200

    For R2 signed URLs use:
    ```typescript
    import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
    import { PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
    import { r2, R2_BUCKET } from "@/lib/r2";
    ```
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>3 API route files exist; TypeScript compiles; POST upload-url returns a presigned URL string</done>
</task>

<task type="auto">
  <name>Build file upload UI on project detail page</name>  
  <files>
    src/app/designer/projects/[id]/page.tsx
    src/components/DesignFileUpload.tsx
  </files>
  <action>
    Create `src/components/DesignFileUpload.tsx` — a client component:

    Props: `{ projectId: string, onUploadComplete: () => void }`

    Behaviour:
    1. File input: accept="image/*,.pdf,.svg,video/mp4,video/quicktime" multiple
    2. On file select, for each file:
       a. POST `/api/design-projects/${projectId}/upload-url` with { fileName, mimeType, fileSize }
       b. If error (e.g. file too large), show inline error per file
       c. PUT the file directly to the returned `uploadUrl` using fetch with correct Content-Type header
       d. After successful PUT, POST `/api/design-projects/${projectId}/process` with { objectKey, fileName, mimeType, fileSize } (this triggers watermarking in Plan 3.2)
    3. Show per-file progress: uploading spinner → processing spinner → done checkmark
    4. On all files done, call onUploadComplete()

    Design:
    - Drag-and-drop drop zone (dashed border, teal on hover)
    - File list below drop zone showing name, size, status
    - Max 20 files enforced client-side
    - Matches established design system (white bg, teal accent, rounded-xl)

    In `src/app/designer/projects/[id]/page.tsx`:
    - Replace the "Upload section placeholder" with `<DesignFileUpload projectId={id} onUploadComplete={refreshFiles} />`
    - Add `refreshFiles` function that re-fetches /api/design-projects/[id]/files and updates state
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>DesignFileUpload component renders; file can be selected and presigned URL is requested successfully (check Network tab)</done>
</task>

## Success Criteria
- [ ] `POST /api/design-projects/[id]/upload-url` returns { uploadUrl, objectKey }
- [ ] File PUT directly to R2 using presigned URL succeeds (verify in R2 dashboard)
- [ ] Files > 50MB are rejected with a clear error message
- [ ] File list on project detail page refreshes after upload completes
