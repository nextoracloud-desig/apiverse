import { getApiById } from "@/lib/api-catalog";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Globe, BookOpen, Star, ShieldCheck, Zap, ShieldAlert } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { generateApiKey, toggleSavedApi, recordView } from "@/actions/api-actions";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { RatingWidget } from "@/components/RatingWidget";

export default async function ApiDetailsPage({ params }: { params: { id: string } }) {
    const apiDefinition = getApiById(params.id);
    const dbApi = await prisma.api.findUnique({
        where: { id: params.id },
        include: { feedback: { select: { id: true } } }
    });

    if (!apiDefinition && !dbApi) {
        notFound();
    }

    // Merge static definition with dynamic DB stats
    const api = {
        ...apiDefinition,
        ...dbApi,
        // Fallbacks if DB missing
        name: dbApi?.name || apiDefinition?.name || "Unknown API",
        pricingType: dbApi?.pricingType || apiDefinition?.pricingType || "Free",
        isFeatured: dbApi?.featured || apiDefinition?.isFeatured || false,
    };

    // Record view
    recordView(api.id!);

    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;

    let hasKey = false;
    let isSaved = false;
    let apiKey = null;
    let userReview = null;

    if (userId) {
        const keyRecord = await prisma.userApiKey.findFirst({
            where: { userId, apiId: api.id, status: "active" },
        });
        if (keyRecord) {
            hasKey = true;
            apiKey = keyRecord.key;
        }

        const savedRecord = await prisma.savedApi.findFirst({
            where: { userId, apiId: api.id },
        });
        if (savedRecord) {
            isSaved = true;
        }

        userReview = await prisma.apiFeedback.findUnique({
            where: { userId_apiId: { userId, apiId: api.id! } }
        });
    }

    async function handleGetKey() {
        "use server";
        if (!userId) redirect("/api/auth/signin");
        await generateApiKey(api.id!);
    }

    async function handleSave() {
        "use server";
        if (!userId) redirect("/api/auth/signin");
        await toggleSavedApi(api.id!);
    }

    // Helper to safely parse date
    const createdDate = api.createdAt ? new Date(api.createdAt) : new Date(0);
    const isNew = createdDate > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                <div className="flex gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-primary/10 text-2xl font-bold text-primary overflow-hidden">
                        {api.logoUrl ? (
                            <img src={api.logoUrl} alt={api.name} className="h-10 w-10 object-contain" />
                        ) : (
                            <span>{api.logoSymbol}</span>
                        )}
                    </div>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-bold tracking-tight">{api.name}</h1>
                            {api.verified && (
                                <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 flex items-center gap-1">
                                    <CheckCircle className="h-3 w-3" /> Verified
                                </Badge>
                            )}
                            <Badge variant={api.pricingType === "Free" ? "success" : "secondary"}>
                                {api.pricingType}
                            </Badge>
                            {api.isFeatured && <Badge variant="default">Featured</Badge>}
                        </div>
                        <p className="text-muted-foreground max-w-2xl">
                            {api.shortDescription}
                        </p>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2">
                            <div className="flex items-center gap-1">
                                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                <span className="font-medium text-foreground">{(api.rating ?? 0).toFixed(1)}</span>
                                <span>({(api.reviewCount ?? 0).toLocaleString()} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                <span
                                    className={(api.confidenceScore ?? 0) > 80 ? "text-emerald-500" : "text-muted-foreground"}
                                >
                                    {api.confidenceScore ?? 0}% Confidence
                                </span>
                            </div>
                            {(api.latency ?? 0) > 0 && (
                                <div className="flex items-center gap-1">
                                    <Zap className="h-4 w-4 text-yellow-500" />
                                    <span>{api.latency ?? 0}ms</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <form action={handleSave} className="w-full sm:w-auto">
                        <Button variant="outline" type="submit" className="w-full sm:w-auto">
                            {isSaved ? "Saved" : "Save API"}
                        </Button>
                    </form>

                    {api.pricingType === "Free" ? (
                        <form action={handleGetKey} className="w-full sm:w-auto">
                            <Button type="submit" disabled={hasKey} variant="default" className={`w-full sm:w-auto ${hasKey ? "" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
                                {hasKey ? "Key Active" : "Activate & Use"}
                            </Button>
                        </form>
                    ) : (
                        <Button asChild variant="default" className="w-full sm:w-auto">
                            <a href={api.providerUrl || '#'} target="_blank" rel="noopener noreferrer">
                                Get Provider Account
                            </a>
                        </Button>
                    )}

                    {api.pricingType !== "Free" && (
                        <form action={handleGetKey} className="w-full sm:w-auto">
                            <Button type="submit" disabled={hasKey} variant="secondary" className="w-full sm:w-auto">
                                {hasKey ? "Portal Key Active" : "Get Portal Key"}
                            </Button>
                        </form>
                    )}

                    {api.affiliateUrl && (
                        <div className="flex flex-col items-end w-full sm:w-auto">
                            <Button asChild variant="outline" className="w-full sm:w-auto border-blue-500 text-blue-500 hover:bg-blue-50">
                                <a href={api.affiliateUrl} target="_blank" rel="noopener noreferrer">
                                    Partner Deal
                                </a>
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                    {hasKey && (
                        <Card className="bg-primary/5 border-primary/20">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm font-medium text-primary">Your Internal API Key</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-2 font-mono text-sm bg-background/50 p-2 rounded border border-border/50">
                                    <span className="flex-1 truncate">{apiKey}</span>
                                    <Badge variant="outline" className="text-xs">Active</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mt-2">
                                    This is a portal key. For production use, please visit the <a href={api.providerUrl} className="underline hover:text-primary">provider's website</a>.
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    <Tabs defaultValue="overview" className="space-y-4">
                        <TabsList>
                            <TabsTrigger value="overview">Overview</TabsTrigger>
                            <TabsTrigger value="endpoints">Endpoints</TabsTrigger>
                            <TabsTrigger value="playground">Playground</TabsTrigger>
                            <TabsTrigger value="pricing">Pricing</TabsTrigger>
                            <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
                        </TabsList>

                        <TabsContent value="overview" className="space-y-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About this API</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed">
                                        {api.longDescription}
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="rounded-lg border p-4">
                                            <h3 className="font-semibold mb-2">Features</h3>
                                            <ul className="space-y-2 text-sm text-muted-foreground">
                                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> High-performance infrastructure</li>
                                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> Global CDN distribution</li>
                                                <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-primary" /> 24/7 Developer support</li>
                                            </ul>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="endpoints">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Available Endpoints</CardTitle>
                                    <CardDescription>Main endpoints available in this version.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="rounded-md border bg-muted/50 p-4">
                                            <div className="flex items-center gap-2 font-mono text-sm">
                                                <Badge>GET</Badge>
                                                <span className="text-muted-foreground">{(api.sampleEndpointUrl || "GET /").split(' ')[1]}</span>
                                            </div>
                                            <p className="mt-2 text-sm text-muted-foreground">Retrieves the main resource data.</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="playground">
                            <Card className="bg-zinc-950 border-zinc-800">
                                <CardHeader>
                                    <CardTitle className="text-zinc-100">Live Playground</CardTitle>
                                    <CardDescription className="text-zinc-400">Test the API response in real-time.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        <div className="flex gap-2">
                                            <div className="flex-1 rounded-md bg-zinc-900 border border-zinc-800 p-2 font-mono text-sm text-zinc-300">
                                                {api.sampleEndpointUrl}
                                            </div>
                                            <Button>Send Request</Button>
                                        </div>
                                        <div className="rounded-md bg-zinc-900 border border-zinc-800 p-4 font-mono text-sm">
                                            <pre className="text-green-400 overflow-x-auto">
                                                {JSON.stringify(api.playgroundExampleResponse, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="pricing">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Pricing Information</CardTitle>
                                    <CardDescription>This API is {api.pricingType}.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-sm text-muted-foreground">
                                        Please visit the <a href={api.providerUrl || '#'} className="underline text-primary">provider's website</a> for detailed pricing plans.
                                    </p>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="risk">
                            <Card className="border-amber-500/20 bg-amber-500/5">
                                <CardHeader>
                                    <CardTitle className="text-amber-600 flex items-center gap-2">
                                        <ShieldAlert className="h-5 w-5" />
                                        Lock-in Risk Assesment
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium">Portability Score</span>
                                        <Badge variant={(api.confidenceScore ?? 0) > 70 ? "outline" : "destructive"}>
                                            {api.confidenceScore ?? 0}/100
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>

                <div className="space-y-6">
                    <RatingWidget apiId={api.id!} initialRating={0} userReview={userReview} />

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm">Live Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-sm text-muted-foreground">Uptime</span>
                                <span className="text-emerald-600 font-bold">99.9%</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Last Checked</span>
                                <span className="text-xs">{api.lastChecked ? new Date(api.lastChecked as Date).toLocaleTimeString() : 'Never'}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
