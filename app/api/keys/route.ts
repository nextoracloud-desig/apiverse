import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { generateApiKey, listApiKeys } from "@/lib/key-service"
import { prisma as db } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user || !(session.user as any).id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const userId = (session.user as any).id

        const body = await req.json()
        const { name, providerId, scopes } = body

        // Find or create workspace
        let workspace = await db.workspace.findFirst({
            where: { ownerId: userId }
        })

        if (!workspace) {
            workspace = await db.workspace.create({
                data: {
                    name: "Default Workspace",
                    ownerId: userId
                }
            })
        }

        const { rawKey, apiKey } = await generateApiKey({
            workspaceId: workspace.id,
            name: name || "Untitled Key",
            providerId,
            scopes
        })

        return NextResponse.json({ rawKey, apiKey })
    } catch (error) {
        console.error("Create Key Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || !session.user || !(session.user as any).id) {
            return new NextResponse("Unauthorized", { status: 401 })
        }
        const userId = (session.user as any).id

        const keys = await listApiKeys(userId)
        return NextResponse.json(keys)
    } catch (error) {
        console.error("List Keys Error:", error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
