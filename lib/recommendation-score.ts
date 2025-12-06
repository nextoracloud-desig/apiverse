import { Api } from "@prisma/client";
import { RecommendationIntent, CATEGORY_KEYWORDS } from "./intent-map";

export function calculateApiScore(api: Api, intent: RecommendationIntent, userQuery?: string): number {
    let score = 0;

    // 0. Base Score (popularity/dx) - Small baseline
    score += (api.dxScore || 0) * 0.1;
    score += (api.popularityScore || 0) * 0.1;
    score += (api.confidenceScore || 0) * 0.05;

    // 1. Text Relevance (Direct Query Match - High Precision)
    if (userQuery) {
        const queryLower = userQuery.toLowerCase();
        const apiName = api.name.toLowerCase();
        const apiDesc = (api.shortDescription + " " + (api.longDescription || "")).toLowerCase();

        // Check for specific mentions in the user query that match this API
        if (api.slug && queryLower.includes(api.slug.replace(/-/g, ' '))) {
            score += 100;
        } else if (queryLower.includes(apiName)) {
            score += 80;
        }

        // Check if API description matches query words
        const words = queryLower.split(/[\s,.]+/).filter(w => w.length > 3);
        let wordMatches = 0;
        for (const word of words) {
            if (apiName.includes(word) || apiDesc.includes(word) || api.tags.toLowerCase().includes(word)) {
                wordMatches++;
            }
        }
        score += wordMatches * 15;
    }

    // 2. Category / Keyword Matching (Primary Driver)
    if (intent.categories.length > 0) {
        let categoryMatch = false;

        // A. Direct Category Match
        if (intent.categories.includes(api.category)) {
            score += 50;
            categoryMatch = true;
        }

        // B. Intent & Tags Match
        for (const intentCat of intent.categories) {
            if (api.subCategory && intentCat.toLowerCase() === api.subCategory.toLowerCase()) {
                score += 40;
                categoryMatch = true;
            }

            const intentKeywordsForCat = CATEGORY_KEYWORDS[intentCat];
            if (intentKeywordsForCat) {
                const apiTags = api.tags.toLowerCase().split(',').map(t => t.trim());
                const hasTagMatch = apiTags.some(tag => intentKeywordsForCat.some(k => k.includes(tag) || tag.includes(k)));
                if (hasTagMatch) {
                    score += 30;
                    categoryMatch = true;
                }
            }
        }
    }

    // 3. Pricing Match
    if (intent.pricingPreference) {
        if (api.pricingType === intent.pricingPreference) {
            score += 20;
        } else if (intent.pricingPreference === "Free" && api.pricingType === "Paid") {
            score -= 30;
        } else if (intent.pricingPreference === "Free" && api.pricingType === "Freemium") {
            score += 15;
        } else if (intent.pricingPreference === "Paid" && api.pricingType === "Free") {
            score += 5;
        }
    }

    // 4. Region Match
    if (intent.regions && intent.regions.length > 0) {
        if (api.regionSupport) {
            const apiRegions = api.regionSupport.split(',').map(r => r.trim().toLowerCase());
            const userRegions = intent.regions;
            const hasRegionMatch = userRegions.some(r => apiRegions.includes(r.toLowerCase()));
            const isGlobal = apiRegions.includes('global');

            if (hasRegionMatch) {
                score += 25;
            } else if (isGlobal) {
                score += 15;
            } else {
                score -= 10;
            }
        }
    }

    return Math.round(score);
}

export function sortApisByScore(apis: Api[], intent: RecommendationIntent, userQuery?: string): Api[] {
    return apis.map(api => ({
        api,
        score: calculateApiScore(api, intent, userQuery)
    }))
        .sort((a, b) => {
            // Sort by Score DESC
            if (b.score !== a.score) return b.score - a.score;
            // Tie-breaker: Popularity
            return (b.api.popularityScore || 0) - (a.api.popularityScore || 0);
        })
        .filter(item => item.score > 0) // Filter out clearly irrelevant or heavily penalized ones (score <= 0)
        .map(item => item.api);
}
