import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getR2Client, getR2Bucket } from "@/lib/r2";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; fileId: string }> }
) {
    const { id, fileId } = await params;
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

        const file = await prisma.designFile.findUnique({ where: { id: fileId } });
        if (!file || file.designProjectId !== id) {
            return NextResponse.json({ error: "File not found" }, { status: 404 });
        }

        const r2 = getR2Client();
        const R2_BUCKET = getR2Bucket();

        const deletePromises = [
            r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: file.originalKey })),
        ];
        if (file.previewKey) {
            deletePromises.push(
                r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: file.previewKey }))
            );
        }
        await Promise.allSettled(deletePromises);

        await prisma.designFile.delete({ where: { id: fileId } });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[DELETE /files/[fileId]]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
