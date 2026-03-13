import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getR2Client, getR2Bucket } from "@/lib/r2";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { generateWatermarkedPreview } from "@/lib/watermark";
import { randomUUID } from "crypto";

async function streamToBuffer(stream: ReadableStream | NodeJS.ReadableStream): Promise<Buffer> {
    if (stream instanceof ReadableStream) {
        const reader = stream.getReader();
        const chunks: Uint8Array[] = [];
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            if (value) chunks.push(value);
        }
        return Buffer.concat(chunks);
    }
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        (stream as NodeJS.ReadableStream).on("data", (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
        (stream as NodeJS.ReadableStream).on("end", () => resolve(Buffer.concat(chunks)));
        (stream as NodeJS.ReadableStream).on("error", reject);
    });
}

function mimeToFileType(mimeType: string): string {
    if (mimeType === "image/svg+xml") return "svg";
    if (mimeType.startsWith("image/")) return "image";
    if (mimeType === "application/pdf") return "pdf";
    if (mimeType.startsWith("video/")) return "video";
    return "other";
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

        const body = await req.json();
        const { objectKey, fileName, mimeType, fileSize } = body;

        if (!objectKey || !fileName || !mimeType || typeof fileSize !== "number") {
            return NextResponse.json({ error: "objectKey, fileName, mimeType, fileSize are required" }, { status: 400 });
        }

        const fileType = mimeToFileType(mimeType);
        const r2 = getR2Client();
        const R2_BUCKET = getR2Bucket();

        const getResult = await r2.send(
            new GetObjectCommand({ Bucket: R2_BUCKET, Key: objectKey })
        );
        if (!getResult.Body) {
            return NextResponse.json({ error: "Could not fetch uploaded file from R2" }, { status: 500 });
        }
        const originalBuffer = await streamToBuffer(getResult.Body as ReadableStream | NodeJS.ReadableStream);

        let previewKey: string | null = null;
        const previewBuffer = await generateWatermarkedPreview(originalBuffer, mimeType);

        if (previewBuffer) {
            previewKey = `designs/${id}/previews/${randomUUID()}-preview.jpg`;
            await r2.send(
                new PutObjectCommand({
                    Bucket: R2_BUCKET,
                    Key: previewKey,
                    Body: previewBuffer,
                    ContentType: "image/jpeg",
                })
            );
        }

        const designFile = await prisma.designFile.create({
            data: {
                designProjectId: id,
                originalKey: objectKey,
                previewKey,
                fileName,
                fileType,
                mimeType,
                fileSize,
            },
        });

        return NextResponse.json({ success: true, fileId: designFile.id, previewKey });
    } catch (error) {
        console.error("[POST /process]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
