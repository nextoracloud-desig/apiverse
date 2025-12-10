import { importPublicApis } from "@/lib/importer"
import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(req: Request) {
    // Verify Vercel Cron header if needed (CRON_SECRET)
    // Check auth header `authorization: Bearer ${process.env.CRON_SECRET}` if populated

    const result = await importPublicApis()
    return NextResponse.json(result)
}
