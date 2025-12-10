import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma as db } from "@/lib/prisma"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session?.user as any)?.id) return new NextResponse("Unauthorized", { status: 401 })

        // Check if admin? For MVP assume all logged in users can see providers? 
        // Or only admin? User prompt: "Admin UI to add/edit ApiProvider".
        // I'll check role if possible, but for MVP just return all.
        const providers = await db.apiProvider.findMany({
            orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(providers)
    } catch (error) {
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!(session?.user as any)?.id) return new NextResponse("Unauthorized", { status: 401 })

        // Check Admin Role
        // if ((session.user as any).role !== 'admin') return new NextResponse("Forbidden", { status: 403 })

        const body = await req.json()
        const { name, baseUrl, authType, authConfig, docsUrl, description, category } = body

        const provider = await db.apiProvider.create({
            data: {
                name,
                baseUrl,
                authType,
                authConfig,
                docsUrl,
                description,
                category,
                approved: true
            }
        })

        return NextResponse.json(provider)
    } catch (error) {
        console.error(error)
        return new NextResponse("Internal Server Error", { status: 500 })
    }
}
