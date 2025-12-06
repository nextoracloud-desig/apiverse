import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ApiCard } from "@/components/marketplace/ApiCard";

export default async function SavedPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;
    const savedItems = await prisma.savedApi.findMany({
        where: { userId },
        include: {
            api: true
        },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Saved APIs</h1>
                <p className="text-muted-foreground">Your collection of bookmarked APIs.</p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {savedItems.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No saved APIs yet.
                    </div>
                ) : (
                    savedItems.map((item) => {
                        const api = item.api;
                        if (!api) return null;

                        return (
                            <ApiCard
                                key={api.id}
                                id={api.id}
                                name={api.name}
                                description={api.shortDescription}
                                category={api.category}
                                rating={api.rating}
                                pricing={api.pricingType as any}
                                confidenceScore={api.confidenceScore}
                                logoUrl={api.logoUrl || undefined}
                                logoSymbol={api.logoSymbol || "API"}
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
}
