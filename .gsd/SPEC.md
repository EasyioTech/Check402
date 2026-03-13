# Designer Mode — SPEC.md
# Status: FINALIZED

## Overview
Add a second user mode to check402 — **Designer Mode** — alongside the existing Developer Mode. Designers can upload design files, generate watermarked previews, share preview links with clients for review/comments, iterate on revisions, and purge all files upon project completion.

---

## User Flows

### Designer
1. Signs up / logs in (same auth system, selects "Designer" mode during onboarding)
2. Creates a Design Project (name, client email, description)
3. Uploads files: images (PNG, JPG, JPEG, GIF, WEBP), vectors (SVG), documents (PDF), video (MP4, MOV)
4. System processes uploads:
   - Images/SVG → Sharp outputs low-res watermarked JPEG preview + stores original in R2
   - PDF → Page-1 rasterized with pdf2img, then watermarked JPEG preview
   - Video → Stored in R2, no watermarked preview (shown as locked thumbnail)
5. Designer copies and shares a public preview link (e.g. `/preview/[token]`)
6. Designer uploads new revisions (versioned files, linked to same project)
7. On approval + payment: Designer sets project to COMPLETED → all R2 files purged

### Client (unauthenticated)
1. Opens preview link
2. Views watermarked previews (images viewable; originals never exposed)
3. Can leave comments on the project (no auth required, just email + message)
4. Can mark design as Approved

---

## Data Model Changes

### User (extend existing)
- `mode: String @default("DEVELOPER")` — DEVELOPER | DESIGNER

### New: DesignProject
- id, name, clientEmail, description
- status: String — DRAFT | IN_REVIEW | CHANGES_REQUESTED | APPROVED | COMPLETED
- previewToken: String @unique (public-access token)
- userId: String (designer)
- createdAt, updatedAt

### New: DesignFile
- id, designProjectId
- originalKey: String (R2 object key, original file)
- previewKey: String (R2 object key, watermarked preview)
- fileName: String
- fileType: String (image | pdf | video | svg)
- mimeType: String
- version: Int @default(1)
- createdAt

### New: DesignComment
- id, designProjectId
- clientEmail: String
- message: String
- isApproval: Boolean @default(false)
- createdAt

---

## Storage: Cloudflare R2

- **SDK**: `@aws-sdk/client-s3` + `@aws-sdk/s3-request-presigner` (S3-compatible)
- **Upload flow**: Client → presigned PUT URL → R2 (no file passes through Next.js server)
- **Preview delivery**: Signed GET URLs with short expiry (1 hour) for preview page
- **Purge**: On COMPLETED, delete all R2 objects under `designs/{projectId}/`

### Buckets
- `check402-designs` — one bucket, path-based namespacing

### R2 ENV vars needed
```
CF_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=check402-designs
R2_PUBLIC_URL=  # optional, for public bucket
```

---

## Processing Stack

| File Type | Preview Generation | Library |
|-----------|-------------------|---------|
| Image (JPG/PNG/WEBP/GIF) | Resize to 800px wide, 30% quality JPEG, composite watermark SVG | `sharp` |
| SVG | Rasterize to PNG via sharp, then watermark | `sharp` |
| PDF | Render page 1 to buffer via `pdfjs-dist` (server), then watermark | `pdfjs-dist` + `sharp` |
| Video | No preview generated; show placeholder | — |

Watermark: semi-transparent "PREVIEW ONLY — check402.com" text tiled diagonally across image.

---

## Routes

### New App Routes
| Route | Access | Description |
|-------|--------|-------------|
| `/designer` | Designer auth | Designer dashboard |
| `/designer/projects` | Designer auth | All design projects |
| `/designer/projects/[id]` | Designer auth | Project detail + file manager |
| `/preview/[token]` | Public | Client preview page |

### New API Routes
| Route | Method | Description |
|-------|--------|-------------|
| `/api/design-projects` | GET, POST | List / create |
| `/api/design-projects/[id]` | GET, PUT, DELETE | Detail / update status / delete |
| `/api/design-projects/[id]/upload-url` | POST | Generate presigned R2 PUT URL |
| `/api/design-projects/[id]/process` | POST | Trigger watermark generation after upload |
| `/api/design-projects/[id]/files` | GET, DELETE | List / delete files |
| `/api/design-projects/[id]/comments` | GET, POST | Client comments |
| `/api/design-projects/[id]/complete` | POST | Mark complete + purge R2 |
| `/api/preview/[token]` | GET | Validate token, return signed preview URLs |

---

## UI / UX

- Reuse design system: white UI, teal/slate palette, same nav patterns
- Designer dashboard: separate `/designer` area, links back to main `/dashboard`
- Onboarding: update Step 1 to offer "Developer" vs "Designer" paths, each with a tailored Step 2
- Preview page: minimal, clean, dark-ish — shows watermarked images in a gallery, comment box at bottom, approve button

---

## Constraints
- Max file upload: 50MB per file (enforced client-side and validated server-side)
- Max files per project: 20
- Preview images served via signed R2 URLs (expire after 1h); page regenerates on load
- NON-goal: real-time collaboration, payment processing integration (completion is manual)
