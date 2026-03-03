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

        if (userId) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    plan: "ENTERPRISE",
                    razorpayOrderId: orderId,
                },
            });
        }
    }

    return new NextResponse(null, { status: 200 });
}
