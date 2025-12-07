import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const revokeSchema = z.object({
    keyId: z.string(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { keyId } = revokeSchema.parse(body);
        const userId = (session.user as any).id;

        // Check ownership
        const key = await prisma.userApiKey.findUnique({
            where: { id: keyId },
        });

        if (!key || key.userId !== userId) {
            return new NextResponse("Forbidden", { status: 403 });
        }

        // Revoke
        const updated = await prisma.userApiKey.update({
            where: { id: keyId },
            data: { status: "revoked" },
        });

        return NextResponse.json({ success: true, key: updated });

    } catch (error) {
        console.error("Revoke Key error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
