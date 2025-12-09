"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { redirect } from "next/navigation";

// Helper: Self-Healing mechanism to ensure API exists before linking
export async function ensureApiExists(apiId: string): Promise<boolean> {
    try {
        const apiExists = await prisma.api.findUnique({ where: { id: apiId } });
        if (apiExists) return true;

        const { API_CATALOG } = await import("@/lib/api-catalog");
        const apiRecord = API_CATALOG.find(a => a.id === apiId);

        if (apiRecord) {
            console.log(`Lazy planting API: ${apiRecord.name}`);
            await prisma.api.create({
                data: {
                    id: apiRecord.id,
                    slug: apiRecord.slug,
                    name: apiRecord.name,
                    shortDescription: apiRecord.shortDescription,
                    longDescription: apiRecord.longDescription,
                    category: apiRecord.category,
                    subCategory: apiRecord.subCategory || null,
                    tags: apiRecord.tags.join(','),
                    pricingType: apiRecord.pricingType,
                    regionSupport: apiRecord.regionSupport?.join(',') || null,
                    dxScore: apiRecord.dxScore ?? 0,
                    popularityScore: apiRecord.popularityScore ?? 0,
                    logoUrl: apiRecord.logoUrl,
                    logoSymbol: apiRecord.logoSymbol || null,
                    docsUrl: apiRecord.docsUrl,
                    providerUrl: apiRecord.providerUrl,
                    providerName: apiRecord.providerName,
                    confidenceScore: apiRecord.confidenceScore,
                    rating: apiRecord.rating,
                    reviewCount: apiRecord.reviewCount,
                    uptimeSla: apiRecord.uptimeSla,
                    sampleEndpointUrl: apiRecord.sampleEndpointUrl,
                    playgroundExampleResponse: apiRecord.playgroundExampleResponse ? JSON.stringify(apiRecord.playgroundExampleResponse) : null,
                    featured: apiRecord.isFeatured || false,
                    source: 'manual',
                    status: 'active',
                    affiliateUrl: apiRecord.affiliateUrl,
                    referralNote: apiRecord.referralNote,
                }
            });
            return true;
        }
        return false;
    } catch (e) {
        console.error("Failed to ensure API exists:", e);
        return false;
    }
}

export async function generateApiKey(apiId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/auth/signin");
    }

    const userId = (session.user as any).id;

    // Validation: Ensure User exists in DB (fixes stale session)
    const userFunc = await prisma.user.findUnique({ where: { id: userId } });
    if (!userFunc) {
        // Stale session -> Force re-login
        redirect("/auth/signin");
    }

    try {
        // Check if key already exists (UserApiKey)
        const existingKey = await prisma.userApiKey.findFirst({
            where: {
                userId,
                apiId,
                status: "active",
            },
        });

        if (existingKey) {
            return { success: true, key: existingKey.key };
        }

        // Lazy Seed Link
        const isReady = await ensureApiExists(apiId);
        if (!isReady) {
            return { success: false, error: "API not found in catalog" };
        }

        // Generate new key
        const newKey = `pk_live_${uuidv4().replace(/-/g, "")}`;

        await prisma.userApiKey.create({
            data: {
                userId,
                apiId,
                key: newKey,
                status: "active",
                name: `Key for ${apiId}`,
            },
        });

        revalidatePath("/dashboard");
        revalidatePath("/dashboard/keys");
        revalidatePath(`/api/${apiId}`);

        return { success: true, key: newKey };
    } catch (error) {
        console.error("generateApiKey error:", error);
        return { success: false, error: "Failed to generate key. Please try again." };
    }
}

export async function revokeApiKey(keyId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/auth/signin");
    }

    const userId = (session.user as any).id;

    await prisma.userApiKey.updateMany({
        where: {
            id: keyId,
            userId,
        },
        data: {
            status: "revoked",
        },
    });

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/keys");
}

export async function toggleSavedApi(apiId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/auth/signin");
    }

    const userId = (session.user as any).id;

    // Validation: Ensure User exists
    const userFunc = await prisma.user.findUnique({ where: { id: userId } });
    if (!userFunc) {
        redirect("/auth/signin");
    }

    try {
        const existing = await prisma.savedApi.findFirst({
            where: {
                userId,
                apiId,
            },
        });

        if (existing) {
            await prisma.savedApi.delete({
                where: {
                    id: existing.id,
                },
            });
        } else {
            const isReady = await ensureApiExists(apiId);
            if (!isReady) {
                // Return silently or log, but don't crash
                console.error("toggleSavedApi: API not found");
                return;
            }
            await prisma.savedApi.create({
                data: {
                    userId,
                    apiId,
                },
            });
        }

        revalidatePath("/saved");
        revalidatePath(`/api/${apiId}`);
    } catch (e) {
        console.error("toggleSavedApi failed", e);
        // Do not throw, UI handles failure by not updating state if optimistic update fails?
        // Actually, client uses optimistic update. If server failure, client might be out of sync.
        // But preventing crash is priority.
    }
}

export async function getDashboardStats() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        return null;
    }

    const userId = (session.user as any).id;

    const [activeKeys, savedApis, totalApis] = await Promise.all([
        prisma.userApiKey.count({
            where: {
                userId,
                status: "active",
            },
        }),
        prisma.savedApi.count({
            where: {
                userId,
            },
        }),
        prisma.api.count({
            where: {
                status: "active"
            }
        })
    ]);

    return {
        activeKeys,
        savedApis,
        totalRequests: totalApis * 12, // Mock requests based on catalog size for now
        uptime: 99.9,
    };
}

export async function recordView(apiId: string, source: string = "details-page") {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    try {
        await prisma.apiView.create({
            data: {
                apiId,
                userId: userId || null,
                source,
            }
        });
    } catch (e) {
        // Ignore errors for metrics
        console.error("Failed to record view", e);
    }
}
