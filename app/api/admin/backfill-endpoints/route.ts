import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes

export async function GET(request: Request) {
    try {
        // 1. Admin Auth Check
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Uncomment strict role check if needed
        // if ((session.user as any).role !== 'admin') {
        //     return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        // }

        console.log("Starting Manual Endpoint Backfill via Admin Route...");

        // 2. Fetch ALL Api records
        const allApis = await prisma.api.findMany({
            select: { id: true }
        });

        let insertedCount = 0;
        let skippedCount = 0;

        // 3. Iterate and Backfill
        for (const api of allApis) {
            const count = await prisma.apiEndpoint.count({
                where: { apiId: api.id }
            });

            if (count > 0) {
                skippedCount++;
                continue;
            }

            // Insert defaults
            await prisma.apiEndpoint.createMany({
                data: [
                    {
                        apiId: api.id,
                        method: 'GET',
                        path: '/status',
                        summary: 'Check API service status',
                        headers: {},
                        body: {}
                    },
                    {
                        apiId: api.id,
                        method: 'GET',
                        path: '/health',
                        summary: 'Health check endpoint',
                        headers: {},
                        body: {}
                    },
                    {
                        apiId: api.id,
                        method: 'POST',
                        path: '/query',
                        summary: 'Submit a generic API query',
                        headers: { "Content-Type": "application/json" },
                        body: { "query": "example" }
                    }
                ]
            });
            insertedCount++;
        }

        console.log(`Backfill Complete. Total: ${allApis.length}, Inserted: ${insertedCount}, Skipped: ${skippedCount}`);

        return NextResponse.json({
            success: true,
            totalApis: allApis.length,
            insertedCount,
            skippedCount
        });

    } catch (error: any) {
        console.error("Backfill error:", error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
