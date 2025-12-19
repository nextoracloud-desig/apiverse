import { PrismaClient } from "@prisma/client"

// Use a singleton pattern for Prisma if reusing in lib functions to avoid connection exhaustion in dev is typical,
// but for now local instantiation or importing from lib/prisma is strict.
// Assuming @/lib/prisma exists (importer.ts used it).
import { prisma } from "@/lib/prisma";

export interface ApiDefinition {
    id: string;
    slug: string; // derived from id if not present
    name: string;
    category: string;
    pricingType: string; // Free, Paid, etc.
    logoInitials: string;
    logoUrl?: string; // from meta or column
    shortDescription: string;
    confidenceScore: number;
    rating: number; // 0-5
    reviewCount: number;
    // ... other fields
    tags: string[];
    isFeatured?: boolean;
    isNew?: boolean;
    providerName?: string;
    description?: string;
    baseUrl?: string;
    docsUrl?: string;
    authType?: string;
    affiliateUrl?: string;
    logoSymbol?: string;
}

// Convert DB Model to UI Model
function mapProviderToDef(p: any): ApiDefinition {
    return {
        id: p.id,
        slug: p.id, // ID is basically the slug
        name: p.name,
        category: p.category || "Other",
        pricingType: "Freemium", // Default for now, or infer from meta/description
        logoInitials: p.name.substring(0, 2).toUpperCase(),
        logoUrl: undefined, // Add logic if needed
        logoSymbol: p.name.substring(0, 2).toUpperCase(),
        shortDescription: p.description ? p.description.substring(0, 120) + (p.description.length > 120 ? "..." : "") : "No description",
        longDescription: p.description || "",
        confidenceScore: 90, // default or calculate
        rating: 4.5, // default
        reviewCount: 10,
        tags: [p.category?.toLowerCase() || "api"],
        isFeatured: false,
        isNew: false,
        providerName: p.name,
        description: p.description,
        baseUrl: p.baseUrl,
        docsUrl: p.docsUrl,
        authType: p.authType,
        affiliateUrl: undefined
    };
}

export type SearchParams = {
    search?: string;
    category?: string;
    pricing?: string;
    sort?: string;
    page?: number;
    pageSize?: number;
    stack?: string; // Added stack support
}

export async function searchApis(params: SearchParams) {
    const {
        search = "",
        category = "All",
        pricing = "All",
        sort = "featured",
        page = 1,
        pageSize = 12
    } = params;

    // Build Where Input
    const where: any = {
        approved: true // Only show approved/imported
    };

    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } }
        ];
    }

    if (category && category !== "All") {
        where.category = { equals: category, mode: 'insensitive' }; // loosen
    }

    // Pricing filter is tricky if we don't have pricing column. 
    // Determine from meta or skip for now.
    // if (pricing && pricing !== "All") ...

    // Sort
    const orderBy: any = {};
    if (sort === 'newest') orderBy.createdAt = 'desc';
    else if (sort === 'name') orderBy.name = 'asc';
    else orderBy.updatedAt = 'desc'; // default featured-ish

    const [count, providers] = await Promise.all([
        prisma.apiProvider.count({ where }),
        prisma.apiProvider.findMany({
            where,
            orderBy,
            skip: (page - 1) * pageSize,
            take: pageSize
        })
    ]);

    return {
        data: providers.map(mapProviderToDef),
        total: count,
        totalPages: Math.ceil(count / pageSize)
    };
}

export async function getAllApis(): Promise<ApiDefinition[]> {
    const providers = await prisma.apiProvider.findMany({
        where: { approved: true },
        take: 100 // limit for valid GetAll usage
    });
    return providers.map(mapProviderToDef);
}

export async function getApiById(id: string) {
    const p = await prisma.apiProvider.findUnique({ where: { id } });
    return p ? mapProviderToDef(p) : undefined;
}
