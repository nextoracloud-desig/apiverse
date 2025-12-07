import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ensureApiExists } from "@/actions/api-actions";

const saveSchema = z.object({
    apiId: z.string(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { apiId } = saveSchema.parse(body);
        const userId = (session.user as any).id;

        // Ensure API exists in DB (sync from catalog if needed)
        await ensureApiExists(apiId);

        // Check if already saved
        const existing = await prisma.savedApi.findUnique({
            where: {
                userId_apiId: {
                    userId,
                    apiId,
                },
            },
        });

        if (existing) {
            // Toggle off
            await prisma.savedApi.delete({
                where: { id: existing.id },
            });
            return NextResponse.json({ saved: false });
        } else {
            // Toggle on
            await prisma.savedApi.create({
                data: {
                    userId,
                    apiId,
                },
            });
            return NextResponse.json({ saved: true });
        }

    } catch (error) {
        console.error("Saved API route error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}

export async function GET(req: Request) {
    // For listing saved APIs, might be easier to do in Server Component,
    // but this endpoint can return IDs if needed for client-side checks.
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }
        const userId = (session.user as any).id;

        const saved = await prisma.savedApi.findMany({
            where: { userId },
            select: { apiId: true },
        });

        return NextResponse.json({ savedIds: saved.map(s => s.apiId) });
    } catch (error) {
        return new NextResponse("Error", { status: 500 });
    }
}
