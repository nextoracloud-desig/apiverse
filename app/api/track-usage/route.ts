import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { portalKey, apiId, latencyMs, isError } = body;

        if (!portalKey || !apiId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Find the key
        const keyRecord = await prisma.portalKey.findUnique({
            where: { key: portalKey },
        });

        if (!keyRecord || keyRecord.status !== "active") {
            return NextResponse.json({ error: "Invalid or inactive key" }, { status: 401 });
        }

        // Update Usage Metric
        // We aggregate by day for simplicity
        const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD

        // Upsert metric
        // Note: SQLite doesn't support complex upsert logic with increment easily in one go if record doesn't exist?
        // Prisma upsert handles this.

        await prisma.apiUsageMetric.upsert({
            where: {
                portalKeyId_period: {
                    portalKeyId: keyRecord.id,
                    period: today,
                }
            },
            update: {
                requestCount: { increment: 1 },
                errorCount: { increment: isError ? 1 : 0 },
                avgLatencyMs: {
                    set: latencyMs
                }
            },
            create: {
                portalKeyId: keyRecord.id,
                period: today,
                requestCount: 1,
                errorCount: isError ? 1 : 0,
                avgLatencyMs: latencyMs,
            }
        });

        // Trigger Notification if error count is high (Simple Logic)
        if (isError) {
            // Check if errors > 5 today
            const metric = await prisma.apiUsageMetric.findUnique({
                where: {
                    portalKeyId_period: {
                        portalKeyId: keyRecord.id,
                        period: today,
                    }
                }
            });

            if (metric && metric.errorCount === 5) { // Notify on 5th error
                await prisma.notification.create({
                    data: {
                        userId: keyRecord.userId,
                        type: "alert",
                        message: `High error rate detected for API key: ${keyRecord.key.substring(0, 10)}... check your integration.`,
                        read: false,
                    }
                });
            }
        }

        // Update Key last used
        await prisma.portalKey.update({
            where: { id: keyRecord.id },
            data: {
                lastUsedAt: new Date(),
                usageCount: { increment: 1 }
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Track usage error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
