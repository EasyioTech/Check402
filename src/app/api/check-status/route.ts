import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Rate limiting store
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 60; // 60 requests per minute

function checkRateLimit(key: string): boolean {
    const now = Date.now();
    const entry = rateLimit.get(key);

    if (!entry || now > entry.resetTime) {
        rateLimit.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
        return true;
    }

    if (entry.count >= RATE_LIMIT_MAX) {
        return false;
    }

    entry.count++;
    return true;
}

export async function GET(request: NextRequest) {
    const apiKey = request.nextUrl.searchParams.get("key");

    if (!apiKey) {
        return NextResponse.json(
            { error: "API key is required. Use ?key=YOUR_API_KEY" },
            { status: 400, headers: corsHeaders() }
        );
    }

    // Rate limit by API key
    if (!checkRateLimit(apiKey)) {
        return NextResponse.json(
            { error: "Rate limit exceeded. Try again later." },
            { status: 429, headers: corsHeaders() }
        );
    }

    const project = await prisma.project.findUnique({
        where: { apiKey },
        select: { name: true, status: true, client: true },
    });

    if (!project) {
        return NextResponse.json(
            { error: "Invalid API key" },
            { status: 404, headers: corsHeaders() }
        );
    }

    return NextResponse.json(
        {
            status: project.status,
            project: project.name,
            client: project.client,
        },
        { headers: corsHeaders() }
    );
}

// Handle CORS preflight
export async function OPTIONS() {
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

function corsHeaders(): HeadersInit {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Max-Age": "86400",
    };
}
