import { NextResponse } from "next/server";
import { runImport } from "@/lib/import-engine";

export const dynamic = 'force-dynamic';
export const maxDuration = 300; // 5 minutes for Pro/Enterprise, 10s for Hobby (Warning: Hobby might timeout)

export async function GET(request: Request) {
    // Authenticate Admin (Simplified for quick fix/demo, ideally use session check)
    // const session = await getServerSession(authOptions);
    // if (session?.user?.role !== 'admin') return NextResponse.json({error: "Unauthorized"}, {status: 401});

    try {
        const stats = await runImport({
            allowProd: true, // Route assumes it's intentional
            dryRun: false
        });

        return NextResponse.json({ ok: true, stats });
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, error: err.message || err.toString() },
            { status: 500 }
        );
    }
}
