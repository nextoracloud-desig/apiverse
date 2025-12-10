import { prisma as db } from "@/lib/prisma"
import { validateApiKey } from "./key-service"

export async function handleGatewayRequest(req: Request, providerId: string, path: string[]) {
    const start = Date.now()
    let apiKeyId: string | undefined
    let responseStatus = 500
    let cost = 0

    try {
        // 1. Validate Auth
        const authHeader = req.headers.get("Authorization")
        if (!authHeader?.startsWith("Apiverse ")) {
            return new Response("Unauthorized: Missing or invalid Authorization header", { status: 401 })
        }

        const rawKey = authHeader.split(" ")[1]
        const { valid, apiKey, error } = await validateApiKey(rawKey)

        if (!valid || !apiKey) {
            return new Response(`Unauthorized: ${error}`, { status: 401 })
        }
        apiKeyId = apiKey.id

        // 2. Validate Provider Access
        // If key is bound to a provider, check it
        if (apiKey.providerId && apiKey.providerId !== providerId) {
            // We should ideally resolve providerId to ID first if it's a slug, 
            // but for now strict check if key is scoped.
            // Only fail if key is scoped and it doesn't match the *request* ID/Slug directly.
            // Ideally we resolve the request provider first.
        }

        // 3. Fetch Provider Config
        const provider = await db.apiProvider.findFirst({
            where: {
                OR: [
                    { id: providerId },
                    { name: { equals: providerId, mode: 'insensitive' } }
                ]
            }
        })

        if (!provider) {
            return new Response("Provider not found", { status: 404 })
        }

        // Now re-check key binding if it exists
        if (apiKey.providerId && apiKey.providerId !== provider.id) {
            return new Response("Forbidden: Key not valid for this provider", { status: 403 })
        }

        // 4. Prepare Proxy Request
        const targetUrl = new URL(provider.baseUrl)
        path.forEach(p => targetUrl.pathname += `/${p}`)

        // Copy query params
        const incomingUrl = new URL(req.url)
        incomingUrl.searchParams.forEach((v, k) => targetUrl.searchParams.append(k, v))

        const headers = new Headers(req.headers)
        headers.delete("Authorization") // Remove Apiverse key
        headers.delete("Host")

        // Inject Provider Auth
        if (provider.authType === "bearer" && provider.authConfig) {
            try {
                const config = JSON.parse(provider.authConfig)
                if (config.token) {
                    headers.set("Authorization", `Bearer ${config.token}`)
                }
            } catch (e) {
                console.error("Invalid auth config", e)
            }
        } else if (provider.authType === "header" && provider.authConfig) {
            try {
                const config = JSON.parse(provider.authConfig)
                if (config.key && config.value) {
                    headers.set(config.key, config.value)
                }
            } catch (e) { }
        }

        // Forward Request
        const fetchOptions: RequestInit = {
            method: req.method,
            headers: headers,
            // body logic handled below for non-GET
        }

        if (req.method !== "GET" && req.method !== "HEAD") {
            try {
                const buffer = await req.clone().arrayBuffer()
                if (buffer.byteLength > 0) {
                    fetchOptions.body = buffer
                }
            } catch (e) { }
        }

        const proxyRes = await fetch(targetUrl.toString(), fetchOptions)
        responseStatus = proxyRes.status

        // 5. Compute Cost (Mock logic for MVP)
        // Assume $0.001 per call
        cost = 0.001

        // 6. Log Usage
        // Capture latency
        // Return Response
        // We need to clone headers to satisfy strict mode
        const resHeaders = new Headers(proxyRes.headers)
        resHeaders.delete("content-encoding")

        // Read body as buffer to pass through
        const resBody = await proxyRes.arrayBuffer()

        return new Response(resBody, {
            status: proxyRes.status,
            headers: resHeaders
        })

    } catch (error: any) {
        console.error("Gateway Error:", error)
        return new Response(`Gateway Error: ${error.message}`, { status: 500 })
    } finally {
        // 7. Async Logging
        if (apiKeyId) {
            const latency = Date.now() - start
            saveUsageLog(apiKeyId, providerId, req.method, req.url, responseStatus, latency, cost).catch(console.error)
        }
    }
}

async function saveUsageLog(apiKeyId: string, providerIdOrName: string, method: string, url: string, status: number, latency: number, cost: number) {
    try {
        const provider = await db.apiProvider.findFirst({
            where: {
                OR: [
                    { id: providerIdOrName },
                    { name: { equals: providerIdOrName, mode: 'insensitive' } }
                ]
            },
            select: { id: true }
        })

        await db.usageLog.create({
            data: {
                apiKeyId,
                providerId: provider?.id,
                method,
                path: url,
                statusCode: status,
                latency,
                cost
            }
        })
    } catch (err) {
        console.error("Failed to log usage", err)
    }
}
