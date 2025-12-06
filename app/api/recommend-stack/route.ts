import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { extractIntent } from "@/lib/intent-map";
import { sortApisByScore } from "@/lib/recommendation-score";

export async function POST(req: Request) {
    try {
        const { description } = await req.json();

        if (!description) {
            return NextResponse.json({ error: "Description is required" }, { status: 400 });
        }

        // 1. Extract Intent
        const intent = extractIntent(description);
        console.log("Extracted Intent:", intent);

        // 2. Query Candidates
        // If categories found, query those. Else query broader set (or all active if dataset small)
        // For performance on large sets, filter by category OR tags containing keywords.
        // For this demo with <1000 APIs, fetching "active" APIs is fine, or filtering by category matches.

        // 2. Query Candidates
        // Fetch all active APIs to ensure we catch specific name mentions (e.g. "Stripe") 
        // even if the category intent was ambiguous. 
        // Scoring logic will filter out irrelevant ones.
        const candidateApis = await prisma.api.findMany({
            where: { status: "active" }
        });

        // 3. Score and Sort
        const sortedApis = sortApisByScore(candidateApis, intent, description);

        // LOGGING: Save Analysis Event
        try {
            const session = await getServerSession(authOptions);
            const userId = (session?.user as any)?.id;

            await prisma.recommendationEvent.create({
                data: {
                    userId,
                    description,
                    primaryCategory: intent.categories[0] || "General",
                    region: intent.regions?.[0] || null,
                }
            });
        } catch (logError) {
            console.error("Failed to log recommendation event:", logError);
            // Non-blocking, continue
        }

        // 4. Format for Response
        // Group by Role/Category for the UI "Smart Assistant" to look nice
        // Top 5-6
        const topApis = sortedApis.slice(0, 6);

        const recommendations = topApis.map(api => ({
            role: api.category, // Or subCategory or Intent role
            api: api
        }));

        // Fallback: If no matches (score too low? or empty candidates), just give top 3 random popular ones
        if (recommendations.length === 0) {
            const popularParams = await prisma.api.findMany({
                take: 3,
                orderBy: { rating: "desc" },
                where: { status: "active" }
            });
            // We need to re-map this to the expected format, pushing to the array ref won't work if it's a const map result
            // So return new array
            return NextResponse.json({
                recommendations: popularParams.map(api => ({ role: "Recommended", api }))
            });
        }

        return NextResponse.json({ recommendations });



        return NextResponse.json({ recommendations });

    } catch (error) {
        console.error("Recommendation error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
