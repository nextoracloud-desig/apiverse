import { prisma } from "@/lib/prisma"
import fs from "fs"
import path from "path"
import { normalizeApiData } from "@/scripts/helpers/normalize"

// Configuration Interface
export interface ImportConfig {
    batchSize?: number;
    dryRun?: boolean;
    force?: boolean;
    allowProd?: boolean;
    source?: 'local' | 'network'; // Force local
}

interface ImportStats {
    total: number;
    success: number;
    failed: number;
    skipped: number;
    startTime: number;
    errors: string[];
}

export async function runImport(config: ImportConfig) {
    const stats: ImportStats = {
        total: 0,
        success: 0,
        failed: 0,
        skipped: 0,
        startTime: Date.now(),
        errors: []
    };

    console.log("------------------------------------------");
    console.log("API IMPORT ENGINE STARTED");
    console.log("Config:", JSON.stringify(config));

    // 1. Env Check
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL is missing.");
    }

    // 2. Production Guard
    const isProd = !process.env.DATABASE_URL.includes("localhost") && !process.env.DATABASE_URL.includes("127.0.0.1");
    if (isProd && !config.allowProd && !config.dryRun) {
        throw new Error("PRODUCTION PROTECTION: DATABASE_URL is remote. Use allowProd=true to write.");
    }

    // 3. Load Data (Strict Path Resolution)
    const dataDir1 = path.resolve(process.cwd(), 'data');
    const dataDir2 = path.resolve(__dirname, '..', '..', 'data'); // fallback if running from deeply nested lib

    let validDataDir = null;
    if (fs.existsSync(dataDir1)) validDataDir = dataDir1;
    else if (fs.existsSync(dataDir2)) validDataDir = dataDir2;

    if (!validDataDir) {
        console.error("CWD:", process.cwd());
        try { console.error("Listing CWD:", fs.readdirSync(process.cwd()).join(', ')); } catch { }
        throw new Error("CRITICAL: 'data' directory not found.");
    }

    console.log(`Using Data Dir: ${validDataDir}`);

    const files = ['apiverse_providers_1.json', 'apiverse_providers_2.json'];
    let allData: any[] = [];

    for (const f of files) {
        const filePath = path.join(validDataDir, f);
        if (fs.existsSync(filePath)) {
            try {
                const raw = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (Array.isArray(raw)) {
                    allData = allData.concat(raw);
                    console.log(`Loaded ${raw.length} items from ${f}`);
                }
            } catch (e: any) {
                stats.errors.push(`File error ${f}: ${e.message}`);
                console.error(`Error reading ${f}:`, e);
            }
        }
    }

    stats.total = allData.length;
    if (stats.total === 0) {
        throw new Error("No items found in dataset files.");
    }

    // 4. Batch Process
    // REMOVED ADAPTER - We map explicitly
    const batchSize = config.batchSize || 50;

    const batches = [];
    for (let i = 0; i < allData.length; i += batchSize) {
        batches.push(allData.slice(i, i + batchSize));
    }

    console.log(`Processing ${stats.total} items in ${batches.length} batches...`);

    for (const batch of batches) {
        try {
            await processBatch(batch, config, stats);
        } catch (e: any) {
            stats.errors.push(`Batch fatal error: ${e.message}`);
        }
    }

    // 5. Global Backfill (Production Safety Net)
    if (config.allowProd) {
        console.log("Starting Global Endpoint Backfill...");
        await backfillAllEndpoints();
    }

    const duration = (Date.now() - stats.startTime) / 1000;
    console.log("------------------------------------------");
    console.log("IMPORT COMPLETED");
    console.log(`Duration: ${duration.toFixed(2)}s`);
    console.log(`Success:  ${stats.success}`);
    console.log(`Failed:   ${stats.failed}`);
    console.log("------------------------------------------");

    return stats;
}

async function processBatch(batch: any[], config: ImportConfig, stats: ImportStats) {
    if (config.dryRun) {
        stats.success += batch.length;
        console.log(`[DRY] Uploaded ${batch.length} items.`);
        return;
    }

    // Helper to sanitize and MAP explicitly to Schema
    const prepare = (item: any) => {
        const clean = normalizeApiData(item);
        if (!clean.id) throw new Error("Missing ID");

        // Explicitly construct only valid Prisma fields
        return {
            id: clean.id,
            name: clean.name,
            baseUrl: clean.baseUrl,
            authType: clean.authType,
            description: clean.description,
            category: clean.category,
            source: clean.source,
            approved: clean.approved,
            docsUrl: clean.docsUrl
        };
    }

    // Try Transaction
    try {
        await prisma.$transaction(
            batch.map(item => {
                const data = prepare(item);
                return prisma.apiProvider.upsert({
                    where: { id: data.id },
                    update: data,
                    create: data
                })
            })
        );

        // ENDPOINT AUTO-INJECTION
        // Post-batch processing to ensure endpoints exist
        for (const item of batch) {
            const clean = normalizeApiData(item);
            if (clean.id) {
                await ensureDefaultEndpoints(clean.id);
            }
        }

        stats.success += batch.length;
        process.stdout.write('.');
    } catch (e: any) {
        console.warn(`\nBatch failed (${e.message.substring(0, 100)}...), retrying items individually.`);

        // Fallback
        for (const item of batch) {
            try {
                const data = prepare(item);
                await prisma.apiProvider.upsert({
                    where: { id: data.id },
                    update: data,
                    create: data
                });

                // ENDPOINT AUTO-INJECTION (Fallback Mode)
                if (data.id) {
                    await ensureDefaultEndpoints(data.id);
                }

                stats.success++;
            } catch (inner: any) {
                stats.failed++;
                console.error(`Row fail ${item.id || 'unknown'}: ${inner.message}`);
            }
        }
    }
}

// Helper: Iterate all providers to ensure endpoints
async function backfillAllEndpoints() {
    try {
        // FIXED: Iterate over 'Api' table as per requirement
        const allIds = await prisma.api.findMany({ select: { id: true } });
        console.log(`Backfilling endpoints for ${allIds.length} APIs (from Api table)...`);

        let count = 0;
        for (const { id } of allIds) {
            await ensureDefaultEndpoints(id);
            count++;
            if (count % 50 === 0) process.stdout.write('+');
        }
        console.log("\nBackfill complete.");
    } catch (e: any) {
        console.error("Backfill failed:", e.message);
    }
}

// ENDPOINT AUTO-INJECTION Helper
async function ensureDefaultEndpoints(apiId: string) {
    try {
        const count = await prisma.apiEndpoint.count({
            where: { apiId }
        });

        if (count === 0) {
            // Default endpoints to insert
            const defaults = [
                {
                    apiId,
                    method: 'GET',
                    path: '/status',
                    summary: 'Check API service status',
                    headers: {},
                    body: {}
                },
                {
                    apiId,
                    method: 'GET',
                    path: '/health',
                    summary: 'Health check endpoint',
                    headers: {},
                    body: {}
                },
                {
                    apiId,
                    method: 'POST',
                    path: '/query',
                    summary: 'Submit a generic API query',
                    headers: { "Content-Type": "application/json" },
                    body: { "query": "example" }
                }
            ];

            await prisma.apiEndpoint.createMany({
                data: defaults
            });
            // console.log(`Injected defaults for ${apiId}`);
        }
    } catch (e) {
        console.warn(`Endpoint injection failed for ${apiId}`, e);
        // non-blocking
    }
}
