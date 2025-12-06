"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CopyButton } from "@/components/ui/copy-button";
import { regeneratePortalKey, revokePortalKey } from "@/actions/portal-actions";
import { RefreshCw, Trash, Folder } from "lucide-react";
import { useRouter } from "next/navigation";

// Define a type that matches the Prisma include result
type PortalKeyWithRelations = any; // Simplifying for demo speed, ideally define interface

export function KeysList({ keys }: { keys: PortalKeyWithRelations[] }) {
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);

    const handleRegenerate = async (id: string) => {
        if (!confirm("Regenerating will invalidate the old key immediately. Continue?")) return;
        setLoading(id);
        try {
            await regeneratePortalKey(id);
            router.refresh();
        } finally {
            setLoading(null);
        }
    };

    const handleRevoke = async (id: string) => {
        if (!confirm("Are you sure you want to revoke this key?")) return;
        setLoading(id);
        try {
            await revokePortalKey(id);
            router.refresh();
        } finally {
            setLoading(null);
        }
    };

    // Group by project
    const grouped = keys.reduce((acc: any, key: any) => {
        const projectName = key.project?.name || "Default Project";
        if (!acc[projectName]) acc[projectName] = [];
        acc[projectName].push(key);
        return acc;
    }, {});

    return (
        <div className="space-y-8">
            {Object.entries(grouped).map(([projectName, projectKeys]: [string, any]) => (
                <div key={projectName} className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Folder className="h-5 w-5 text-primary" />
                        <h2 className="text-xl font-semibold">{projectName}</h2>
                    </div>
                    <div className="grid gap-4">
                        {projectKeys.map((item: any) => (
                            <Card key={item.id} className="overflow-hidden">
                                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold">{item.api?.name || "Unknown API"}</span>
                                            <Badge variant={item.status === "active" ? "default" : "destructive"}>
                                                {item.status}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground font-mono bg-muted px-2 py-1 rounded">
                                            {item.key}
                                            <CopyButton value={item.key} className="h-4 w-4" />
                                        </div>
                                        <div className="text-xs text-muted-foreground">
                                            Created: {new Date(item.createdAt).toLocaleDateString()} • Last used: {item.lastUsedAt ? new Date(item.lastUsedAt).toLocaleDateString() : "Never"}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="text-right mr-4 hidden md:block">
                                            <div className="text-sm font-medium">{item.usageCount} calls</div>
                                            <div className="text-xs text-muted-foreground">Lifetime usage</div>
                                        </div>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => handleRegenerate(item.id)}
                                            disabled={loading === item.id || item.status !== "active"}
                                        >
                                            <RefreshCw className={`h-4 w-4 mr-2 ${loading === item.id ? "animate-spin" : ""}`} />
                                            Regenerate
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="destructive"
                                            onClick={() => handleRevoke(item.id)}
                                            disabled={loading === item.id || item.status !== "active"}
                                        >
                                            <Trash className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            ))}

            {keys.length === 0 && (
                <div className="text-center py-12 text-muted-foreground border rounded-lg border-dashed">
                    No keys found. Go to an API page to generate one.
                </div>
            )}
        </div>
    );
}
