import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    secret: process.env.NEXTAUTH_SECRET,
    session: {
        strategy: "jwt",
    },
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
                name: { label: "Name", type: "text" }
            },
            async authorize(credentials) {
                const email = credentials?.email?.trim().toLowerCase();
                const password = credentials?.password;
                const name = credentials?.name;

                console.log("AUTH DEBUG: start", email);

                try {
                    if (!email || !password) {
                        throw new Error("Email and password are required");
                    }

                    // 1) Check if user exists
                    const user = await prisma.user.findUnique({
                        where: { email },
                    });

                    // 2) If NO user found → Create new user (Auto-Signup)
                    if (!user) {
                        console.log("AUTH DEBUG: Creating new user", email);
                        const hashedPassword = await bcrypt.hash(password, 10);

                        const newUser = await prisma.user.create({
                            data: {
                                email,
                                name: name || null, // Capture name if provided
                                passwordHash: hashedPassword,
                                role: "user",
                                plan: "free",
                                onboarded: false,
                            },
                        });

                        console.log("AUTH DEBUG: New user created", newUser.id);
                        return newUser;
                    }

                    // 3) Existing User: Check Magic Link status
                    if (!user.passwordHash) {
                        console.log("AUTH DEBUG: Magic link user", email);
                        throw new Error("This account was created with magic link. Please reset your password.");
                    }

                    // 4) Verify password
                    const isValid = await bcrypt.compare(password, user.passwordHash);
                    console.log("AUTH DEBUG: password match?", email, isValid);

                    if (!isValid) {
                        throw new Error("Invalid email or password");
                    }

                    console.log("AUTH DEBUG: login success", email);
                    return user;
                } catch (error: any) {
                    console.error("AUTH DEBUG", error); // Log full error as requested

                    if (error.message === "Invalid email or password") {
                        throw error;
                    }
                    if (error.message.includes("magic link")) {
                        throw error;
                    }
                    if (error.message === "Email and password are required") {
                        throw error;
                    }

                    // For unexpected errors
                    throw new Error("Unexpected auth error, check server logs");
                }
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
