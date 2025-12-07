export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Label } from "@/components/ui/label";

export default function SuggestPage() {
    async function submitSuggestion(formData: FormData) {
        "use server";
        const name = formData.get("name") as string;
        const docsUrl = formData.get("docsUrl") as string;
        const category = formData.get("category") as string;
        const shortDescription = formData.get("shortDescription") as string;

        if (!name || !docsUrl) return;

        // Create a slug from name
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") + "-" + Date.now().toString().slice(-4);

        await prisma.api.create({
            data: {
                name,
                slug,
                docsUrl,
                category: category || "Uncategorized",
                shortDescription: shortDescription || "",
                longDescription: "", // Optional
                providerUrl: "", // Optional
                providerName: "Community Submission",
                status: "pending",
                source: "user-submitted",
                pricingType: "Free", // Default
                tags: "",
            }
        });

        redirect("/suggest?success=true");
    }

    return (
        <div className="container max-w-lg py-12">
            <Card>
                <CardHeader>
                    <CardTitle>Suggest an API</CardTitle>
                    <CardDescription>
                        Know an awesome API that's missing? Submit it to our catalog!
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form action={submitSuggestion} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">API Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Stripe" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <Input id="category" name="category" placeholder="e.g. Finance" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="docsUrl">Documentation URL</Label>
                            <Input id="docsUrl" name="docsUrl" type="url" placeholder="https://..." required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="shortDescription">Short Description</Label>
                            <Input id="shortDescription" name="shortDescription" placeholder="Briefly describe what it does..." />
                        </div>
                        <Button type="submit" className="w-full">Submit API</Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
