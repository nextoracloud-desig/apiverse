"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRouter, useSearchParams } from "next/navigation";

interface CategoryFilterProps {
    categories: string[];
}

export function CategoryFilter({ categories }: CategoryFilterProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selectedCategory = searchParams.get("category") || "All";

    const handleSelect = (category: string) => {
        const params = new URLSearchParams(searchParams.toString());
        if (category === "All") {
            params.delete("category");
        } else {
            params.set("category", category);
        }
        params.set("page", "1"); // Reset page on filter change
        router.push(`/?${params.toString()}`);
    };

    return (
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide">
            {categories.map((category) => (
                <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "outline"}
                    className={cn(
                        "rounded-full whitespace-nowrap transition-all",
                        selectedCategory === category
                            ? "bg-primary text-primary-foreground shadow-md"
                            : "bg-background/50 hover:bg-background/80"
                    )}
                    onClick={() => handleSelect(category)}
                >
                    {category}
                </Button>
            ))}
        </div>
    );
}
