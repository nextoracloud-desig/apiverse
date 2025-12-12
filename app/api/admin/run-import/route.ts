import { NextResponse } from "next/server";
import { importPublicApis as importer } from "@/lib/importer";

export async function GET() {
    try {
        const data = await importer();
        return NextResponse.json({ ok: true, imported: data });
    } catch (err: any) {
        return NextResponse.json(
            { ok: false, error: err.message || err.toString() },
            { status: 500 }
        );
    }
}
