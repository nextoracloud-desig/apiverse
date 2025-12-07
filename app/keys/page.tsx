export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { KeysList } from "@/app/keys/KeysList";
import { CreateProjectButton } from "@/components/projects/CreateProjectButton";

export default async function KeysPage() {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
        redirect("/api/auth/signin");
    }

    const userId = (session.user as any).id;

    // Fetch Portal Keys with relations
    const keys = await prisma.portalKey.findMany({
        where: { userId },
        include: {
            api: true,
            project: true
        },
        orderBy: { createdAt: "desc" }
    });

    return (
        <div className="space-y-8 container py-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">My API Keys</h1>
                    <p className="text-muted-foreground">Manage your access tokens for APIs.</p>
                </div>
                <CreateProjectButton />
            </div>

            <KeysList keys={keys} />
        </div>
    );
}

