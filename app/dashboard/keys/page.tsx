import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getApiById } from "@/lib/api-catalog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { RevokeKeyButton } from "@/components/RevokeKeyButton";
import { Key } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function KeysPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/auth/signin?callbackUrl=/dashboard/keys");
    }

    const userId = (session.user as any).id;

    // Fetch user keys
    const keys = await prisma.userApiKey.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="container py-8 space-y-8">
            <div className="flex flex-col space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">My APIverse Keys</h2>
                <p className="text-muted-foreground">
                    Manage your internal portal keys. These keys are used for proxying requests through APIverse.
                </p>
            </div>

            <div className="grid gap-4 mt-8">
                {keys.length === 0 ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>No keys found</CardTitle>
                            <CardDescription>
                                You haven&apos;t generated any keys yet. Visit an API details page to get one.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>Active Keys</CardTitle>
                            <CardDescription>
                                You have {keys.filter(k => k.status === 'active').length} active keys.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {/* Desktop View */}
                            <div className="hidden md:block">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>API Name</TableHead>
                                            <TableHead>Key Prefix</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Created</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {keys.map((key) => {
                                            const api = getApiById(key.apiId);
                                            return (
                                                <TableRow key={key.id}>
                                                    <TableCell className="font-medium">
                                                        <div className="flex items-center gap-2">
                                                            <Key className="h-4 w-4 text-muted-foreground" />
                                                            {api ? api.name : key.apiId}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-xs">
                                                        {key.key.substring(0, 12)}...
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={key.status === "active" ? "default" : "destructive"}>
                                                            {key.status}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="text-muted-foreground">
                                                        {format(new Date(key.createdAt), "MMM d, yyyy")}
                                                    </TableCell>
                                                    <TableCell>
                                                        {key.status === "active" && <RevokeKeyButton keyId={key.id} />}
                                                    </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                </Table>
                            </div>

                            {/* Mobile View */}
                            <div className="md:hidden space-y-4">
                                {keys.map((key) => {
                                    const api = getApiById(key.apiId);
                                    return (
                                        <div key={key.id} className="flex flex-col p-4 border rounded-lg bg-card space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-2 font-medium">
                                                    <Key className="h-4 w-4 text-primary" />
                                                    {api ? api.name : key.apiId}
                                                </div>
                                                <Badge variant={key.status === "active" ? "default" : "destructive"}>
                                                    {key.status}
                                                </Badge>
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs text-muted-foreground uppercase tracking-wider">Key Prefix</p>
                                                <p className="font-mono text-xs bg-muted p-2 rounded break-all">
                                                    {key.key.substring(0, 12)}...
                                                </p>
                                            </div>

                                            <div className="flex items-center justify-between pt-2">
                                                <span className="text-xs text-muted-foreground">
                                                    {format(new Date(key.createdAt), "MMM d, yyyy")}
                                                </span>
                                                {key.status === "active" && (
                                                    <div className="w-full max-w-[100px]">
                                                        <RevokeKeyButton keyId={key.id} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
