import { prisma } from "@/lib/prisma";

export type RecommendationResult = {
    role: string;
    api: any; // Using any to avoid complex Prisma type imports for now, but ideally generic
};

export async function getStackRecommendations(description: string): Promise<RecommendationResult[]> {
    if (!description) return [];

    const descLower = description.toLowerCase();
    const recommendations: RecommendationResult[] = [];

    // 1. Auth
    if (descLower.includes("auth") || descLower.includes("login") || descLower.includes("user")) {
        const authApi = await prisma.api.findFirst({
            where: {
                OR: [{ category: "Security" }, { tags: { contains: "Auth" } }]
            },
            orderBy: { rating: "desc" }
        });
        if (authApi) recommendations.push({ role: "Authentication", api: authApi });
    }

    // 2. Database/Storage
    if (descLower.includes("data") || descLower.includes("store") || descLower.includes("file")) {
        const storageApi = await prisma.api.findFirst({
            where: {
                OR: [{ category: "Storage" }, { tags: { contains: "Storage" } }]
            },
            orderBy: { rating: "desc" }
        });
        if (storageApi) recommendations.push({ role: "Storage", api: storageApi });
    }

    // 3. Payments
    if (descLower.includes("pay") || descLower.includes("money") || descLower.includes("subscription")) {
        const payApi = await prisma.api.findFirst({
            where: {
                OR: [{ category: "Finance" }, { tags: { contains: "Payment" } }]
            },
            orderBy: { rating: "desc" }
        });
        if (payApi) recommendations.push({ role: "Payments", api: payApi });
    }

    // 4. Communication
    if (descLower.includes("email") || descLower.includes("sms") || descLower.includes("chat")) {
        const commApi = await prisma.api.findFirst({
            where: {
                OR: [{ category: "Communication" }, { tags: { contains: "Messaging" } }]
            },
            orderBy: { rating: "desc" }
        });
        if (commApi) recommendations.push({ role: "Communication", api: commApi });
    }

    // Fallback moved to caller or kept here? 
    // The requirement says "If recommended APIs length > 0... If 0... fall back".
    // So this function should return what it finds. If it finds nothing, it returns [].
    // The fallback logic (random popular ones) was in the route. 
    // I'll keep it pure here: return matches. 
    // Wait, the route handler had a fallback "If no matches... give top 3".
    // I should PROBABLY include that fallback logic here if I want the dashboard to show something.
    // BUT the prompt says for Explore page: "If recommended APIs length === 0 ... fall back to the normal Explore results".
    // This implies the Explore page wants to know if there were *specific* matches.
    // So I will make this function return *specific* matches only.
    // The Dashboard card might want the *specific* matches too.

    return recommendations;
}
