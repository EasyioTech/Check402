import { S3Client } from "@aws-sdk/client-s3";

let _r2: S3Client | null = null;

/**
 * Returns the lazily-initialised R2 S3Client.
 * Call this inside request handlers — never at module top level —
 * so Next.js build-time static analysis doesn't throw on missing env vars.
 */
export function getR2Client(): S3Client {
    if (_r2) return _r2;

    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId) throw new Error("R2_ACCOUNT_ID env var is required");
    if (!accessKeyId) throw new Error("R2_ACCESS_KEY_ID env var is required");
    if (!secretAccessKey) throw new Error("R2_SECRET_ACCESS_KEY env var is required");

    _r2 = new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
    });
    return _r2;
}

/**
 * Returns the R2 bucket name from env.
 * Call inside request handlers only.
 */
export function getR2Bucket(): string {
    const bucket = process.env.R2_BUCKET_NAME;
    if (!bucket) throw new Error("R2_BUCKET_NAME env var is required");
    return bucket;
}

/**
 * Builds a permanent public CDN URL for an R2 object key.
 * Requires R2_PUBLIC_URL to be set (your Cloudflare custom domain or r2.dev URL).
 *
 * Example: getR2PublicUrl("designs/abc/previews/xyz-preview.jpg")
 *       => "https://cdn.check402.com/designs/abc/previews/xyz-preview.jpg"
 */
export function getR2PublicUrl(key: string): string {
    const base = process.env.R2_PUBLIC_URL;
    if (!base) throw new Error("R2_PUBLIC_URL env var is required");
    // Strip trailing slash from base, ensure key has no leading slash
    return `${base.replace(/\/$/, "")}/${key.replace(/^\//, "")}`;
}
