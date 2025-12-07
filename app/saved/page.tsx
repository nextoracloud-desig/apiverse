import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getApiById } from "@/lib/api-catalog";
import { ApiCard } from "@/components/marketplace/ApiCard";
import { Info } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SavedApisPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin?callbackUrl=/saved");
    }

    const userId = (session.user as any).id;

    const savedRecords = await prisma.savedApi.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });

    // Map saved records to catalog definitions
    const savedApis = savedRecords
        .map((record) => {
            const api = getApiById(record.apiId);
            return api ? { ...api, savedAt: record.createdAt } : null;
        })
        .filter((api): api is NonNullable<typeof api> => api !== null);

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Saved APIs</h2>
                <p className="text-muted-foreground">Your curated list of APIs.</p>
            </div>

            {savedApis.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-12 border rounded-lg bg-muted/10 h-[300px]">
                    <h3 className="text-lg font-medium">No saved APIs yet</h3>
                    <p className="text-muted-foreground mt-2 max-w-sm text-center">
                        Browse the explorer and click the heart icon to save APIs for later.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {savedApis.map((api) => (
                        <ApiCard
                            key={api.id}
                            id={api.id}
                            name={api.name}
                            description={api.shortDescription}
                            category={api.category}
                            rating={api.rating ?? 0}
                            pricing={api.pricingType}
                            confidenceScore={api.confidenceScore ?? 0}
                            logoUrl={api.logoUrl}
                            logoSymbol={api.logoInitials || api.logoSymbol}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
