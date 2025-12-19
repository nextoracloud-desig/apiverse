import { runImport } from "@/lib/import-engine";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
    try {
        const stats = await runImport({
            allowProd: true,
            dryRun: false,
            source: 'local'
        });
        return NextResponse.json({ ok: true, stats });
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, error: err.message || err.toString() },
            { status: 500 }
        );
    }
}
