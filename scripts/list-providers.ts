import { prisma } from "../lib/prisma"

async function main() {
    const providers = await prisma.apiProvider.findMany()
    console.log(`Found ${providers.length} providers:`)
    providers.forEach(p => console.log(`- ${p.name} (${p.baseUrl})`))
}

main().catch(console.error)
