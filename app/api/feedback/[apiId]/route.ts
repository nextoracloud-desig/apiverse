export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: { apiId: string } }) {
    try {
        const feedbacks = await prisma.apiFeedback.findMany({
            where: { apiId: params.apiId },
            include: {
                user: {
                    select: { name: true, image: true }
                }
            },
            orderBy: { createdAt: "desc" },
            take: 10,
        });

        return NextResponse.json(feedbacks);
    } catch (error) {
        return new NextResponse("Internal Error", { status: 500 });
    }
}
