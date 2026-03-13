---
phase: 1
plan: 1
wave: 1
---

# Plan 1.1: Schema Extension + R2 Client Setup

## Objective
Extend the database schema with Designer Mode models and set up the Cloudflare R2 client. This is the foundation all subsequent phases depend on.

## Context
- `.gsd/SPEC.md`
- `prisma/schema.prisma`
- `src/lib/prisma.ts`

## Tasks

<task type="auto">
  <name>Extend Prisma schema with Designer Mode models</name>
  <files>prisma/schema.prisma</files>
  <action>
    Add the following to prisma/schema.prisma:

    1. Add `mode String @default("DEVELOPER")` field to the User model (values: DEVELOPER | DESIGNER)

    2. Create DesignProject model:
    ```prisma
    model DesignProject {
      id           String   @id @default(uuid())
      name         String
      clientEmail  String
      description  String?
      status       String   @default("DRAFT")  // DRAFT | IN_REVIEW | CHANGES_REQUESTED | APPROVED | COMPLETED
      previewToken String   @unique @default(uuid())
      userId       String
      user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
      files        DesignFile[]
      comments     DesignComment[]
      createdAt    DateTime @default(now())
      updatedAt    DateTime @updatedAt
    }
    ```

    3. Create DesignFile model:
    ```prisma
    model DesignFile {
      id             String        @id @default(uuid())
      designProjectId String
      designProject  DesignProject @relation(fields: [designProjectId], references: [id], onDelete: Cascade)
      originalKey    String        // R2 object key for original file
      previewKey     String?       // R2 object key for watermarked preview (null for video)
      fileName       String
      fileType       String        // image | pdf | video | svg
      mimeType       String
      fileSize       Int
      version        Int           @default(1)
      createdAt      DateTime      @default(now())
    }
    ```

    4. Create DesignComment model:
    ```prisma
    model DesignComment {
      id             String        @id @default(uuid())
      designProjectId String
      designProject  DesignProject @relation(fields: [designProjectId], references: [id], onDelete: Cascade)
      clientEmail    String
      message        String        @db.Text
      isApproval     Boolean       @default(false)
      createdAt      DateTime      @default(now())
    }
    ```

    5. Add `designProjects DesignProject[]` relation to the User model.

    IMPORTANT: Do NOT modify any existing models. Only add new fields/models.
  </action>
  <verify>npx prisma validate</verify>
  <done>prisma validate passes with no errors; schema contains DesignProject, DesignFile, DesignComment models</done>
</task>

<task type="auto">
  <name>Install R2 SDK and create lib/r2.ts client</name>
  <files>
    package.json
    src/lib/r2.ts
    .env
    docker-compose.yml
  </files>
  <action>
    1. Install packages:
    ```bash
    npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
    ```

    2. Create `src/lib/r2.ts`:
    ```typescript
    import { S3Client } from "@aws-sdk/client-s3";

    if (!process.env.CF_ACCOUNT_ID) throw new Error("CF_ACCOUNT_ID is required");
    if (!process.env.R2_ACCESS_KEY_ID) throw new Error("R2_ACCESS_KEY_ID is required");
    if (!process.env.R2_SECRET_ACCESS_KEY) throw new Error("R2_SECRET_ACCESS_KEY is required");
    if (!process.env.R2_BUCKET_NAME) throw new Error("R2_BUCKET_NAME is required");

    export const r2 = new S3Client({
      region: "auto",
      endpoint: `https://${process.env.CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
      },
    });

    export const R2_BUCKET = process.env.R2_BUCKET_NAME;
    ```

    3. Add to `.env`:
    ```
    CF_ACCOUNT_ID=your-cloudflare-account-id
    R2_ACCESS_KEY_ID=your-r2-access-key
    R2_SECRET_ACCESS_KEY=your-r2-secret-key
    R2_BUCKET_NAME=check402-designs
    ```

    4. Add same env vars to docker-compose.yml under the web service environment section.

    5. Add `sharp` and `pdfjs-dist` for later phases:
    ```bash
    npm install sharp pdfjs-dist
    npm install --save-dev @types/sharp
    ```
  </action>
  <verify>node -e "require('./src/lib/r2.ts')" OR check package.json for @aws-sdk/client-s3</verify>
  <done>package.json includes @aws-sdk/client-s3, @aws-sdk/s3-request-presigner, sharp, pdfjs-dist; src/lib/r2.ts exists</done>
</task>

## Success Criteria
- [ ] `npx prisma validate` passes
- [ ] `npx prisma db push` applies new models without errors
- [ ] `src/lib/r2.ts` exports r2 client singleton and R2_BUCKET constant
- [ ] `@aws-sdk/client-s3`, `sharp`, `pdfjs-dist` in package.json
- [ ] .env has all 4 R2 env vars (values to be filled by user)
