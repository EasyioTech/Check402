# Phase 3 — Summary

## Plan 3.1: File Upload Pipeline (Wave 1)

### API Routes Created

#### `src/app/api/design-projects/[id]/upload-url/route.ts`
- `POST` — validates ownership, MIME type, file size (≤50MB), file count (≤20)
- Generates `designs/{projectId}/originals/{uuid}-{filename}` object key
- Returns 5-minute presigned PUT URL + objectKey

#### `src/app/api/design-projects/[id]/files/route.ts`
- `GET` — returns all DesignFiles for project with 1-hour signed GET URLs for previews

#### `src/app/api/design-projects/[id]/files/[fileId]/route.ts`
- `DELETE` — removes originalKey + previewKey from R2, deletes DB record

### UI Component

#### `src/components/DesignFileUpload.tsx`
- Drag-and-drop zone (dashed border, teal on hover)
- File list below zone with per-file status: queued → uploading → processing → done/error
- Client-side validation: MIME type + 50MB + remaining slot count
- 3-step pipeline per file: (1) presigned URL, (2) PUT to R2, (3) POST /process
- "Upload N Files" button batches the queue
- `onUploadComplete` callback fires when all uploads finish

### Project Detail Page Updated (`src/app/designer/projects/[id]/page.tsx`)
- Added separate `files` state + `refreshFiles()` function (fetches /api/design-projects/[id]/files)
- File thumbnails show watermarked preview when `previewUrl` is available
- "preview unavailable" badge for PDFs/videos
- Upload placeholder replaced with `<DesignFileUpload />` component

---

## Plan 3.2: Watermark Processing (Wave 2)

#### `src/lib/watermark.ts`
- `generateWatermarkedPreview(buffer, mimeType)` — returns `Buffer | null`
- Tiled diagonal SVG watermark: "PREVIEW ONLY / check402.com" at 38° rotation
- Tiles cover entire image to prevent cropping workarounds
- Images/SVGs: resized to 1200px, JPEG 70%, watermark composited via Sharp
- Videos + PDFs: return `null` (no preview without canvas dependency)

#### `src/app/api/design-projects/[id]/process/route.ts`
- `POST` — fetches original from R2, runs watermark, uploads preview to R2
- Creates DesignFile DB record with originalKey + previewKey (null for video/pdf)
- Handles both Web ReadableStream and Node Readable for R2 response body

---

## Files Created (7 total)
1. `src/app/api/design-projects/[id]/upload-url/route.ts`
2. `src/app/api/design-projects/[id]/files/route.ts`
3. `src/app/api/design-projects/[id]/files/[fileId]/route.ts`
4. `src/app/api/design-projects/[id]/process/route.ts`
5. `src/lib/watermark.ts`
6. `src/components/DesignFileUpload.tsx`
7. `src/app/designer/projects/[id]/page.tsx` (updated)

## Lint Notes
All `@aws-sdk/*` and `prisma.designProject/designFile` errors are expected — they
Resolve after `npm install` and `npx prisma db push` are run.
