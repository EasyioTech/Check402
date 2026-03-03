import NextAuth, { DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

declare module "next-auth" {
    interface Session {
        user: {
            id: string;
            plan?: string;
            role?: string;
        } & DefaultSession["user"];
    }

    interface User {
        plan?: string;
        role?: string;
    }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    adapter: PrismaAdapter(prisma),
    providers: [
        GitHub,
        Credentials({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                // Check Admin first
                const admin = await prisma.admin.findUnique({
                    where: { email: credentials.email as string },
                });

                if (admin) {
                    const isValid = await bcrypt.compare(
                        credentials.password as string,
                        admin.password
                    );
                    if (isValid) {
                        return {
                            id: admin.id,
                            email: admin.email,
                            name: admin.name,
                            role: "ADMIN",
                        };
                    }
                }

                // Check User
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                });

                if (user) {
                    if (!user.password) return null;
                    const isValid = await bcrypt.compare(
                        credentials.password as string,
                        user.password
                    );
                    if (isValid) {
                        return {
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            plan: user.plan,
                            role: "USER",
                        };
                    }
                }

                return null;
            },
        }),
    ],
});
