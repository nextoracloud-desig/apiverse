"use client";

import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { toggleSavedApi } from "@/actions/api-actions";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

interface SaveApiButtonProps {
    apiId: string;
    initialIsSaved?: boolean;
    className?: string;
}

export function SaveApiButton({ apiId, initialIsSaved = false, className }: SaveApiButtonProps) {
    const [isSaved, setIsSaved] = useState(initialIsSaved);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const { data: session } = useSession();

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push("/api/auth/signin");
            return;
        }

        setIsLoading(true);
        // Optimistic update
        setIsSaved(!isSaved);

        try {
            await toggleSavedApi(apiId);
            router.refresh();
        } catch (error) {
            // Revert on error
            setIsSaved(isSaved);
            console.error("Failed to toggle save", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            className={cn("h-8 w-8 hover:bg-transparent", className)}
            onClick={handleToggle}
            disabled={isLoading}
        >
            <Heart
                className={cn(
                    "h-5 w-5 transition-all duration-300",
                    isSaved ? "fill-red-500 text-red-500 scale-110" : "text-muted-foreground hover:text-red-500"
                )}
            />
            <span className="sr-only">Save API</span>
        </Button>
    );
}
