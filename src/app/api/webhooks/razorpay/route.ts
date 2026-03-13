import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

export async function POST(req: Request) {
    const body = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-razorpay-signature") as string;

    if (!signature) {
        return new NextResponse("No signature", { status: 400 });
    }

    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
        .update(body)
        .digest("hex");

    if (expectedSignature !== signature) {
        return new NextResponse("Invalid signature", { status: 400 });
    }

    const json = JSON.parse(body);

    if (json.event === "order.paid") {
        const orderId = json.payload.order.entity.id;
        const userId = json.payload.order.entity.notes.userId;
        const planId = json.payload.order.entity.notes.planId;
        const planSlug = json.payload.order.entity.notes.planSlug;

        if (userId) {
            const updateData: Record<string, unknown> = {
                razorpayOrderId: orderId,
            };

            if (planId) {
                updateData.planId = planId;
                // Also update the legacy plan field for backward compat
                updateData.plan = planSlug?.toUpperCase() || "ENTERPRISE";
            } else {
                // Fallback for old orders without planId
                updateData.plan = "ENTERPRISE";
            }

            await prisma.user.update({
                where: { id: userId },
                data: updateData,
            });
        }
    }

    return new NextResponse(null, { status: 200 });
}
