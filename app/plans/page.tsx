import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PlansPage() {
    return (
        <div className="container py-8 max-w-5xl space-y-8">
            <div className="text-center space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Plans & Pricing</h1>
                <p className="text-xl text-muted-foreground">
                    Simple, transparent pricing for every stage of your journey.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
                {/* Free Plan */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Free</CardTitle>
                        <CardDescription>For hobbyists and learners.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="text-3xl font-bold">$0<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited API Discovery</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Save up to 5 APIs</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 100 API Calls/mo (Internal APIs)</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline" disabled>Current Plan</Button>
                    </CardFooter>
                </Card>

                {/* Pro Plan */}
                <Card className="flex flex-col border-primary relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-bl-lg">Popular</div>
                    <CardHeader>
                        <CardTitle>Pro</CardTitle>
                        <CardDescription>For developers building apps.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="text-3xl font-bold">$19<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Everything in Free</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Save unlimited APIs</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 10k API Calls/mo</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Access to Premium APIs</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">Upgrade to Pro</Button>
                    </CardFooter>
                </Card>

                {/* Team Plan */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Team</CardTitle>
                        <CardDescription>For startups and agencies.</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="text-3xl font-bold">$99<span className="text-sm font-normal text-muted-foreground">/mo</span></div>
                        <ul className="space-y-2">
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Everything in Pro</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Unlimited Team Members</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> 100k API Calls/mo</li>
                            <li className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" /> Priority Support</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="outline">Contact Sales</Button>
                    </CardFooter>
                </Card>
            </div>

            <div className="text-center p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                    * Note: This pricing page is currently a placeholder. No actual charges will be made.
                </p>
            </div>
        </div>
    );
}
