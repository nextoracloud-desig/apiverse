import { handleGatewayRequest } from "@/lib/gateway-service"

export const dynamic = "force-dynamic"
export const runtime = "nodejs" // Prefer nodejs for proxying usually

export async function GET(req: Request, { params }: { params: { providerId: string; path: string[] } }) {
    return handleGatewayRequest(req, params.providerId, params.path || [])
}

export async function POST(req: Request, { params }: { params: { providerId: string; path: string[] } }) {
    return handleGatewayRequest(req, params.providerId, params.path || [])
}

export async function PUT(req: Request, { params }: { params: { providerId: string; path: string[] } }) {
    return handleGatewayRequest(req, params.providerId, params.path || [])
}

export async function DELETE(req: Request, { params }: { params: { providerId: string; path: string[] } }) {
    return handleGatewayRequest(req, params.providerId, params.path || [])
}

export async function PATCH(req: Request, { params }: { params: { providerId: string; path: string[] } }) {
    return handleGatewayRequest(req, params.providerId, params.path || [])
}
