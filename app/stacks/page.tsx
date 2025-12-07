"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ApiCard } from "@/components/marketplace/ApiCard";
import { Loader2, Sparkles, Layers } from "lucide-react";

export default function StacksPage() {
    const [query, setQuery] = useState("");
    const [recommendations, setRecommendations] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        try {
            const res = await fetch("/api/recommend-stack", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ description: query }),
            });
            const data = await res.json();
            if (data.recommendations) {
                setRecommendations(data.recommendations);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-12 space-y-12">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <Sparkles className="h-4 w-4" />
                    <span>AI-Powered Stack Builder</span>
                </div>
                <h1 className="text-4xl font-bold tracking-tight">Build Your Perfect Stack</h1>
                <p className="text-muted-foreground text-lg">
                    Describe what you are building, and we'll recommend the best API combination for your project.
                </p>
            </div>

            <Card className="max-w-2xl mx-auto border-2 shadow-lg">
                <CardContent className="p-6">
                    <form onSubmit={handleSearch} className="flex gap-4">
                        <Input
                            placeholder="e.g. A food delivery app with payments and maps..."
                            className="flex-1 text-lg h-12"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <Button type="submit" size="lg" disabled={loading} className="h-12 px-8">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Generate Stack"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {recommendations.length > 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="flex items-center gap-2">
                        <Layers className="h-6 w-6 text-primary" />
                        <h2 className="text-2xl font-bold">Recommended Stack</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendations.map((item: any, i) => (
                            <div key={item.api.id} className="space-y-2">
                                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-1">
                                    {item.role || "Tool"}
                                </div>
                                <ApiCard
                                    id={item.api.id}
                                    name={item.api.name}
                                    description={item.api.shortDescription}
                                    category={item.api.category}
                                    rating={item.api.rating ?? 0}
                                    pricing={item.api.pricingType}
                                    confidenceScore={item.api.confidenceScore ?? 0}
                                    logoUrl={item.api.logoUrl}
                                    logoSymbol={item.api.logoSymbol}
                                    affiliateUrl={item.api.affiliateUrl}
                                />
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-center pt-8">
                        <Button variant="outline" size="lg" onClick={() => setRecommendations([])}>
                            Start Over
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
