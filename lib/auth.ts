import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";


export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    secret: process.env.NEXTAUTH_SECRET, // Critical for production (Render)
    session: {
        strategy: "jwt",
    },
    // Remove debug/cookie hacks for simple auth
    debug: process.env.NODE_ENV === 'development',
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                const email = credentials?.email?.trim().toLowerCase();
                const password = credentials?.password;

                if (!email || !password) {
                    throw new Error("Please enter email and password.");
                }

                // 1) Check if user already exists
                const existing = await prisma.user.findUnique({
                    where: { email },
                });

                // 2) If user does NOT exist -> create account (signup)
                if (!existing) {
                    const hash = await bcrypt.hash(password, 10);
                    const user = await prisma.user.create({
                        data: {
                            email,
                            passwordHash: hash,
                            role: "user",
                            plan: "free",
                        },
                    });
                    return {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        plan: user.plan,
                    };
                }

                // 3) If user exists but no passwordHash (old magic-link account)
                if (!existing.passwordHash) {
                    // For now, reject login with clear message
                    throw new Error(
                        "This account was created with magic-link. Please contact support or reset your password."
                    );
                }

                // 4) Normal login: compare password
                const valid = await bcrypt.compare(password, existing.passwordHash);
                if (!valid) {
                    throw new Error("Invalid email or password.");
                }

                // 5) Return user object for JWT
                return {
                    id: existing.id,
                    email: existing.email,
                    role: existing.role,
                    plan: existing.plan,
                };
            },
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role ?? "user";
                token.plan = (user as any).plan ?? "free";
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role;
                (session.user as any).plan = token.plan;
            }
            return session;
        },
        async redirect({ url, baseUrl }) {
            // Ensure we always go to dashboard, handling relative URLs correctly
            if (url.startsWith("/")) return `${baseUrl}${url}`;
            else if (new URL(url).origin === baseUrl) return url;
            return `${baseUrl}/dashboard`;
        },
    },
};
