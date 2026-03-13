---
phase: 3
plan: 2
wave: 2
---

# Plan 3.2: Server-Side Watermark Processing

## Objective
After a file is uploaded to R2, the server fetches it, generates a watermarked preview using Sharp (images/SVG/PDF) and writes the preview back to R2. A DesignFile DB record is created linking original + preview keys.

## Context
- `.gsd/SPEC.md`
- `src/lib/r2.ts`
- `prisma/schema.prisma` — DesignFile model

## Tasks

<task type="auto">
  <name>Create watermark utility and processing API route</name>
  <files>
    src/lib/watermark.ts
    src/app/api/design-projects/[id]/process/route.ts
  </files>
  <action>
    1. Create `src/lib/watermark.ts`:

    ```typescript
    import sharp from "sharp";

    // Generates a tiled diagonal "PREVIEW ONLY" watermark overlay as PNG buffer
    async function buildWatermarkOverlay(width: number, height: number): Promise<Buffer> {
      const tileSize = 200;
      const svg = `<svg width="${tileSize}" height="${tileSize}" xmlns="http://www.w3.org/2000/svg">
        <text x="10" y="100" font-family="Arial" font-size="18" fill="rgba(150,150,150,0.55)"
          transform="rotate(-40, ${tileSize/2}, ${tileSize/2})" font-weight="bold">PREVIEW ONLY</text>
      </svg>`;
      // Tile the SVG across the full image using sharp composite
      const svgBuffer = Buffer.from(svg);
      const tiles = [];
      for (let x = 0; x < width; x += tileSize) {
        for (let y = 0; y < height; y += tileSize) {
          tiles.push({ input: svgBuffer, top: y, left: x });
        }
      }
      // Create a transparent base then composite tiles
      return sharp({ create: { width, height, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
        .composite(tiles)
        .png()
        .toBuffer();
    }

    export async function generateWatermarkedPreview(
      originalBuffer: Buffer,
      mimeType: string
    ): Promise<Buffer | null> {
      // For video: no preview
      if (mimeType.startsWith("video/")) return null;

      let imageBuffer: Buffer;

      if (mimeType === "application/pdf") {
        // Use pdfjs-dist to rasterize page 1 to PNG
        // (pdfjs-dist server-side: import as legacy build)
        const pdfjsLib = await import("pdfjs-dist/legacy/build/pdf.js");
        const loadingTask = pdfjsLib.getDocument({ data: new Uint8Array(originalBuffer) });
        const pdfDoc = await loadingTask.promise;
        const page = await pdfDoc.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        // pdfjs does not render to buffer server-side without canvas; 
        // use fallback: store PDF, skip watermark preview, set previewKey = null
        // NOTE: Full PDF rasterization requires canvas npm package. 
        // For MVP: PDF previews will show a "PDF - Preview Unavailable" placeholder.
        return null;
      }

      // Rasterize SVG via sharp
      if (mimeType === "image/svg+xml") {
        imageBuffer = await sharp(originalBuffer).png().toBuffer();
      } else {
        imageBuffer = originalBuffer;
      }

      // Resize to max 1200px wide, 70% quality, then watermark
      const resized = await sharp(imageBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();

      const meta = await sharp(resized).metadata();
      const wm = await buildWatermarkOverlay(meta.width!, meta.height!);

      return sharp(resized)
        .composite([{ input: wm, blend: "over" }])
        .jpeg({ quality: 75 })
        .toBuffer();
    }
    ```

    2. Create `POST /api/design-projects/[id]/process/route.ts`:
       - Auth check: session user must own project
       - Body: { objectKey: string, fileName: string, mimeType: string, fileSize: number }
       - Determine fileType: 
         - mimeType starts with "image/" → "image" (SVG → "svg" if mimeType === "image/svg+xml")
         - mimeType === "application/pdf" → "pdf"
         - mimeType starts with "video/" → "video"
       - Fetch original from R2: `GetObjectCommand({ Bucket: R2_BUCKET, Key: objectKey })`
       - Convert Body stream to Buffer
       - Call `generateWatermarkedPreview(buffer, mimeType)`
       - If preview buffer is not null:
         - previewKey = `designs/{projectId}/previews/{uuid}-preview.jpg`
         - `PutObjectCommand({ Bucket: R2_BUCKET, Key: previewKey, Body: previewBuffer, ContentType: "image/jpeg" })`
       - Create DesignFile record in DB:
         ```prisma
         prisma.designFile.create({ data: {
           designProjectId: id,
           originalKey: objectKey,
           previewKey: previewBuffer ? previewKey : null,
           fileName, fileType, mimeType, fileSize
         }})
         ```
       - Return { success: true, fileId }
  </action>
  <verify>npx tsc --noEmit</verify>
  <done>TypeScript compiles; uploading an image via the UI creates a DesignFile record with both originalKey and previewKey in DB; previewKey object exists in R2</done>
</task>

## Success Criteria
- [ ] `src/lib/watermark.ts` exports `generateWatermarkedPreview`
- [ ] After upload + process, DesignFile DB record exists with correct keys
- [ ] Image files have a previewKey (watermarked JPEG exists in R2)
- [ ] Video files have previewKey = null (no processing attempted)
- [ ] TypeScript compiles cleanly
