import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isApiRoute = req.nextUrl.pathname.startsWith("/api");
    const isPublicApiRoute =
        req.nextUrl.pathname.startsWith("/api/auth") ||
        req.nextUrl.pathname.startsWith("/api/check-status") ||
        req.nextUrl.pathname.startsWith("/api/seo") ||
        req.nextUrl.pathname.startsWith("/sdk");

    if (isApiRoute && !isPublicApiRoute && !isLoggedIn) {
        return Response.json(
            { message: "Unauthorized" },
            {
                status: 401,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Methods": "GET, OPTIONS",
                    "Access-Control-Allow-Headers": "Content-Type",
                }
            }
        );
    }

    // Redirect unauthenticated users who try to access other protected routes
    if (!isApiRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", req.nextUrl));
    }
});

export const config = {
    matcher: ["/dashboard/:path*", "/api/:path*"],
};
