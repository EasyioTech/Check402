import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
    const isLoggedIn = !!req.auth;
    const isApiRoute = req.nextUrl.pathname.startsWith("/api");
    const isPublicApiRoute =
        req.nextUrl.pathname.startsWith("/api/auth");

    if (isApiRoute && !isPublicApiRoute && !isLoggedIn) {
        return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Redirect unauthenticated users who try to access other protected routes
    if (!isApiRoute && !isLoggedIn) {
        return Response.redirect(new URL("/login", req.nextUrl));
    }
});

export const config = {
    matcher: ["/dashboard/:path*", "/api/:path*"],
};
