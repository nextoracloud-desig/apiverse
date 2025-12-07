"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";

interface SaveApiButtonProps {
    apiId: string;
    initialSaved?: boolean;
    className?: string;
    variant?: "default" | "outline" | "ghost" | "icon";
}

export function SaveApiButton({ apiId, initialSaved = false, className, variant = "outline" }: SaveApiButtonProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [isSaved, setIsSaved] = useState(initialSaved);
    const [isLoading, setIsLoading] = useState(false);

    const handleToggle = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();

        if (!session) {
            router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.pathname)}`);
            return;
        }

        setIsLoading(true);

        try {
            const res = await fetch("/api/saved", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiId }),
            });

            if (res.ok) {
                const data = await res.json();
                setIsSaved(data.saved);
                router.refresh(); // Refresh server components to reflect state
            }
        } catch (error) {
            console.error("Failed to toggle save", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Button
            variant={variant === "icon" ? "ghost" : variant}
            size={variant === "icon" ? "icon" : "default"}
            className={cn("transition-colors", className, isSaved && "text-red-500 hover:text-red-600")}
            onClick={handleToggle}
            disabled={isLoading}
        >
            <Heart className={cn("h-4 w-4", isSaved && "fill-current")} />
            {variant !== "icon" && (isSaved ? "Saved" : "Save")}
        </Button>
    );
}
