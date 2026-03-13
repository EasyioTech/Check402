import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getR2PublicUrl } from "@/lib/r2";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const project = await (prisma.designProject as any).findUnique({ where: { id } });
        if (!project) return NextResponse.json({ error: "Not found" }, { status: 404 });
        if (project.userId !== session.user.id) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const files: any[] = await (prisma.designFile as any).findMany({
            where: { designProjectId: id },
            orderBy: { createdAt: "desc" },
        });

        // Build permanent CDN URLs for preview keys — no expiry, Cloudflare-cached
        const filesWithUrls = files.map((file) => ({
            ...file,
            previewUrl: file.previewKey ? getR2PublicUrl(file.previewKey) : null,
        }));

        return NextResponse.json(filesWithUrls);
    } catch (error) {
        console.error("[GET /files]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
