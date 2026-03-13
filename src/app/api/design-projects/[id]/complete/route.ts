import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getR2Client, getR2Bucket } from "@/lib/r2";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

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
        const project = await prisma.designProject.findUnique({
            where: { id },
            include: { files: true },
        });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (project.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }
        if (project.status !== "APPROVED") {
            return NextResponse.json(
                { error: "Project must be approved before completing" },
                { status: 400 }
            );
        }

        const keys: string[] = [];
        for (const file of project.files) {
            keys.push(file.originalKey);
            if (file.previewKey) keys.push(file.previewKey);
        }

        const r2 = getR2Client();
        const R2_BUCKET = getR2Bucket();

        let purgedCount = 0;
        const BATCH_SIZE = 1000;
        for (let i = 0; i < keys.length; i += BATCH_SIZE) {
            const batch = keys.slice(i, i + BATCH_SIZE);
            try {
                await r2.send(
                    new DeleteObjectsCommand({
                        Bucket: R2_BUCKET,
                        Delete: {
                            Objects: batch.map((k) => ({ Key: k })),
                            Quiet: true,
                        },
                    })
                );
                purgedCount += batch.length;
            } catch (r2Error) {
                console.error("[complete] R2 batch delete error:", r2Error);
            }
        }

        await prisma.designProject.update({
            where: { id },
            data: { status: "COMPLETED" },
        });

        await prisma.designFile.deleteMany({ where: { designProjectId: id } });

        const completedAt = new Date().toISOString();
        return NextResponse.json({ success: true, purgedCount, completedAt });
    } catch (error) {
        console.error("[POST /complete]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
