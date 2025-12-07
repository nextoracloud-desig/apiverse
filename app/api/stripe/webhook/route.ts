import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: Request) {
    const body = await req.text();
    const signature = headers().get("Stripe-Signature") as string;

    let event: Stripe.Event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET || ""
        );
    } catch (error: any) {
        return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
    }

    const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        const subscription = (await stripe.subscriptions.retrieve(
            session.subscription as string
        )) as Stripe.Subscription;

        if (!session?.metadata?.userId) {
            return new NextResponse("User ID is missing from metadata", { status: 400 });
        }

        await prisma.user.update({
            where: {
                id: session.metadata.userId,
            },
            data: {
                stripeCustomerId: session.customer as string,
                stripeSubscriptionId: session.subscription as string,
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    (subscription.current_period_end ?? subscription.current_period?.end ?? 0) * 1000
                ),
                plan: session.metadata.plan || "starter", // fallback
            },
        });
    }

    if (event.type === "invoice.payment_succeeded") {
        const subscription = (await stripe.subscriptions.retrieve(
            session.subscription as string
        )) as Stripe.Subscription;

        // Find user by subscription ID if metadata not present here
        const user = await prisma.user.findFirst({
            where: { stripeSubscriptionId: subscription.id },
        });

        if (user) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    stripeCurrentPeriodEnd: new Date(
                        (subscription.current_period_end ?? subscription.current_period?.end ?? 0) * 1000
                    ),
                    stripePriceId: subscription.items.data[0].price.id,
                },
            });
        }
    }

    return new NextResponse(null, { status: 200 });
}
