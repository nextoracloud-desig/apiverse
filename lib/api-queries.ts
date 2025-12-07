import { PricingType } from "./api-catalog";

// Local fallback type; keep in sync with api-catalog if needed
type ApiRecord = any;


export interface FilterOptions {
    search?: string;
    category?: string;
    pricingType?: string; // "All" | PricingType
    tags?: string[];
}

export interface PaginationOptions {
    page: number;
    pageSize: number;
}

export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export function filterApis(catalog: ApiRecord[], options: FilterOptions): ApiRecord[] {
    let result = [...catalog];

    // Search filter
    if (options.search) {
        const searchLower = options.search.toLowerCase().trim();
        result = result.filter(api =>
            api.name.toLowerCase().includes(searchLower) ||
            api.shortDescription.toLowerCase().includes(searchLower) ||
            api.longDescription.toLowerCase().includes(searchLower) ||
            api.tags.some((tag: string) => tag.toLowerCase().includes(searchLower)) ||
            api.category.toLowerCase().includes(searchLower)
        );
    }

    // Category filter
    if (options.category && options.category !== "All" && options.category !== "All APIs") {
        result = result.filter(api => api.category === options.category);
    }

    // Pricing filter
    if (options.pricingType && options.pricingType !== "All") {
        result = result.filter(api => api.pricingType === options.pricingType);
    }

    // Tags filter
    if (options.tags && options.tags.length > 0) {
        result = result.filter(api =>
            options.tags!.every(tag => api.tags.includes(tag))
        );
    }

    return result;
}

export function paginateApis(list: ApiRecord[], options: PaginationOptions): PaginatedResult<ApiRecord> {
    const startIndex = (options.page - 1) * options.pageSize;
    const endIndex = startIndex + options.pageSize;
    const data = list.slice(startIndex, endIndex);
    const total = list.length;
    const totalPages = Math.ceil(total / options.pageSize);

    return {
        data,
        total,
        page: options.page,
        pageSize: options.pageSize,
        totalPages
    };
}

export function getFeaturedApis(catalog: ApiRecord[]): ApiRecord[] {
    return catalog.filter(api => api.isFeatured);
}

export function getNewApis(catalog: ApiRecord[]): ApiRecord[] {
    return catalog.filter(api => api.isNew);
}

export function getApiBySlug(catalog: ApiRecord[], slug: string): ApiRecord | undefined {
    return catalog.find(api => api.slug === slug || api.id === slug);
}

export function getApiById(catalog: ApiRecord[], id: string): ApiRecord | undefined {
    return catalog.find(api => api.id === id);
}

export function getAllCategories(catalog: ApiRecord[]): string[] {
    const categories = new Set(catalog.map(api => api.category));
    return Array.from(categories).sort();
}
