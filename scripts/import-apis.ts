import { importPublicApis } from "../lib/importer"

// Simple wrapper to run import
async function main() {
    await importPublicApis()
}

main().catch(console.error)
