import { prisma as db } from "@/lib/prisma"
import { randomBytes, createHash } from "crypto"

export async function generateApiKey({
    workspaceId,
    name,
    providerId,
    scopes = [],
}: {
    workspaceId: string
    name: string
    providerId?: string
    scopes?: string[]
}) {
    const secretRaw = randomBytes(32).toString("hex")
    const hashedSecret = createHash("sha256").update(secretRaw).digest("hex")

    const apiKey = await db.apiKey.create({
        data: {
            workspaceId,
            name,
            providerId,
            hashedSecret,
            scopes: scopes ? JSON.stringify(scopes) : null,
            revoked: false,
        },
    })

    // Return the raw key to the user (only once)
    // Format: {id}.{secret}
    const rawKey = `${apiKey.id}.${secretRaw}`

    return { apiKey, rawKey }
}

export async function validateApiKey(rawKey: string) {
    const [id, secretRaw] = rawKey.split(".")

    if (!id || !secretRaw) {
        return { valid: false, error: "Invalid key format" }
    }

    const apiKey = await db.apiKey.findUnique({
        where: { id },
        include: { provider: true, workspace: true },
    })

    if (!apiKey) {
        return { valid: false, error: "Key not found" }
    }

    if (apiKey.revoked) {
        return { valid: false, error: "Key revoked" }
    }

    const hashedSecret = createHash("sha256").update(secretRaw).digest("hex")

    if (hashedSecret !== apiKey.hashedSecret) {
        return { valid: false, error: "Invalid secret" }
    }

    // Update usage stats (fire and forget, or await if critical)
    // For high throughput, we might use Redis here, but for now strict DB update
    await db.apiKey.update({
        where: { id },
        data: {
            lastUsedAt: new Date(),
            usage: { increment: 1 },
        },
    })

    return { valid: true, apiKey }
}

export async function revokeApiKey(id: string) {
    return db.apiKey.update({
        where: { id },
        data: { revoked: true },
    })
}

export async function rotateApiKey(id: string) {
    const apiKey = await db.apiKey.findUnique({ where: { id } })
    if (!apiKey) throw new Error("Key not found")

    // Simply create a NEW key and revoke the OLD one? 
    // Or update the secret of the existing key?
    // User requirement: "Rotate: create new raw key + rehash"
    // Usually rotation means changing the secret but keeping the ID or replacing the object.
    // If we change secret, the ID stays same.
    // "Rotate: create new raw, mark old revoked." -> This implies creating a NEW distinct key record usually, 
    // OR keeping the same record and updating the hash.
    // If we keep the same record, we can just update `hashedSecret`.
    // BUT the key format is `${id}.${secret}`. If `id` stays same, the prefix is same.
    // If we want to invalidate the old secret, updating `hashedSecret` works.

    const secretRaw = randomBytes(32).toString("hex")
    const hashedSecret = createHash("sha256").update(secretRaw).digest("hex")

    const updatedKey = await db.apiKey.update({
        where: { id },
        data: {
            hashedSecret,
            revoked: false, // Ensure it's active if it was revoked
        },
    })

    const rawKey = `${updatedKey.id}.${secretRaw}`
    return { apiKey: updatedKey, rawKey }
}

export async function listApiKeys(userId: string) {
    const workspaces = await db.workspace.findMany({
        where: { ownerId: userId },
        select: { id: true }
    })

    const workspaceIds = workspaces.map(w => w.id)

    return db.apiKey.findMany({
        where: { workspaceId: { in: workspaceIds }, revoked: false },
        orderBy: { createdAt: 'desc' },
        include: { provider: true }
    })
}
