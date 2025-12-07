"use client";

import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
    {
        name: "Free",
        price: "₹0",
        period: "/month",
        description: "For hobbyists and students.",
        features: ["5 Saved APIs Limit", "3 Personal API Keys", "Community Support", "Standard Access Speed"],
        tier: "free",
        buttonText: "Current Plan",
        popular: false,
    },
    {
        name: "Starter",
        price: "₹299",
        period: "/month",
        description: "For professional developers.",
        features: ["Unlimited Saved APIs", "20 Personal API Keys", "Priority Email Support", "Faster Access Speed", "Search Analytics"],
        tier: "starter",
        buttonText: "Upgrade to Starter",
        popular: true,
        gradient: "from-blue-600 to-cyan-500",
    },
    {
        name: "Developer",
        price: "₹899",
        period: "/month",
        description: "For power users and teams.",
        features: ["Everything in Starter", "Unlimited API Keys", "Auto Key Rotation", "Real-time Alerts", "Usage Metrics API"],
        tier: "developer",
        buttonText: "Upgrade to Developer",
        popular: false,
        gradient: "from-purple-600 to-pink-500",
    },
    {
        name: "Enterprise",
        price: "Custom",
        period: "",
        description: "For large organizations.",
        features: ["SSO & SLA", "Dedicated Account Manager", "Custom Integrations", "On-premise Options"],
        tier: "enterprise",
        buttonText: "Contact Sales",
        popular: false,
    },
];

export default function PlansPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleSubscribe = async (tier: string) => {
        if (!session) {
            router.push("/auth/signin?callbackUrl=/plans");
            return;
        }

        if (tier === "free") return;
        if (tier === "enterprise") {
            window.location.href = "mailto:sales@apiverse.com";
            return;
        }

        setLoading(tier);

        try {
            const res = await fetch("/api/stripe/subscribe", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ plan: tier }),
            });

            if (!res.ok) throw new Error("Subscription failed");

            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error(error);
            alert("Unable to start subscription. Please try again later or contact support.");
            setLoading(null);
        }
    };

    const handlePortal = async () => {
        setLoading("portal");
        try {
            const res = await fetch("/api/stripe/portal", {
                method: "POST",
            });
            const data = await res.json();
            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error(error);
            setLoading(null);
        }
    };

    const currentPlan = (session?.user as any)?.plan || "free";

    return (
        <div className="container py-20">
            <div className="text-center mb-16 space-y-4">
                <h1 className="text-4xl font-bold tracking-tight lg:text-5xl">
                    Simple, transparent pricing
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                    Choose the perfect plan for your API usage. Upgrade or downgrade at any time.
                </p>
                {currentPlan !== "free" && (
                    <div className="mt-4">
                        <Button variant="outline" onClick={handlePortal} disabled={!!loading}>
                            {loading === "portal" && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Manage Subscription
                        </Button>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {plans.map((plan) => {
                    const isCurrent = currentPlan === plan.tier;
                    return (
                        <div
                            key={plan.name}
                            className={cn(
                                "rounded-xl border bg-card p-8 shadow-lg flex flex-col relative overflow-hidden transition-all hover:shadow-xl",
                                plan.popular && "border-primary shadow-primary/10 md:scale-105 z-10"
                            )}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-0 left-0 bg-primary text-primary-foreground text-xs font-bold text-center py-1">
                                    MOST POPULAR
                                </div>
                            )}
                            {plan.gradient && (
                                <div className={cn("absolute inset-0 opacity-[0.03] bg-gradient-to-br pointer-events-none", plan.gradient)} />
                            )}

                            <div className="mb-6">
                                <h3 className="text-xl font-bold">{plan.name}</h3>
                                <div className="mt-2 flex items-baseline">
                                    <span className="text-3xl font-bold">{plan.price}</span>
                                    <span className="text-sm text-muted-foreground">{plan.period}</span>
                                </div>
                                <p className="mt-4 text-sm text-muted-foreground">{plan.description}</p>
                            </div>

                            <ul className="space-y-3 mb-8 flex-1">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center text-sm">
                                        <Check className="mr-2 h-4 w-4 text-primary" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Button
                                className={cn("w-full", plan.popular && "bg-primary text-primary-foreground")}
                                variant={isCurrent || plan.tier === "free" ? "outline" : "default"}
                                disabled={isCurrent || (plan.tier === "free" && currentPlan !== "free") || !!loading}
                                onClick={() => handleSubscribe(plan.tier)}
                            >
                                {loading === plan.tier && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {isCurrent ? "Current Plan" : plan.buttonText}
                            </Button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
