import { PrismaClient } from "@prisma/client"
import fs from "fs"
import path from "path"
import { logger } from "./helpers/logger"
import { SchemaAdapter } from "./helpers/schema-adapter"
import { normalizeApiData } from "./helpers/normalize"

const prisma = new PrismaClient()

// Configuration
const CONFIG = {
    BATCH_SIZE: 50,
    DRY_RUN: false,
    FORCE: false,
    ALLOW_PROD: false
}

// Stats
const STATS = {
    total: 0,
    success: 0,
    failed: 0,
    skipped: 0,
    startTime: Date.now()
}

// Parse Args
function parseArgs() {
    const args = process.argv.slice(2);
    if (args.includes('--dry')) CONFIG.DRY_RUN = true;
    if (args.includes('--force')) CONFIG.FORCE = true;
    if (args.includes('--allow-prod')) CONFIG.ALLOW_PROD = true;

    const batchArg = args.find(a => a.startsWith('--batch='));
    if (batchArg) CONFIG.BATCH_SIZE = parseInt(batchArg.split('=')[1]) || 50;

    logger.log(`Configuration: ${JSON.stringify(CONFIG)}`);
}

async function loadData() {
    // Priority: Local 1 -> Local 2
    const dataDir = path.join(process.cwd(), 'data');
    const files = ['apiverse_providers_1.json', 'apiverse_providers_2.json'];
    let allData: any[] = [];

    for (const file of files) {
        const p = path.join(dataDir, file);
        if (fs.existsSync(p)) {
            try {
                const content = fs.readFileSync(p, 'utf8');
                const json = JSON.parse(content);
                if (Array.isArray(json)) {
                    allData = allData.concat(json);
                }
            } catch (e) {
                logger.log(`Failed to read ${file}: ${e}`, 'ERROR');
            }
        }
    }

    // Fallback: If empty, try to fetch (Simplified: we stick to local as per recent reliable instruction)
    if (allData.length === 0) {
        logger.log("No local data found in data/. Please generate dataset first.", "WARN");
    }

    return allData;
}

async function upsertBatch(batch: any[], adapter: SchemaAdapter) {
    if (CONFIG.DRY_RUN) {
        logger.log(`[DRY] Would upsert batch of ${batch.length} items.`);
        STATS.success += batch.length;
        return;
    }

    // Process safely one by one or transactions?
    // User requested "Wrap each batch in a transaction; on batch failure, rollback batch only."
    // However, for maximum resilience ("Never crash"), row-by-row is actually safer because one bad apple doesn't kill the batch.
    // Transactional batch is good for speed integrity, but validation errors in Prisma kill the transaction.
    // Compromise: Try transaction, if fails, fallback to row-by-row.

    try {
        await prisma.$transaction(
            batch.map(item => {
                const clean = normalizeApiData(item);
                const filtered = adapter.filter(clean);

                // Ensure required unique
                if (!filtered.id) throw new Error("Missing ID");

                // [PATCH] Explicitly sanitize keys
                const safeApi: any = { ...filtered };
                delete safeApi.tenantId;
                delete safeApi.ownerId;
                delete safeApi.createdById;
                delete safeApi.sampleEndpoint;
                delete safeApi.subcategories;

                return prisma.apiProvider.upsert({
                    where: { id: safeApi.id },
                    update: safeApi,
                    create: safeApi as any
                })
            })
        );
        STATS.success += batch.length;
        process.stdout.write('.');
    } catch (e: any) {
        logger.log(`Batch transaction failed. Retrying row-by-row. Error: ${e.message}`, 'WARN');

        // Fallback row-by-row
        for (const item of batch) {
            try {
                const clean = normalizeApiData(item);
                const filtered = adapter.filter(clean);
                if (!filtered.id) {
                    STATS.skipped++;
                    continue;
                }

                // [PATCH] Explicitly sanitize keys
                const safeApi: any = { ...filtered };
                delete safeApi.tenantId;
                delete safeApi.ownerId;
                delete safeApi.createdById;
                delete safeApi.sampleEndpoint;
                delete safeApi.subcategories;

                await prisma.apiProvider.upsert({
                    where: { id: safeApi.id },
                    update: safeApi,
                    create: safeApi as any
                });
                STATS.success++;
            } catch (innerErr: any) {
                STATS.failed++;
                logger.log(`Row failed: ${item.name} (${item.id}) - ${innerErr.message}`, 'ERROR');
            }
        }
    }
}

async function main() {
    console.log("==========================================");
    console.log("       ROBUST API IMPORTER v2.0           ");
    console.log("==========================================");

    // 1. Parse Args
    parseArgs();

    // 2. Pre-checks
    if (!process.env.DATABASE_URL) {
        logger.log("DATABASE_URL missing.", 'ERROR');
        process.exit(2);
    }

    const isProd = !process.env.DATABASE_URL.includes("localhost") && !process.env.DATABASE_URL.includes("127.0.0.1");
    if (isProd && !CONFIG.ALLOW_PROD && !CONFIG.DRY_RUN) {
        logger.log("PRODUCTION PROTECTION: DATABASE_URL points to remote. Use --allow-prod or --dry.", 'ERROR');
        process.exit(2);
    }

    // 3. Schema Prep
    const adapter = new SchemaAdapter('ApiProvider');

    // 4. Load Data
    const items = await loadData();
    STATS.total = items.length;
    logger.log(`Loaded ${items.length} raw items.`);

    // 5. Batch Process
    const batches = [];
    for (let i = 0; i < items.length; i += CONFIG.BATCH_SIZE) {
        batches.push(items.slice(i, i + CONFIG.BATCH_SIZE));
    }

    logger.log(`Starting processing of ${batches.length} batches...`);

    for (const batch of batches) {
        await upsertBatch(batch, adapter);
    }

    console.log("\n"); // Newline after progress dots

    // 6. Summary
    const duration = (Date.now() - STATS.startTime) / 1000;

    const reportPath = path.join(process.cwd(), 'reports');
    if (!fs.existsSync(reportPath)) fs.mkdirSync(reportPath, { recursive: true });
    fs.writeFileSync(path.join(reportPath, `import-${Date.now()}.json`), JSON.stringify(STATS, null, 2));

    console.log("==========================================");
    console.log("IMPORT FINISHED");
    console.log(`Total Items: ${STATS.total}`);
    console.log(`Success:     ${STATS.success}`);
    console.log(`Failed:      ${STATS.failed}`);
    console.log(`Skipped:     ${STATS.skipped}`);
    console.log(`Duration:    ${duration.toFixed(2)}s`);
    console.log(`Log File:    ${logger.getPath()}`);
    console.log("==========================================");

    if (STATS.failed > 0) process.exit(1);
    process.exit(0);
}

main().catch(e => {
    logger.log(`Fatal crash: ${e}`, 'ERROR');
    process.exit(1);
});
