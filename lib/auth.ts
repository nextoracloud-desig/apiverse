import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: "/auth/signin",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                // basic guard
                if (!credentials?.email || !credentials.password) {
                    return null;
                }

                // user from DB
                const user = await prisma.user.findUnique({
                    where: { email: credentials.email },
                });

                // agar user ही नहीं या password column missing
                if (!user?.password) {
                    return null;
                }

                // bcrypt compare
                const isPasswordValid = user.password === credentials.password;

                if (!isPasswordValid) {
                    return null;
                }

                // yahi se role bhi bhej
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: (user as any).role ?? "user",
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // login ke time user aayega, baad me sirf token चलेगा
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role ?? "user";
            }
            return token;
        },

        async session({ session, token }) {
            if (session.user) {
                (session.user as any).id = token.id;
                (session.user as any).role = token.role ?? "user";
            }
            return session;
        },
    },
};
