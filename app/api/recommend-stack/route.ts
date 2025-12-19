import { NextResponse } from "next/server";
import { searchApis } from "@/lib/api-catalog";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { description } = body;

        if (!description) {
            return new NextResponse("Description required", { status: 400 });
        }

        // Simple keyword-based recommendation logic for "Smart" Assistant
        // In a real app, this would use an LLM or vector search.
        // For now, we search the catalog using terms from the description.

        const terms = description.split(' ').filter((w: string) => w.length > 4);
        const uniqueTerms = Array.from(new Set(terms));

        // Get top results for each term
        let recommendations: any[] = [];
        const seenIds = new Set();

        const catalogResults = (await searchApis({ search: description, pageSize: 5 })).data;

        catalogResults.forEach(api => {
            if (!seenIds.has(api.id)) {
                seenIds.add(api.id);
                recommendations.push({
                    role: "Recommended",
                    api: api
                });
            }
        });

        // Fallback if no direct matches
        if (recommendations.length === 0) {
            const popular = (await searchApis({ sort: "popularity", pageSize: 3 })).data;
            popular.forEach(api => {
                recommendations.push({
                    role: "Popular Choice",
                    api: api
                });
            });
        }

        return NextResponse.json({ recommendations: recommendations.slice(0, 3) });
    } catch (error) {
        console.error("Recommendation error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
