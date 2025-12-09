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
    debug: true,
    useSecureCookies: false, // User requested explicit false
    cookies: {
        sessionToken: {
            name: `next-auth.session-token`,
            options: {
                httpOnly: true,
                sameSite: 'lax',
                path: '/',
                secure: false // Matching useSecureCookies: false
            }
        }
    },
    pages: {
        signIn: "/auth/signin",
        verifyRequest: "/auth/verify-request",
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
            allowDangerousEmailAccountLinking: true,
        }),
        EmailProvider({
            server: {
                host: process.env.EMAIL_SERVER_HOST,
                port: Number(process.env.EMAIL_SERVER_PORT),
                auth: {
                    user: process.env.EMAIL_SERVER_USER,
                    pass: process.env.EMAIL_SERVER_PASSWORD,
                },
            },
            from: process.env.EMAIL_FROM,
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

                // bcrypt compare or plain text fallback
                let isPasswordValid = false;

                if (user.password.startsWith("$2") || user.password.startsWith("$1")) {
                    isPasswordValid = await bcrypt.compare(credentials.password, user.password);
                } else {
                    isPasswordValid = user.password === credentials.password;
                }

                if (!isPasswordValid) {
                    return null;
                }

                // yahi se role plan bhi bhej
                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.image,
                    role: (user as any).role ?? "user",
                    plan: (user as any).plan ?? "free",
                    onboarded: (user as any).onboarded ?? false,
                };
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
