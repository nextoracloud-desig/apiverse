import { searchApis, getAllApis } from "@/lib/api-catalog";
import { ApiCard } from "@/components/marketplace/ApiCard";
import { CategoryFilter } from "@/components/marketplace/CategoryFilter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { SlidersHorizontal } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function ExplorePage({ searchParams }: { searchParams: { page?: string, search?: string, category?: string, pricing?: string, sort?: string, stack?: string } }) {
    const page = Number(searchParams.page) || 1;
    const search = searchParams.search || "";
    // If stack is present but no explicit search, use stack as search query context
    const effectiveSearch = search || searchParams.stack || "";
    const category = searchParams.category || "All";
    const pricing = searchParams.pricing || "All";
    const sort = searchParams.sort || "featured";
    const stackPrompt = searchParams.stack || "";

    // Await the async search
    const { data: apis, total, totalPages } = await searchApis({
        search: effectiveSearch,
        category,
        pricing,
        sort,
        page,
        pageSize: 12
    });

    // Handle categories for filter (can be optimized to distinct query later)
    // For now, hardcode generic or fetch distinct
    const categories = ["All", "AI", "DevTools", "Social Media", "Finance", "Weather", "Media", "Travel", "Productivity", "Other"];
    // Or async fetch:
    // const all = await getAllApis();
    // const categoriesSet = new Set(all.map(a => a.category));

    return (
        <div className="space-y-8 pb-12 container py-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Explore APIs</h1>
                    <p className="text-muted-foreground max-w-lg">
                        Discover {total}+ APIs curated for developers.
                        Filter by category, pricing, or confidence score.
                    </p>
                </div>
                <div className="flex flex-col gap-6 w-full md:w-auto">

                    <div className="flex flex-wrap items-center gap-2 w-full">
                        <div className="flex items-center gap-2 mr-2 text-sm text-muted-foreground">
                            <SlidersHorizontal className="h-4 w-4" />
                            <span>Filters:</span>
                        </div>

                        {stackPrompt && (
                            <Link
                                href={`/explore?${new URLSearchParams({ ...searchParams, stack: "", page: "1" }).toString()}`}
                            >
                                <Badge variant="secondary" className="cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors px-3 py-1 flex items-center gap-1">
                                    Stack: {stackPrompt.length > 20 ? stackPrompt.substring(0, 20) + '...' : stackPrompt}
                                    <span className="ml-1">×</span>
                                </Badge>
                            </Link>
                        )}

                        {["All", "Free", "Freemium", "Paid"].map((type) => (
                            <Link
                                key={type}
                                href={`/explore?${new URLSearchParams({ ...searchParams, pricing: type === "All" ? "" : type, page: "1" }).toString()}`}
                            >
                                <Badge
                                    variant={pricing === type || (pricing === "All" && type === "All") ? "default" : "outline"}
                                    className="cursor-pointer hover:bg-primary/20 transition-colors px-3 py-1"
                                >
                                    {type}
                                </Badge>
                            </Link>
                        ))}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-muted-foreground w-full">
                        <span>Sort by:</span>
                        {[
                            { label: "Featured", value: "featured" },
                            { label: "High Confidence", value: "confidence" },
                            { label: "Rating", value: "rating" },
                            { label: "Newest", value: "newest" },
                        ].map((opt) => (
                            <Link
                                key={opt.value}
                                href={`/explore?${new URLSearchParams({ ...searchParams, sort: opt.value, page: "1" }).toString()}`}
                                className={`hover:text-primary transition-colors ${sort === opt.value ? "font-bold text-primary underline" : ""}`}
                            >
                                {opt.label}
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="py-8">
                <CategoryFilter categories={categories} />
            </div>

            <div className="grid grid-cols-1 gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {apis.map((api) => (
                    <ApiCard
                        key={api.id}
                        id={api.id}
                        name={api.name}
                        description={api.shortDescription}
                        category={api.category}
                        rating={api.rating ?? 0}
                        pricing={api.pricingType}
                        confidenceScore={api.confidenceScore ?? 0}
                        logoUrl={api.logoUrl || undefined}
                        logoSymbol={api.logoInitials || api.logoSymbol} // fallback
                        affiliateUrl={api.affiliateUrl || undefined}
                    />
                ))}
            </div>

            {apis.length === 0 && (
                <div className="text-center py-16 px-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                        <SlidersHorizontal className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold">No APIs found</h3>
                    <p className="text-muted-foreground mt-2 max-w-xs mx-auto">
                        Try adjusting your search terms or filters to find what you're looking for.
                    </p>
                    <Button asChild variant="link" className="mt-4">
                        <Link href="/explore">Clear all filters</Link>
                    </Button>
                </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                    <Button
                        variant="outline"
                        disabled={page <= 1}
                        asChild={page > 1}
                    >
                        {page > 1 ? (
                            <Link href={`/explore?${new URLSearchParams({ ...searchParams, page: String(page - 1) }).toString()}`}>
                                Previous
                            </Link>
                        ) : (
                            <span>Previous</span>
                        )}
                    </Button>
                    <span className="flex items-center px-4 text-sm text-muted-foreground font-medium">
                        Page {page} of {totalPages}
                    </span>
                    <Button
                        variant="outline"
                        disabled={page >= totalPages}
                        asChild={page < totalPages}
                    >
                        {page < totalPages ? (
                            <Link href={`/explore?${new URLSearchParams({ ...searchParams, page: String(page + 1) }).toString()}`}>
                                Next
                            </Link>
                        ) : (
                            <span>Next</span>
                        )}
                    </Button>
                </div>
            )}
        </div>
    );
}
