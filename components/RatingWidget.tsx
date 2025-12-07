"use client";

import { useState, useEffect } from "react";
import { Star, ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface RatingWidgetProps {
    apiId: string;
    initialRating?: number;
    userReview?: {
        rating: number;
        badge?: string | null;
        comment?: string | null;
    } | null;
}

export function RatingWidget({ apiId, initialRating = 0, userReview }: RatingWidgetProps) {
    const { data: session } = useSession();
    const router = useRouter();
    const [rating, setRating] = useState(userReview?.rating || 0);
    const [badge, setBadge] = useState<string | null>(userReview?.badge || null);
    const [comment, setComment] = useState(userReview?.comment || "");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(!!userReview);

    // Sync state if userReview changes (e.g. after router.refresh())
    useEffect(() => {
        if (userReview) {
            setRating(userReview.rating || 0);
            setBadge(userReview.badge || null);
            setComment(userReview.comment || "");
            setSubmitted(true);
        }
    }, [userReview]);

    const handleVote = async () => {
        if (!session) {
            router.push(`/auth/signin?callbackUrl=/api/${apiId}`);
            return;
        }

        setSubmitting(true);
        try {
            const res = await fetch("/api/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ apiId, rating, badge, comment }),
            });

            if (res.ok) {
                setSubmitted(true);
                router.refresh(); // Update the server component to reflect new averages
            }
        } catch (e) {
            console.error(e);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="rounded-lg border bg-card p-6 shadow-sm space-y-4">
            <h3 className="font-semibold text-lg">Rate this API</h3>

            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        className={cn(
                            "hover:scale-110 transition-transform p-1",
                            star <= rating ? "text-amber-500 fill-amber-500" : "text-muted-foreground"
                        )}
                        aria-label={`Rate ${star} stars`}
                    >
                        <Star className={cn("h-6 w-6", star <= rating && "fill-current")} />
                    </button>
                ))}
            </div>

            <div className="flex gap-2 flex-wrap">
                <BadgeButton
                    label="Working"
                    icon={<CheckCircle className="h-3 w-3" />}
                    active={badge === "Working"}
                    onClick={() => setBadge("Working")}
                    color="bg-emerald-500/10 text-emerald-600 border-emerald-200"
                />
                <BadgeButton
                    label="Recommended"
                    icon={<ThumbsUp className="h-3 w-3" />}
                    active={badge === "Recommended"}
                    onClick={() => setBadge("Recommended")}
                    color="bg-blue-500/10 text-blue-600 border-blue-200"
                />
                <BadgeButton
                    label="Broken"
                    icon={<AlertTriangle className="h-3 w-3" />}
                    active={badge === "Broken"}
                    onClick={() => setBadge("Broken")}
                    color="bg-red-500/10 text-red-600 border-red-200"
                />
                <BadgeButton
                    label="Scam"
                    icon={<ThumbsDown className="h-3 w-3" />}
                    active={badge === "Scam"}
                    onClick={() => setBadge("Scam")}
                    color="bg-orange-500/10 text-orange-600 border-orange-200"
                />
            </div>

            <Textarea
                placeholder="Share your experience (optional)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="resize-none"
            />

            <Button onClick={handleVote} disabled={submitting || rating === 0}>
                {submitting ? "Submitting..." : (submitted ? "Update Review" : "Submit Review")}
            </Button>
        </div>
    );
}

interface BadgeButtonProps {
    label: string;
    icon: React.ReactNode;
    active: boolean;
    onClick: () => void;
    color: string;
}

function BadgeButton({ label, icon, active, onClick, color }: BadgeButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={cn(
                "flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border transition-colors",
                active ? color : "bg-transparent border-input text-muted-foreground hover:bg-accent"
            )}
        >
            {icon}
            {label}
        </button>
    );
}
