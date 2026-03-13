import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getR2Client, getR2Bucket } from "@/lib/r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { randomUUID } from "crypto";

const MAX_FILE_SIZE = 52_428_800; // 50 MB

const ALLOWED_MIME_TYPES = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/svg+xml",
    "application/pdf",
    "video/mp4",
    "video/quicktime",
]);

function sanitizeFilename(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9.\-_]/g, "-")
        .replace(/-+/g, "-")
        .slice(0, 80);
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const project = await prisma.designProject.findUnique({ where: { id } });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (project.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (project.status === "COMPLETED") {
            return NextResponse.json({ error: "Project is completed" }, { status: 400 });
        }

        const fileCount = await prisma.designFile.count({ where: { designProjectId: id } });
        if (fileCount >= 20) {
            return NextResponse.json({ error: "Maximum 20 files per project" }, { status: 400 });
        }

        const body = await req.json();
        const { fileName, mimeType, fileSize } = body;

        if (!fileName || !mimeType || typeof fileSize !== "number") {
            return NextResponse.json({ error: "fileName, mimeType and fileSize are required" }, { status: 400 });
        }
        if (fileSize > MAX_FILE_SIZE) {
            return NextResponse.json({ error: "File exceeds 50 MB limit" }, { status: 400 });
        }
        if (!ALLOWED_MIME_TYPES.has(mimeType)) {
            return NextResponse.json({ error: `Unsupported file type: ${mimeType}` }, { status: 400 });
        }

        const safe = sanitizeFilename(fileName);
        const objectKey = `designs/${id}/originals/${randomUUID()}-${safe}`;
        const r2 = getR2Client();
        const R2_BUCKET = getR2Bucket();

        const uploadUrl = await getSignedUrl(
            r2,
            new PutObjectCommand({
                Bucket: R2_BUCKET,
                Key: objectKey,
                ContentType: mimeType,
            }),
            { expiresIn: 300 }
        );

        return NextResponse.json({ uploadUrl, objectKey });
    } catch (error) {
        console.error("[POST /upload-url]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
