import fetch from "node-fetch"
import { generateApiKey } from "../lib/key-service"
import { prisma } from "../lib/prisma"

// Mock fetch if needed or use node 18+ (assuming environment supports it or node-fetch is installed)
// Next.js environment usually has global fetch, but standalone script might not.

async function main() {
    const GATEWAY_URL = "http://localhost:3000/api/proxy"
    const PROVIDER_ID = "jsonplaceholder"
    const PATH = "todos/1"

    console.log("Preparing Gateway Test...")

    // 1. Get User and Workspace
    const user = await prisma.user.findFirst()
    if (!user) { console.error("No user found"); return }

    let workspace = await prisma.workspace.findFirst({ where: { ownerId: user.id } })
    if (!workspace) {
        workspace = await prisma.workspace.create({ data: { name: "Test Workspace", ownerId: user.id } })
    }

    // 2. Generate Key
    const { rawKey } = await generateApiKey({
        workspaceId: workspace.id,
        name: "Gateway Test Key"
    })
    console.log("Generated Key:", rawKey)

    console.log(`Testing Gateway: ${GATEWAY_URL}/${PROVIDER_ID}/${PATH}`)

    try {
        const res = await fetch(`${GATEWAY_URL}/${PROVIDER_ID}/${PATH}`, {
            headers: {
                "Authorization": `Apiverse ${rawKey}`
            }
        })

        console.log("Status:", res.status)
        const data = await res.text()
        console.log("Response:", data.substring(0, 100) + "...")

        if (res.status === 200) {
            console.log("Gateway Test: PASSED")
        } else {
            console.error("Gateway Test: FAILED")
        }
    } catch (err) {
        console.error("Gateway Test Connection Failed:", err)
        console.log("Ensure the Next.js server is running on localhost:3000")
    }
}

main()
