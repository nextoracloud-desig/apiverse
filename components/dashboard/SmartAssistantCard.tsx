"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea"; // Assuming we have this, or Input
import { Sparkles, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

export function SmartAssistantCard() {
    const [prompt, setPrompt] = useState("");
    const [loading, setLoading] = useState(false);
    const [recommendations, setRecommendations] = useState<any[] | null>(null);

    const handleSuggest = async () => {
        if (!prompt.trim()) return;
        setLoading(true);
        try {
            const res = await fetch("/api/recommend-stack", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: prompt }),
            });
            const data = await res.json();
            setRecommendations(data.recommendations);
        } catch (error) {
            console.error("Failed to get suggestions", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-8 border-primary/20 bg-primary/5">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" />
                    Smart API Assistant
                </CardTitle>
                <CardDescription>
                    Describe your project and we'll recommend the best API stack for you.
                </CardDescription>
            </CardHeader>
            <CardContent>
                {!recommendations ? (
                    <div className="space-y-4">
                        <textarea
                            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            placeholder="e.g. I'm building a SaaS platform with user authentication, stripe payments, and email notifications..."
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                        <Button onClick={handleSuggest} disabled={loading || !prompt.trim()}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Suggest API Stack
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <p className="text-sm text-muted-foreground">
                                Suggested stack based on your description:
                            </p>
                            <Button variant="ghost" size="sm" onClick={() => setRecommendations(null)}>
                                New Search
                            </Button>
                        </div>

                        {recommendations.length === 0 ? (
                            <p className="text-sm font-medium">No specific matches found. Try describing your project in more detail.</p>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {recommendations.map((item: any, i: number) => (
                                    <div key={i} className="flex flex-col gap-2 rounded-lg border bg-background p-4 shadow-sm">
                                        <div className="flex items-center justify-between">
                                            <Badge variant="outline">{item.role}</Badge>
                                        </div>
                                        <Link href={`/api/${item.api.id}`} className="font-semibold hover:text-primary hover:underline flex items-center gap-1 group">
                                            {item.api.name}
                                            <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                            {item.api.shortDescription}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-end">
                            <Button variant="link" asChild className="p-0 h-auto">
                                <Link href={`/?stack=${encodeURIComponent(prompt)}`}>
                                    View in Explore Page
                                </Link>
                            </Button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
