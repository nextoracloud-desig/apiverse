import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { rotateApiKey } from "@/lib/key-service"
import { prisma as db } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user || !(session.user as any).id) return new NextResponse("Unauthorized", { status: 401 })
        const userId = (session.user as any).id

        const body = await req.json()
        const { keyId } = body

        if (!keyId) return new NextResponse("Missing keyId", { status: 400 })

        // Verify ownership
        const key = await db.apiKey.findUnique({
            where: { id: keyId },
            include: { workspace: true }
        })

        if (!key || key.workspace.ownerId !== userId) {
            return new NextResponse("Unauthorized", { status: 403 })
        }

        const { rawKey, apiKey } = await rotateApiKey(keyId)

        return NextResponse.json({ rawKey, apiKey })
    } catch (error) {
        console.error("Rotate Key Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
