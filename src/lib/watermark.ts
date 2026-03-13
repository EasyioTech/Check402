import sharp from "sharp";

/**
 * Builds a tiled diagonal "PREVIEW ONLY — check402.com" watermark overlay
 * as a transparent PNG buffer matching the given dimensions.
 */
async function buildWatermarkOverlay(width: number, height: number): Promise<Buffer> {
    const tileSize = 220;
    const cx = tileSize / 2;
    const cy = tileSize / 2;

    const svgTile = `<svg width="${tileSize}" height="${tileSize}" xmlns="http://www.w3.org/2000/svg">
        <text x="${cx}" y="${cy - 8}" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial, sans-serif" font-size="15" font-weight="bold"
            fill="rgba(120,120,120,0.50)"
            transform="rotate(-38, ${cx}, ${cy})">PREVIEW ONLY</text>
        <text x="${cx}" y="${cy + 10}" text-anchor="middle" dominant-baseline="middle"
            font-family="Arial, sans-serif" font-size="10"
            fill="rgba(120,120,120,0.40)"
            transform="rotate(-38, ${cx}, ${cy})">check402.com</text>
    </svg>`;

    const svgBuffer = Buffer.from(svgTile);

    const composites: sharp.OverlayOptions[] = [];
    for (let x = 0; x < width + tileSize; x += tileSize) {
        for (let y = 0; y < height + tileSize; y += tileSize) {
            composites.push({ input: svgBuffer, top: y, left: x });
        }
    }

    return sharp({
        create: {
            width: width,
            height: height,
            channels: 4,
            background: { r: 0, g: 0, b: 0, alpha: 0 },
        },
    })
        .composite(composites)
        .png()
        .toBuffer();
}

/**
 * Generates a watermarked JPEG preview for images and SVGs.
 * Returns null for videos and PDFs (no server-side preview without canvas).
 */
export async function generateWatermarkedPreview(
    originalBuffer: Buffer,
    mimeType: string
): Promise<Buffer | null> {
    // Videos: no preview
    if (mimeType.startsWith("video/")) return null;

    // PDFs: skip — pdfjs-dist requires canvas for server-side rasterization
    if (mimeType === "application/pdf") return null;

    let imageBuffer: Buffer;

    // SVG: rasterize to PNG first
    if (mimeType === "image/svg+xml") {
        imageBuffer = await sharp(originalBuffer).png().toBuffer();
    } else {
        imageBuffer = originalBuffer;
    }

    // Step 1: Resize to max 1200px wide, convert to JPEG at 70% quality
    const resized = await sharp(imageBuffer)
        .resize({ width: 1200, withoutEnlargement: true })
        .jpeg({ quality: 70 })
        .toBuffer();

    // Step 2: Get actual dimensions after resize
    const meta = await sharp(resized).metadata();
    const w = meta.width ?? 1200;
    const h = meta.height ?? 800;

    // Step 3: Build tiled watermark overlay
    const watermark = await buildWatermarkOverlay(w, h);

    // Step 4: Composite watermark over resized image
    return sharp(resized)
        .composite([{ input: watermark, blend: "over" }])
        .jpeg({ quality: 75 })
        .toBuffer();
}
