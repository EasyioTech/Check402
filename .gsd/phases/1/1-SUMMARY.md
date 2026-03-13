# Phase 1.1 — Summary

## What was done

### Task 1: Prisma Schema Extended
- Added `mode String @default("DEVELOPER")` field to `User` model
- Added `designProjects DesignProject[]` relation to `User` model
- Created `DesignProject` model with: id, name, clientEmail, description, status (DRAFT|IN_REVIEW|CHANGES_REQUESTED|APPROVED|COMPLETED), previewToken (unique UUID), userId, files, comments, createdAt, updatedAt
- Created `DesignFile` model with: id, designProjectId, originalKey, previewKey, fileName, fileType, mimeType, fileSize, version, createdAt
- Created `DesignComment` model with: id, designProjectId, clientEmail, message, isApproval, createdAt

### Task 2: R2 Client Created (`src/lib/r2.ts`)
- S3Client configured with Cloudflare R2 endpoint using account ID from env
- Exports `r2` singleton and `R2_BUCKET` constant
- Validates all required env vars at module load time

### Package installs needed (manual — see notes)
- `@aws-sdk/client-s3`
- `@aws-sdk/s3-request-presigner`
- `sharp`
- `pdfjs-dist`

### .env updated
- Added `CF_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` placeholder vars

### docker-compose.yml updated
- Added all 4 R2 env vars to the web service environment section

## Files Modified
- `prisma/schema.prisma` — new models + User.mode field
- `src/lib/r2.ts` — NEW
- `.env` — R2 vars added
- `docker-compose.yml` — R2 env vars passed to container

## Verification
Run: `npx prisma validate` → should pass
Run: `npx prisma db push` → applies schema changes
