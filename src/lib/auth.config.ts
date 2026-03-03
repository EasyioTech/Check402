import type { NextAuthConfig } from "next-auth";

export const authConfig = {
    pages: {
        signIn: "/login",
    },
    session: { strategy: "jwt" },
    callbacks: {
        jwt({ token, user }) {
            if (user) {
                token.id = user.id as string;
                token.plan = user.plan;
                token.role = user.role;
            }
            return token;
        },
        session({ session, token }) {
            session.user.id = token.id as string;
            session.user.plan = token.plan as string | undefined;
            session.user.role = token.role as string | undefined;
            return session;
        },
    },
    providers: [], // Node-dependent providers should be added in auth.ts
} satisfies NextAuthConfig;
