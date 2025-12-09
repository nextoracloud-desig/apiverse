import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import EmailProvider from "next-auth/providers/email";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    secret: process.env.NEXTAUTH_SECRET, // Critical for production (Render)
    session: {
        strategy: "jwt",
    },
    // Remove debug/cookie hacks for simple auth
    debug: process.env.NODE_ENV === 'development',
    providers: [
        // User requested to remove/comment out EmailProvider and Google for now
        /*
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        */
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials.password) {
                    throw new Error("Email and password are required");
                }

                const email = credentials.email.toLowerCase();
                const password = credentials.password;

                // 2) Find user
                const user = await prisma.user.findUnique({
                    where: { email },
                });

                if (!user) {
                    // 3a) Auto-Signup: Create new user
                    // console.log("Creating new user:", email);
                    const hash = await bcrypt.hash(password, 10);
                    const newUser = await prisma.user.create({
                        data: {
                            email,
                            name: email.split("@")[0],
                            passwordHash: hash,
                            role: "user",
                            plan: "free",
                            onboarded: false,
                        },
                    });
                    return {
                        id: newUser.id,
                        email: newUser.email,
                        name: newUser.name,
                        image: newUser.image,
                        role: "user",
                        plan: "free",
                        onboarded: false
                    };
                } else {
                    // 3b) Login existing user
                    if (!user.passwordHash) {
                        // User exists but has no password (maybe from Magic Link days)
                        // Per instructions: Reject login.
                        console.error("User has no password set.");
                        return null;
                    }

                    const isValid = await bcrypt.compare(password, user.passwordHash);
                    if (!isValid) {
                        return null; // Invalid password
                    }

                    return {
                        id: user.id,
                        email: user.email,
                        name: user.name,
                        image: user.image,
                        role: (user as any).role ?? "user",
                        plan: (user as any).plan ?? "free",
                        onboarded: (user as any).onboarded ?? false,
                    };
                }
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            // login ke time user aayega, baad me sirf token चलेगा
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role ?? "user";
                token.plan = (user as any).plan ?? "free";
                token.onboarded = (user as any).onboarded ?? false;
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role ?? "user";
                (session.user as any).plan = token.plan ?? "free";
                (session.user as any).onboarded = token.onboarded ?? false;
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
