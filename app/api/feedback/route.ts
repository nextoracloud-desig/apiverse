import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const feedbackSchema = z.object({
    apiId: z.string(),
    rating: z.number().min(1).max(5),
    badge: z.enum(["Working", "Broken", "Scam", "Recommended"]).optional(),
    comment: z.string().optional(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { apiId, rating, badge, comment } = feedbackSchema.parse(body);
        const userId = (session.user as any).id;

        // Upsert feedback
        const feedback = await prisma.apiFeedback.upsert({
            where: {
                userId_apiId: { userId, apiId }
            },
            update: {
                rating,
                badge: badge || null,
                comment: comment || null,
            },
            create: {
                userId,
                apiId,
                rating,
                badge: badge || null,
                comment: comment || null,
            }
        });

        // Async update aggregation on API (Average Rating)
        // We can do this in background or hook. For now, simple avg calculation.
        const aggregations = await prisma.apiFeedback.aggregate({
            where: { apiId },
            _avg: { rating: true },
            _count: { rating: true },
        });

        await prisma.api.update({
            where: { id: apiId },
            data: {
                rating: aggregations._avg.rating || 0,
                reviewCount: aggregations._count.rating || 0
            }
        });

        return NextResponse.json(feedback);
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid Data", { status: 400 });
        }
        console.error("Feedback error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
