import { Star, ArrowRight, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SaveApiButton } from "@/components/marketplace/SaveApiButton";

interface ApiCardProps {
    id: string;
    name: string;
    description: string;
    category: string;
    rating: number;
    pricing: string;
    logoUrl?: string;
    logoSymbol?: string;
    confidenceScore: number;
    affiliateUrl?: string;
}

export function ApiCard({
    id,
    name,
    description,
    category,
    rating,
    pricing,
    logoUrl,
    logoSymbol,
    confidenceScore,
    affiliateUrl,
}: ApiCardProps) {
    return (
        <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur-sm transition-all duration-500 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 hover:-translate-y-1">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            <div className="absolute -inset-px bg-gradient-to-r from-primary/10 to-secondary/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 rounded-xl blur-xl -z-10" />

            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold transition-all duration-500 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground shadow-sm group-hover:shadow-lg group-hover:shadow-primary/20">
                        {logoUrl ? (
                            <img src={logoUrl} alt={name} className="h-8 w-8 object-contain" />
                        ) : (
                            <span>{logoSymbol || name.substring(0, 2).toUpperCase()}</span>
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold leading-none tracking-tight text-lg group-hover:text-primary transition-colors duration-300">
                            {name}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1.5 font-medium px-2 py-0.5 rounded-full bg-muted/50 w-fit">
                            {category}
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {pricing === "Paid" && <Badge variant="default">{pricing}</Badge>}

                    {pricing === "Freemium" && <Badge variant="secondary">{pricing}</Badge>}
                    {pricing === "Free" && <Badge variant="success">{pricing}</Badge>}
                    {affiliateUrl && <Badge variant="outline" className="border-blue-500 text-blue-500">Partner</Badge>}
                    <SaveApiButton apiId={id} />
                </div>
            </CardHeader>

            <CardContent className="pb-2 relative z-10">
                <p className="line-clamp-2 text-sm text-muted-foreground leading-relaxed">
                    {description}
                </p>
                <div className="mt-4 flex items-center gap-4 text-xs font-medium text-muted-foreground">
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                        <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                        <span>{rating.toFixed(1)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                        <span>{confidenceScore}% Score</span>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-4 relative z-10">
                <Button asChild className="w-full gap-2 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground group-hover:shadow-lg group-hover:shadow-primary/20" variant="outline">
                    <Link href={`/api/${id}`}>
                        View Details <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </Link>
                </Button>
            </CardFooter>
        </Card>
    );
}
