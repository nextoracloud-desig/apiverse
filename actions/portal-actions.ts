"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function createPortalKey(apiId: string, projectId?: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        throw new Error("Unauthorized");
    }
    const userId = (session.user as any).id;

    // Verify API exists
    const api = await prisma.api.findUnique({ where: { id: apiId } });
    if (!api) throw new Error("API not found");

    // Generate Key (Simple UUID-like or prefix)
    const key = `pk_live_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

    const newKey = await prisma.portalKey.create({
        data: {
            userId,
            apiId,
            projectId,
            key,
            status: "active",
        }
    });

    revalidatePath("/keys");
    revalidatePath(`/api/${apiId}`);
    return newKey;
}

export async function getPortalKeys() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return [];
    const userId = (session.user as any).id;

    return await prisma.portalKey.findMany({
        where: { userId },
        include: { api: true, project: true },
        orderBy: { createdAt: "desc" }
    });
}

export async function createProject(name: string, description?: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");
    const userId = (session.user as any).id;

    const project = await prisma.project.create({
        data: {
            name,
            description,
            ownerId: userId
        }
    });

    revalidatePath("/keys");
    return project;
}

export async function getApiLockInScore(apiId: string) {
    const score = await prisma.apiLockInScore.findUnique({
        where: { apiId }
    });
    return score;
}

export async function regeneratePortalKey(keyId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    // Verify ownership
    const existing = await prisma.portalKey.findUnique({ where: { id: keyId } });
    if (!existing || existing.userId !== (session.user as any).id) {
        throw new Error("Key not found or unauthorized");
    }

    const newKeyString = `pk_live_${Math.random().toString(36).substring(2, 15)}_${Date.now()}`;

    await prisma.portalKey.update({
        where: { id: keyId },
        data: { key: newKeyString }
    });

    revalidatePath("/keys");
    return newKeyString;
}

export async function revokePortalKey(keyId: string) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) throw new Error("Unauthorized");

    const existing = await prisma.portalKey.findUnique({ where: { id: keyId } });
    if (!existing || existing.userId !== (session.user as any).id) {
        throw new Error("Key not found or unauthorized");
    }

    await prisma.portalKey.update({
        where: { id: keyId },
        data: { status: "revoked" }
    });
    revalidatePath("/keys");
}

