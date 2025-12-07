import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { ensureApiExists } from "@/actions/api-actions";
import { v4 as uuidv4 } from "uuid";

const issueSchema = z.object({
    apiId: z.string(),
});

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return new NextResponse("Unauthorized", { status: 401 });
        }

        const body = await req.json();
        const { apiId } = issueSchema.parse(body);
        const userId = (session.user as any).id;

        // Ensure API exists
        await ensureApiExists(apiId);

        // Check for existing active key
        const existingKey = await prisma.userApiKey.findFirst({
            where: {
                userId,
                apiId,
                status: "active",
            },
        });

        if (existingKey) {
            return NextResponse.json({ key: existingKey });
        }

        // Generate new key
        const prefix = "sk_live_";
        const token = prefix + uuidv4().replace(/-/g, "");

        const newKey = await prisma.userApiKey.create({
            data: {
                userId,
                apiId,
                key: token,
                status: "active",
                name: `Key for ${apiId}`,
            },
        });

        return NextResponse.json({ key: newKey });

    } catch (error) {
        console.error("Issue Key error:", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }
}
