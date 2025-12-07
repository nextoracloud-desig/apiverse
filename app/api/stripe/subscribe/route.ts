import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

const PLANS = {
    starter: "price_starter_dummy_id", // Replace with env var in production
    developer: "price_developer_dummy_id",
};

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { plan } = body;
        const userId = (session.user as any).id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user) {
            return new NextResponse("User not found", { status: 404 });
        }

        // Mock Price ID selection. In real app, put these in env/consts mapping.
        // For testing, update these with real Stripe Price IDs or handle in test.
        let priceId = "";
        if (plan === "starter") priceId = "price_starter"; // Replace with real ID
        if (plan === "developer") priceId = "price_developer"; // Replace with real ID

        // Create Checkout Session
        const sessionParams: any = {
            billing_address_collection: "auto",
            line_items: [
                {
                    price_data: {
                        currency: "inr",
                        product_data: {
                            name: `${plan.charAt(0).toUpperCase() + plan.slice(1)} Plan`,
                            description: `Subscription to APIverse ${plan} tier`,
                        },
                        unit_amount: plan === "starter" ? 29900 : 89900,
                        recurring: {
                            interval: "month",
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: "subscription",
            success_url: `${process.env.NEXTAUTH_URL}/plans?success=true`,
            cancel_url: `${process.env.NEXTAUTH_URL}/plans?canceled=true`,
            metadata: {
                userId: userId,
                plan: plan,
            }
        };

        if (user.stripeCustomerId) {
            sessionParams.customer = user.stripeCustomerId;
        } else {
            sessionParams.customer_email = user.email;
        }

        const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

        return NextResponse.json({ url: checkoutSession.url });
    } catch (error) {
        console.error("Stripe subscribe error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
