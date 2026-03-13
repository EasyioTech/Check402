# Designer Mode — ROADMAP.md

## Feature Goal
Add Designer Mode to check402 — a parallel product track for graphic designers to manage design projects, share watermarked previews with clients, collect feedback, and auto-purge files on completion.

---

## Phases

### Phase 1: Foundation — DB Schema + R2 + Auth Extension
**Goal:** Add Designer mode to the existing system with zero breakage to Developer mode.
- Extend Prisma schema: `User.mode`, `DesignProject`, `DesignFile`, `DesignComment`
- Run `prisma db push`
- Install and configure Cloudflare R2 client (`@aws-sdk/client-s3`)
- Create `lib/r2.ts` R2 client singleton
- Extend onboarding Step 1 to offer Developer/Designer path
- Extend auth session to carry `user.mode`

### Phase 2: Designer Dashboard + Project Management
**Goal:** Designers can create and manage design projects from an authenticated `/designer` area.
- `/designer` layout — sidebar matching dashboard style, links: Overview, Projects
- `/designer/projects` — project list with status badges
- `/designer/projects/new` — create project form
- `/designer/projects/[id]` — project detail page (file list, status controls, share link)
- API routes: `GET/POST /api/design-projects`, `GET/PUT/DELETE /api/design-projects/[id]`

### Phase 3: File Upload + Watermark Processing
**Goal:** Designers upload files to R2 (via presigned URLs); server generates watermarked previews.
- `POST /api/design-projects/[id]/upload-url` — return presigned R2 PUT URL
- Client-side upload directly to R2 using presigned URL
- `POST /api/design-projects/[id]/process` — after upload, fetch from R2, process with Sharp/pdfjs, write preview back to R2, create DesignFile DB record
- `GET /api/design-projects/[id]/files` — list files with signed preview URLs
- `DELETE /api/design-projects/[id]/files/[fileId]` — delete file + R2 objects
- File upload UI on project detail page (drag-and-drop, progress, multi-file)

### Phase 4: Public Preview Page + Client Comments
**Goal:** Generate public preview links; clients can view watermarked files and leave comments.
- `GET /api/preview/[token]` — validate token, return signed preview URLs (1h expiry)
- `/preview/[token]` — public page: watermarked gallery, comment thread, approve button
- `GET/POST /api/design-projects/[id]/comments` — designer reads comments; clients post
- Status transitions on designer side: IN_REVIEW → CHANGES_REQUESTED / APPROVED
- Copy-to-clipboard share link on designer project detail page

### Phase 5: Completion + File Purge
**Goal:** On project completion, atomically mark COMPLETED and delete all R2 objects.
- `POST /api/design-projects/[id]/complete` — set status COMPLETED, delete all R2 keys under `designs/{projectId}/`
- R2 batch delete using `DeleteObjectsCommand`
- Designer UI: "Mark as Complete & Purge Files" confirmation modal
- Confirmation screen: shows purge count + timestamp

---

## Dependencies Between Phases
- Phase 2 requires Phase 1 (schema + R2 client)
- Phase 3 requires Phase 2 (project must exist)
- Phase 4 requires Phase 3 (files must be uploadable)
- Phase 5 requires Phase 4 (project must be in APPROVED state)

---

## Tech Stack Additions
| Tool | Purpose |
|------|---------|
| `@aws-sdk/client-s3` | R2 compatible S3 client |
| `@aws-sdk/s3-request-presigner` | Presigned PUT/GET URLs |
| `sharp` | Image resize + watermark (already in most Next.js setups) |
| `pdfjs-dist` | PDF page 1 → image buffer (server-side) |

## New ENV Vars
```
CF_ACCOUNT_ID=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=check402-designs
```

### Phase 6: CI/CD Pipeline
**Status**: ✅ Complete
**Goal:** Automated deployment to a VPS via SSH using GitHub Actions and Docker.
- Create GitHub Actions workflow file `.github/workflows/deploy.yml`
- Build Docker image on push to `main` branch
- Push to GitHub Container Registry (GHCR) or Docker Hub
- SSH into VPS, pull the latest image, and restart the Docker container
- Configure necessary GitHub Secrets (SSH Key, Host, User, Registry credentials)

