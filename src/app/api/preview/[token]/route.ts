import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getR2Client, getR2Bucket } from "@/lib/r2";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { GetObjectCommand } from "@aws-sdk/client-s3";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ token: string }> }
) {
    const { token } = await params;

    try {
        const project = await prisma.designProject.findUnique({
            where: { previewToken: token },
        });

        if (!project || project.status === "COMPLETED") {
            return NextResponse.json({ error: "Preview not available" }, { status: 404 });
        }

        const files = await prisma.designFile.findMany({
            where: { designProjectId: project.id },
            orderBy: { createdAt: "asc" },
        });

        const r2 = getR2Client();
        const R2_BUCKET = getR2Bucket();

        const filesWithUrls = await Promise.all(
            files.map(async (file) => {
                let previewUrl: string | null = null;
                if (file.previewKey) {
                    previewUrl = await getSignedUrl(
                        r2,
                        new GetObjectCommand({ Bucket: R2_BUCKET, Key: file.previewKey }),
                        { expiresIn: 3600 }
                    );
                }
                return {
                    id: file.id,
                    fileName: file.fileName,
                    fileType: file.fileType,
                    version: file.version,
                    previewUrl,
                };
            })
        );

        const comments = await prisma.designComment.findMany({
            where: { designProjectId: project.id },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                clientEmail: true,
                message: true,
                isApproval: true,
                createdAt: true,
            },
        });

        return NextResponse.json({
            project: {
                id: project.id,
                name: project.name,
                clientEmail: project.clientEmail,
                status: project.status,
                description: project.description,
            },
            files: filesWithUrls,
            comments,
        });
    } catch (error) {
        console.error("[GET /api/preview/[token]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
