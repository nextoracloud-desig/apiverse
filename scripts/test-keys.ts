import { generateApiKey, validateApiKey, revokeApiKey, rotateApiKey } from "../lib/key-service"
import { prisma } from "../lib/prisma"

async function main() {
    console.log("Testing Key Lifecycle...")

    // 1. Create Workspace
    const user = await prisma.user.findFirst()
    if (!user) {
        console.error("No user found to test with.")
        return
    }

    let workspace = await prisma.workspace.findFirst({ where: { ownerId: user.id } })
    if (!workspace) {
        workspace = await prisma.workspace.create({
            data: { name: "Test Workspace", ownerId: user.id }
        })
    }

    // 2. Generate Key
    console.log("Generating Key...")
    const { rawKey, apiKey } = await generateApiKey({
        workspaceId: workspace.id,
        name: "Test Key"
    })
    console.log("Generated:", rawKey)

    // 3. Validate Key
    console.log("Validating Key...")
    const validation = await validateApiKey(rawKey)
    if (validation.valid) {
        console.log("Validation: SUCCESS")
    } else {
        console.error("Validation: FAILED", validation.error)
    }

    // 4. Rotate Key
    console.log("Rotating Key...")
    const rotation = await rotateApiKey(apiKey.id)
    console.log("New Key:", rotation.rawKey)

    // Validate old key (should fail)
    const oldValidation = await validateApiKey(rawKey)
    console.log("Old Key Valid?", oldValidation.valid) // Should be false

    // 5. Revoke Key
    console.log("Revoking New Key...")
    await revokeApiKey(rotation.apiKey.id)
    const newValidation = await validateApiKey(rotation.rawKey)
    console.log("New Key Valid?", newValidation.valid) // Should be false
}

main().catch(console.error)
