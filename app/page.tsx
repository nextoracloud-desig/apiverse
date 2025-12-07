export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Search, ShieldCheck, Zap } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandingPage() {
    // const session = await getServerSession(authOptions);
    // if (session) {
    //     redirect("/dashboard");
    // }

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="px-4 py-24 md:py-32 text-center space-y-8 bg-gradient-to-b from-background to-muted/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-grid-slate-100/50 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10 dark:bg-grid-slate-700/25" />
                <div className="container max-w-5xl mx-auto space-y-6">
                    <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20">
                        v2.0 Now Live
                    </div>
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight lg:text-7xl leading-tight">
                        Your API command center <br className="hidden sm:inline" />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">
                            in one dashboard
                        </span>
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed px-2">
                        Discover, test, and manage 2000+ APIs. Handle internal keys, monitor usage, and streamline your developer workflow in one unified platform.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8 w-full max-w-sm sm:max-w-none mx-auto">
                        <Button size="lg" asChild className="w-full sm:w-auto text-lg px-8 h-12 shadow-lg shadow-primary/20">
                            <Link href="/auth/signin">
                                Start for free <ArrowRight className="ml-2 h-5 w-5" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" asChild className="w-full sm:w-auto text-lg px-8 h-12 bg-background/50 hover:bg-muted">
                            <Link href="/explore">
                                Browse catalog
                            </Link>
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-card/50 border-y">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16 space-y-4">
                        <h2 className="text-3xl font-bold tracking-tight">Everything you need to ship faster</h2>
                        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                            Stop wrestling with scattered documentation and keys. APIverse brings it all together.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        <FeatureCard
                            icon={<Search className="h-10 w-10 text-blue-500" />}
                            title="Unified Catalog"
                            description="Access a massive directory of 1700+ curated APIs. Filter by category, pricing, and confidence score to find the best tools."
                        />
                        <FeatureCard
                            icon={<Zap className="h-10 w-10 text-amber-500" />}
                            title="Smart Insights"
                            description="Get real-time health checks and latency stats. Our intelligent suggestions help you pick reliable APIs for your stack."
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="h-10 w-10 text-emerald-500" />}
                            title="Internal Keys"
                            description="Generate and manage secure proxy keys for your team. Revoke access instantly and track usage without code changes."
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Preview */}
            <section className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-12">Simple, transparent pricing</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
                        <PricingCard
                            title="Free"
                            price="₹0"
                            features={["5 Saved APIs", "3 Personal Keys", "Standard Support"]}
                        />
                        <PricingCard
                            title="Starter"
                            price="₹299"
                            features={["Unlimited Saved APIs", "20 Personal Keys", "Priority Support", "Analytics"]}
                            highlight
                        />
                        <PricingCard
                            title="Developer"
                            price="₹899"
                            features={["Unlimited Keys", "Team Access", "SLA Guarantee", "Advanced Metrics"]}
                        />
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t text-center text-muted-foreground">
                <div className="container mx-auto px-4">
                    <p>&copy; 2025 APIverse. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}

function FeatureCard({ icon, title, description }: any) {
    return (
        <div className="p-6 rounded-2xl bg-card border shadow-sm hover:shadow-md transition-shadow">
            <div className="mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-muted-foreground">{description}</p>
        </div>
    );
}

function PricingCard({ title, price, features, highlight }: any) {
    return (
        <div className={`p-8 rounded-2xl border ${highlight ? 'border-primary bg-primary/5 shadow-lg relative' : 'bg-card shadow-sm'} flex flex-col`}>
            {highlight && <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>}
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            <div className="text-4xl font-bold mb-6">{price}<span className="text-base font-normal text-muted-foreground">/mo</span></div>
            <ul className="space-y-3 mb-8 flex-1">
                {features.map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500" /> {f}
                    </li>
                ))}
            </ul>
            <Button variant={highlight ? "default" : "outline"} asChild>
                <Link href="/plans">View Plans</Link>
            </Button>
        </div>
    );
}
