
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const CATEGORIES = [
    "AI & Machine Learning",
    "Blockchain & Crypto",
    "Business & Enterprise",
    "Communication",
    "Data & Analytics",
    "Development Tools",
    "Financial",
    "Health & Fitness",
    "Media & Images",
    "Maps & Geo",
    "News & Info",
    "Social & Identity",
    "Storage & Cloud",
    "Transportation",
    "Weather",
];

const PRICING_TYPES = ["Free", "Freemium", "Paid", "Trial"];
const VENDORS = ["Google", "Amazon", "Microsoft", "Stripe", "Twilio", "OpenAI", "Meta", "Salesforce", "IBM", "Oracle", "SAP", "Adobe", "Shopify", "HubSpot", "Slack", "Zoom", "Atlassian", "GitHub", "GitLab", "Bitbucket"];

function getRandomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateApi(index: number) {
    const category = getRandomElement(CATEGORIES);
    const provider = getRandomElement(VENDORS);
    const pricing = getRandomElement(PRICING_TYPES);
    const name = `${provider} ${category.split(" ")[0]} API ${index}`;
    const slug = `${provider.toLowerCase()}-${category.toLowerCase().split(" ")[0]}-api-${index}`.replace(/[^a-z0-9-]/g, "");

    return {
        name: name,
        slug: slug,
        shortDescription: `Powerful ${category} API by ${provider} for developers.`,
        longDescription: `This is a comprehensive API provided by ${provider} to solve problems in the ${category} domain. It offers high reliability, great documentation, and easy integration. Perfect for enterprise and startup use cases.`,
        category: category,
        tags: `${category}, ${provider}, REST, V2`,
        pricingType: pricing,
        docsUrl: `https://example.com/docs/${slug}`,
        providerUrl: `https://example.com/provider/${provider.toLowerCase()}`,
        providerName: provider,
        confidenceScore: Math.floor(Math.random() * 50) + 50, // 50-100
        rating: Number((Math.random() * 2 + 3).toFixed(1)), // 3.0 - 5.0
        reviewCount: Math.floor(Math.random() * 1000),
        uptimeSla: "99.9%",
        featured: Math.random() > 0.95, // 5% featured
        source: "generated",
        status: "active",
    };
}

async function main() {
    console.log("Start seeding large catalog...");

    const BATCH_SIZE = 50;
    const TOTAL_APIS = 1000;

    for (let i = 0; i < TOTAL_APIS; i += BATCH_SIZE) {
        const apis = [];
        for (let j = 0; j < BATCH_SIZE; j++) {
            apis.push(generateApi(i + j));
        }

        // Using createMany if DB supports it (SQLite does not for simple relations? It does for single model if no complex nested writes)
        // createMany is supported in SQLite for recent Prisma versions.
        try {
            await prisma.api.createMany({
                data: apis,
            });
            console.log(`Seeded batch ${i} - ${i + BATCH_SIZE}`);
        } catch (e) {
            console.error("Error creating batch", e);
        }
    }

    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
