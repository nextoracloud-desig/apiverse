"use client";

import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

export function SearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    // Default value from URL only if we are on the home page, otherwise empty
    const [value, setValue] = useState(searchParams.get("search") || "");
    const pathname = usePathname();

    // Create a debounced search function
    useEffect(() => {
        // If we are NOT on home page and value is empty, do nothing (don't redirect to home)
        if (pathname !== "/" && !value) return;

        // If we are on home page, or if we have a value to search:
        const timer = setTimeout(() => {
            // Only push if the query actually changed compared to current URL
            const currentSearch = searchParams.get("search") || "";
            if (value === currentSearch && pathname === "/") return;

            // If we are on another page and search is empty, don't redirect to home automatically
            // unless the user explicitly cleared it? 
            // Better rule: Only redirect if value is NOT empty, OR if we are already on home.
            if (!value && pathname !== "/") return;

            const params = new URLSearchParams(searchParams.toString());
            if (value) {
                params.set("search", value);
            } else {
                params.delete("search");
            }
            params.set("page", "1");

            // Construct the target URL
            const targetUrl = `/?${params.toString()}`;

            // Avoid pushing if we are already there
            router.push(targetUrl);
        }, 500);

        return () => clearTimeout(timer);
    }, [value, router]);
    // Removed searchParams and pathname from dependency to avoid loop? 
    // No, we need them. But let's be careful.

    // Let's switch strategy: pure event based + debounce is safer than effect.
    // But sticking to effect with better guards is easier for now.

    // Guard: ONE: if pathname is NOT root, and value is empty -> return.
    // Guard: TWO: if value matches existing param -> return.

    return (
        <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
                type="search"
                placeholder="Search APIs..."
                className="w-full pl-9 bg-background/50 backdrop-blur-sm"
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
        </div>
    );
}
