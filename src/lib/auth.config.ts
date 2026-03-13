import type { NextAuthConfig } from "next-auth";
import { prisma } from "@/lib/prisma";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: { strategy: "jwt" },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // Initial sign-in — seed JWT from user object returned by authorize()
                token.id = user.id as string;
                token.plan = user.plan;
                token.role = user.role;
                token.mode = (user as unknown as { mode?: string }).mode ?? "DEVELOPER";
                token.onboardingComplete = (user as unknown as { onboardingComplete?: boolean }).onboardingComplete ?? false;
            } else if (token.id && token.role !== "ADMIN") {
                // Token refresh — re-read mutable fields from DB so changes made
                // during the session (e.g. completing onboarding) are reflected
                // immediately without requiring a new sign-in.
                try {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const dbUser = await (prisma.user as any).findUnique({
                        where: { id: token.id as string },
                        select: { onboardingComplete: true, mode: true, plan: true },
                    }) as { onboardingComplete: boolean; mode: string; plan: string } | null;
                    if (dbUser) {
                        token.onboardingComplete = dbUser.onboardingComplete;
                        token.mode = dbUser.mode ?? "DEVELOPER";
                        token.plan = dbUser.plan;
                    }
                } catch {
                    // Non-fatal: keep existing token values on DB error
                }
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.id as string;
            session.user.plan = token.plan as string | undefined;
            session.user.role = token.role as string | undefined;
            (session.user as unknown as { mode: string }).mode = (token.mode as string) ?? "DEVELOPER";
            (session.user as unknown as { onboardingComplete: boolean }).onboardingComplete = token.onboardingComplete as boolean ?? false;
            return session;
        },
    },
    providers: [], // Node-dependent providers should be added in auth.ts
} satisfies NextAuthConfig;
