export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const userId = (session.user as any).id;
        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.stripeCustomerId) {
            return new NextResponse("No subscription found", { status: 400 });
        }

        // ⭐ yahan guard
        if (!stripe) {
            return new NextResponse("Stripe not configured", { status: 500 });
        }

        const portalSession = await stripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${process.env.NEXTAUTH_URL}/plans`,
        });

        return NextResponse.json({ url: portalSession.url });
    } catch (error) {
        console.error("Stripe portal error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
