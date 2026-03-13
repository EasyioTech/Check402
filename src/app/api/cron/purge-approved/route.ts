import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getR2Client, getR2Bucket } from "@/lib/r2";
import { DeleteObjectsCommand } from "@aws-sdk/client-s3";

/**
 * GET /api/cron/purge-approved
 *
 * Auto-purges files for DesignProjects that have been in APPROVED status
 * for more than 24 hours. Sets status → COMPLETED and stamps purgedAt.
 *
 * Must be called by an external scheduler (cron job / Coolify scheduler).
 * Protected by CRON_SECRET env var via `Authorization: Bearer <secret>` header.
 *
 * Example cron (runs every hour):
 *   curl -sS -H "Authorization: Bearer $CRON_SECRET" \
 *        https://check402.com/api/cron/purge-approved
 */
export async function GET(req: Request) {
    // Verify cron secret
    const cronSecret = process.env.CRON_SECRET;
    if (!cronSecret) {
        return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
    }

    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000); // 24 hours ago

    try {
        // Find all projects past the leeway window that haven't been purged yet
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const projects = await (prisma.designProject as any).findMany({
            where: {
                status: "APPROVED",
                approvedAt: { lte: cutoff },
                purgedAt: null,
            },
            include: { files: true },
        });

        const results: { id: string; name: string; purgedCount: number; error?: string }[] = [];

        for (const project of projects) {
            try {
                const keys: string[] = [];
                for (const file of project.files) {
                    keys.push(file.originalKey);
                    if (file.previewKey) keys.push(file.previewKey);
                }

                const r2 = getR2Client();
                const R2_BUCKET = getR2Bucket();
                let purgedCount = 0;

                if (keys.length > 0) {
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
                        } catch (r2Err) {
                            console.error(`[cron] R2 batch error for project ${project.id}:`, r2Err);
                        }
                    }
                }

                const now = new Date();
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                await (prisma.designProject as any).update({
                    where: { id: project.id },
                    data: { status: "COMPLETED", purgedAt: now },
                });

                // Remove file records from DB
                await prisma.designFile.deleteMany({ where: { designProjectId: project.id } });

                results.push({ id: project.id, name: project.name, purgedCount });
                console.log(`[cron] Auto-purged project ${project.id} (${project.name}) — ${purgedCount} files`);
            } catch (projectErr) {
                console.error(`[cron] Failed to purge project ${project.id}:`, projectErr);
                results.push({ id: project.id, name: project.name, purgedCount: 0, error: String(projectErr) });
            }
        }

        return NextResponse.json({
            processed: results.length,
            cutoff: cutoff.toISOString(),
            results,
        });
    } catch (error) {
        console.error("[cron/purge-approved]", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
