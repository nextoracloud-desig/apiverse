import { runImport } from "../lib/import-engine";

async function main() {
    const args = process.argv.slice(2);
    const config = {
        dryRun: args.includes('--dry'),
        force: args.includes('--force'),
        allowProd: args.includes('--allow-prod'),
        batchSize: parseInt(args.find(a => a.startsWith('--batch='))?.split('=')[1] || '50')
    };

    try {
        await runImport(config);
        process.exit(0);
    } catch (e) {
        console.error("CLI Import Failed:", e);
        process.exit(1);
    }
}

main();
