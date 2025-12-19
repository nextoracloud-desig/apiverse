import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"
import { normalizeApiData } from "@/scripts/helpers/normalize"
import { SchemaAdapter } from "@/scripts/helpers/schema-adapter"

const prisma = new PrismaClient()

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
        console.error("Checked:", dataDir1, dataDir2);
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
        } else {
            console.warn(`File missing: ${f} in ${validDataDir}`);
        }
    }

    stats.total = allData.length;
    if (stats.total === 0) {
        throw new Error("No items found in dataset files.");
    }

    // 4. Batch Process
    const adapter = new SchemaAdapter('ApiProvider');
    const batchSize = config.batchSize || 50;

    const batches = [];
    for (let i = 0; i < allData.length; i += batchSize) {
        batches.push(allData.slice(i, i + batchSize));
    }

    console.log(`Processing ${stats.total} items in ${batches.length} batches...`);

    for (const batch of batches) {
        try {
            await processBatch(batch, adapter, config, stats);
        } catch (e: any) {
            stats.errors.push(`Batch fatal error: ${e.message}`);
        }
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

async function processBatch(batch: any[], adapter: SchemaAdapter, config: ImportConfig, stats: ImportStats) {
    if (config.dryRun) {
        stats.success += batch.length;
        console.log(`[DRY] Uploaded ${batch.length} items.`);
        return;
    }

    // Helper to sanitize
    const sanitize = (item: any) => {
        const clean = normalizeApiData(item);
        const filtered = adapter.filter(clean);
        // Explicit drops
        delete filtered.tenantId;
        delete filtered.ownerId;
        delete filtered.createdById;
        delete filtered.sampleEndpoint;
        delete filtered.subcategories;
        return filtered;
    }

    // We use sequential row-by-row for maximum safety and detailed error reporting
    // defaulting to row-by-row logic immediately as 'fail-safe' is requested
    // Transactional batching is faster but harder to debug individual failures in logs

    // Using prisma transaction for speed, but falling back? 
    // Let's compromise: Promise.allSettled parallel writes? No, connections.
    // Sequential await in loop? Safest.

    // Optimized: Transaction, if fail -> row-by-row
    try {
        await prisma.$transaction(
            batch.map(item => {
                const safe = sanitize(item);
                if (!safe.id) throw new Error("Missing ID");
                return prisma.apiProvider.upsert({
                    where: { id: safe.id },
                    update: safe,
                    create: safe as any
                })
            })
        );
        stats.success += batch.length;
        process.stdout.write('.');
    } catch (e: any) {
        console.warn(`Batch failed (${e.message.substring(0, 50)}...), retrying items individually.`);
        // Fallback
        for (const item of batch) {
            try {
                const safe = sanitize(item);
                if (!safe.id) { stats.skipped++; continue; }

                await prisma.apiProvider.upsert({
                    where: { id: safe.id },
                    update: safe,
                    create: safe as any
                });
                stats.success++;
            } catch (inner: any) {
                stats.failed++;
                // error logging
                // console.error(`Row fail ${item.id}: ${inner.message}`); 
            }
        }
    }
}
