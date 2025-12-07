import { prisma } from "@/lib/prisma";

// Use 'node-fetch' if environment is strictly Node < 18, but assuming Node 18+ global fetch
// If you need types, we can assume them.

async function checkApiHealth(url: string) {
    const start = Date.now();
    try {
        const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(5000) });
        const latency = Date.now() - start;
        return {
            online: res.ok,
            latency,
            status: res.status
        };
    } catch (e) {
        return {
            online: false,
            latency: 0,
            status: 0
        };
    }
}

async function verifyAll() {
    console.log("Starting API Verification...");

    // Process in chunks to avoid memory/connection issues
    const batchSize = 10;
    let skip = 0;

    while (true) {
        const apis = await prisma.api.findMany({
            where: { status: "active" },
            select: { id: true, providerUrl: true, sampleEndpointUrl: true },
            take: batchSize,
            skip: skip,
        });

        if (apis.length === 0) break;

        for (const api of apis) {
            // Prefer sample endpoint for health check, fallback to provider URL
            const targetUrl = api.sampleEndpointUrl || api.providerUrl;

            if (!targetUrl || !targetUrl.startsWith("http")) {
                console.log(`Skipping ${api.id} (Invalid URL)`);
                continue;
            }

            const health = await checkApiHealth(targetUrl);
            console.log(`Checked ${api.id}: Latency=${health.latency}ms, Online=${health.online}`);

            await prisma.api.update({
                where: { id: api.id },
                data: {
                    lastChecked: new Date(),
                    latency: health.latency,
                    verified: health.online,
                    // Simple uptime score adjustment logic
                    uptimeScore: health.online ? { increment: 0.1 } : { decrement: 0.5 },
                    // Cap uptime score logic would be more complex in real app (SMA)
                }
            });
        }

        skip += batchSize;
    }

    console.log("Verification Complete.");
}

// Allow running directly
if (require.main === module) {
    verifyAll()
        .then(() => process.exit(0))
        .catch(e => { console.error(e); process.exit(1); });
}
