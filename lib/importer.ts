import { prisma as db } from "@/lib/prisma"

interface ImportedApi {
    API: string
    Description: string
    Auth: string
    HTTPS: boolean
    Cors: string
    Link: string
    Category: string
}

export async function importPublicApis() {
    console.log("Starting API Import...")
    try {
        let entries: ImportedApi[] = []

        try {
            const response = await fetch("https://api.publicapis.org/entries")
            if (response.ok) {
                const data = await response.json()
                entries = data.entries || []
            } else {
                throw new Error("Response not ok")
            }
        } catch (e) {
            console.warn("Failed to fetch publicapis.org, using mock data for demo.")
            entries = [
                { API: "Cat Facts", Description: "Daily cat facts", Auth: "", HTTPS: true, Cors: "yes", Link: "https://catfact.ninja/", Category: "Animals" },
                { API: "CoinDesk", Description: "Bitcoin Price Index", Auth: "", HTTPS: true, Cors: "yes", Link: "https://api.coindesk.com/v1/bpi/currentprice.json", Category: "Cryptocurrency" },
                { API: "JSONPlaceholder", Description: "Free fake API for testing", Auth: "", HTTPS: true, Cors: "yes", Link: "https://jsonplaceholder.typicode.com", Category: "Development" }
            ]
        }

        let count = 0
        for (const entry of entries) {
            // Normalize
            const name = entry.API
            const baseUrl = entry.Link
            const description = entry.Description
            const category = entry.Category

            // Upsert
            // We use findFirst to check existence by name or baseUrl
            const existing = await db.apiProvider.findFirst({
                where: {
                    OR: [
                        { name: { equals: name, mode: 'insensitive' } },
                        { baseUrl: { equals: baseUrl } }
                    ]
                }
            })

            if (!existing) {
                await db.apiProvider.create({
                    data: {
                        name,
                        baseUrl,
                        description,
                        category,
                        authType: entry.Auth ? "header" : "none", // Simplification
                        approved: false, // Draft
                        source: "auto-import"
                    }
                })
                count++
            }
        }
        console.log(`Imported ${count} new APIs.`)
        return { success: true, count }
    } catch (error) {
        console.error("Import Error:", error)
        return { success: false, error }
    }
}
