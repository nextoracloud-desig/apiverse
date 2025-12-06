export const CATEGORY_KEYWORDS: Record<string, string[]> = {
    // Primary Categories
    "AI": ["ai", "ml", "machine learning", "chatbot", "gpt", "nlp", "vision", "embedding", "generative", "llm", "text generation", "image generation", "openai", "anthropic", "stability", "code generation", "diffusion", "rag", "vector", "language model"],
    "Finance": ["payment", "checkout", "subscription", "stripe", "razorpay", "paypal", "billing", "invoice", "banking", "finance", "money", "card", "wallet", "plaid", "revenue", "tax", "accounting", "credit card", "fintech"],
    "Communication": ["email", "newsletter", "smtp", "transactional", "sendgrid", "mailgun", "postmark", "sms", "otp", "phone", "messaging", "chat", "notification", "twilio", "push", "whatsapp", "telegram", "video", "conferencing", "stream", "webrtc"],
    "Weather": ["weather", "climate", "forecast", "temperature", "rain", "meteo", "meteorology", "humidity", "wind"],
    "Maps": ["map", "location", "geo", "routing", "place", "address", "navigation", "gps", "mapbox", "google maps", "geolocation", "geocoding"],
    "Social Media": ["social", "twitter", "facebook", "discord", "instagram", "linkedin", "post", "feed", "community", "bot", "tiktok", "reddit"],
    "Crypto": ["crypto", "bitcoin", "ethereum", "blockchain", "token", "nft", "wallet", "coin", "web3", "defi", "smart contract", "polygon", "solana"],
    "DevTools": ["hosting", "cloud", "serverless", "git", "deployment", "ci/cd", "monitoring", "logging", "analytics", "vercel", "netlify", "github", "gitlab", "docker", "kubernetes", "ide", "sdk", "api gateway", "observability", "dns", "domain"],
    "Science": ["science", "space", "astronomy", "nasa", "data", "research", "biology", "chemistry", "physics"],
    "Travel": ["travel", "flight", "hotel", "booking", "airbnb", "skyscanner", "trip", "airline", "vacation", "tourism"],
    "Productivity": ["productivity", "note", "task", "project", "collaboration", "slack", "notion", "workspace", "calendar", "scheduling", "office"],
    "Storage": ["storage", "file", "upload", "s3", "blob", "bucket", "database", "db", "sql", "nosql", "postgres", "redis", "mysql", "mongodb", "drive", "records"],
    "Authentication": ["auth", "login", "signup", "user", "identity", "sso", "passwordless", "2fa", "oauth", "jwt", "clerk", "auth0", "supabase", "authentication", "authn", "authz", "permission", "rbac", "keycloak", "okta", "security"]
};

export const PRICING_KEYWORDS: Record<string, string[]> = {
    "Free": ["free", "no cost", "zero cost", "open source", "opensource", "community edition", "free tier"],
    "Paid": ["paid", "premium", "enterprise", "commercial", "business", "pro"],
    "Cheap": ["cheap", "low cost", "budget", "affordable", "startup friendly"]
};

export const REGION_KEYWORDS: Record<string, string[]> = {
    "us": ["us", "usa", "america", "united states", "north america"],
    "eu": ["eu", "europe", "european", "gdpr", "uk", "germany", "france", "london", "berlin", "paris"],
    "india": ["india", "indian", "asia", "mumbai", "delhi", "bangalore"],
    "global": ["global", "worldwide", "international", "everywhere"]
};

export interface RecommendationIntent {
    categories: string[]; // Can contain Category names (e.g. "Finance") or specific keywords (e.g. "Email") if we want granular matching
    pricingPreference?: "Free" | "Freemium" | "Paid" | null;
    regions?: string[];
}

export function extractIntent(prompt: string): RecommendationIntent {
    const promptLower = " " + prompt.toLowerCase() + " "; // Padding for word boundary matching if needed, though includes check is usually fine

    // Extract categories
    // We map keywords back to the KEYS of CATEGORY_KEYWORDS. 
    // e.g. "stripe" -> "Finance"
    // But we might also want to capture "Email" as a concept if it's not a top-level category in the map but logically important. 
    // For now, our CATEGORY_KEYWORDS keys ALIGN with `api.category` values (mostly).
    // "Authentication" might NOT be a `api.category` in catalog (it might be "Security" or "DevTools" or "Identity"), 
    // so we should check `lib/api-catalog.ts`. In catalog, Plaid is "Finance", Notion is "Productivity".
    // We don't have an "Authentication" top level category in the snippet I saw. 
    // If "auth" matches "Authentication", we should probably ensure `calculateApiScore` checks tags too.

    const categories: Set<string> = new Set();

    for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        if (keywords.some(k => promptLower.includes(k.toLowerCase()))) {
            categories.add(category);
        }
    }

    // Extract pricing
    let pricingPreference: "Free" | "Freemium" | "Paid" | null = null;
    // Check "Free" first, then "Cheap", then "Paid"
    if (PRICING_KEYWORDS["Free"].some(k => promptLower.includes(k))) {
        pricingPreference = "Free";
    } else if (PRICING_KEYWORDS["Cheap"].some(k => promptLower.includes(k))) {
        pricingPreference = "Freemium";
    } else if (PRICING_KEYWORDS["Paid"].some(k => promptLower.includes(k))) {
        pricingPreference = "Paid";
    }

    // Extract regions
    const regions: Set<string> = new Set();
    for (const [region, keywords] of Object.entries(REGION_KEYWORDS)) {
        if (keywords.some(k => promptLower.includes(k))) {
            regions.add(region);
        }
    }

    return {
        categories: Array.from(categories),
        pricingPreference,
        regions: regions.size > 0 ? Array.from(regions) : undefined
    };
}
