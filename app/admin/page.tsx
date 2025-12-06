import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetFooter, SheetClose } from "@/components/ui/sheet";
import { Check, X, Upload, Edit, Eye, EyeOff, Star, Save, Trash2 } from "lucide-react";
import { revalidatePath } from "next/cache";
import { Label } from "@/components/ui/label";

export default async function AdminPage({ searchParams }: { searchParams: { page?: string, query?: string } }) {
    const session = await getServerSession(authOptions);

    if (!session?.user) redirect("/api/auth/signin");

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! }
    });

    if (user?.role !== "admin") {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <h1 className="text-2xl font-bold text-destructive">Access Denied</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
                <Button asChild variant="outline"><a href="/">Return to Explore</a></Button>
            </div>
        );
    }

    const page = Number(searchParams.page) || 1;
    const pageSize = 10;
    const skip = (page - 1) * pageSize;

    const apis = await prisma.api.findMany({
        where: { status: { not: "pending" } }, // Exclude pending from main catalog
        orderBy: { updatedAt: 'desc' },
        take: pageSize,
        skip: skip,
    });

    const pendingApis = await prisma.api.findMany({
        where: { status: "pending" },
        orderBy: { createdAt: 'desc' },
    });

    const totalApis = await prisma.api.count();
    const totalPages = Math.ceil(totalApis / pageSize);

    async function toggleStatus(id: string, currentStatus: string) {
        "use server";
        const newStatus = currentStatus === "active" ? "hidden" : "active";
        await prisma.api.update({ where: { id }, data: { status: newStatus } });
        revalidatePath("/admin");
    }

    async function toggleFeatured(id: string, currentFeatured: boolean) {
        "use server";
        await prisma.api.update({ where: { id }, data: { featured: !currentFeatured } });
        revalidatePath("/admin");
    }

    async function updateApi(formData: FormData) {
        "use server";
        const id = formData.get("id") as string;
        const name = formData.get("name") as string;
        const category = formData.get("category") as string;
        const pricingType = formData.get("pricingType") as string;
        const affiliateUrl = formData.get("affiliateUrl") as string;

        await prisma.api.update({
            where: { id },
            data: {
                name,
                category,
                pricingType,
                affiliateUrl: affiliateUrl || null,
            }
        });
        revalidatePath("/admin");
    }

    async function handleBulkImport(formData: FormData) {
        "use server";
        const file = formData.get("file") as File;
        if (!file) return;

        const text = await file.text();
        let importedCount = 0;

        try {
            const data = JSON.parse(text);
            const items = Array.isArray(data) ? data : [data];

            for (const item of items) {
                if (!item.name || !item.slug) continue;

                await prisma.api.upsert({
                    where: { slug: item.slug },
                    update: {
                        ...item,
                        updatedAt: new Date(),
                    },
                    create: {
                        slug: item.slug,
                        name: item.name,
                        shortDescription: item.shortDescription || "",
                        longDescription: item.longDescription || "",
                        category: item.category || "Uncategorized",
                        tags: item.tags || "",
                        pricingType: item.pricingType || "Free",
                        docsUrl: item.docsUrl || "",
                        providerUrl: item.providerUrl || "",
                        providerName: item.providerName || "Unknown",
                        source: "import:bulk",
                        status: "active",
                    }
                });
                importedCount++;
            }
            // In a real app we'd show a toast here
        } catch (e) {
            console.error("Import failed", e);
        }
        revalidatePath("/admin");
    }

    async function approveSuggestion(id: string) {
        "use server";
        await prisma.api.update({
            where: { id },
            data: { status: "active" }
        });
        revalidatePath("/admin");
    }

    async function rejectSuggestion(id: string) {
        "use server";
        // We can either delete or set to 'rejected'/'hidden'. 
        // Deleting for now to keep DB clean of spam.
        await prisma.api.delete({
            where: { id }
        });
        revalidatePath("/admin");
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
                    <p className="text-muted-foreground">Manage catalog, imports, and users.</p>
                </div>
                <Badge variant="outline" className="px-4 py-1">Admin Mode</Badge>
            </div>

            <Tabs defaultValue="catalog" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="catalog">Catalog</TabsTrigger>
                    <TabsTrigger value="import">Bulk Import</TabsTrigger>
                    <TabsTrigger value="suggestions">Suggestions</TabsTrigger>
                </TabsList>

                <TabsContent value="catalog">
                    <Card>
                        <CardHeader>
                            <CardTitle>API Catalog</CardTitle>
                            <CardDescription>Showing {apis.length} of {totalApis} APIs.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Pricing</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead>Featured</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {apis.map((api) => (
                                            <TableRow key={api.id}>
                                                <TableCell className="font-medium">{api.name}</TableCell>
                                                <TableCell>{api.category}</TableCell>
                                                <TableCell>{api.pricingType}</TableCell>
                                                <TableCell>
                                                    <Badge variant={api.status === "active" ? "success" : "secondary"}>
                                                        {api.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {api.featured && <Star className="h-4 w-4 fill-yellow-500 text-yellow-500" />}
                                                </TableCell>
                                                <TableCell className="text-right flex justify-end gap-2">
                                                    <form action={toggleFeatured.bind(null, api.id, api.featured)}>
                                                        <Button size="icon" variant="ghost" title="Toggle Featured">
                                                            <Star className={`h-4 w-4 ${api.featured ? "fill-yellow-500 text-yellow-500" : "text-muted-foreground"}`} />
                                                        </Button>
                                                    </form>
                                                    <form action={toggleStatus.bind(null, api.id, api.status)}>
                                                        <Button size="icon" variant="ghost" title="Toggle Status">
                                                            {api.status === "active" ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                                        </Button>
                                                    </form>

                                                    <Sheet>
                                                        <SheetTrigger asChild>
                                                            <Button size="icon" variant="ghost">
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                        </SheetTrigger>
                                                        <SheetContent>
                                                            <SheetHeader>
                                                                <SheetTitle>Edit API</SheetTitle>
                                                                <SheetDescription>
                                                                    Make changes to the API details here.
                                                                </SheetDescription>
                                                            </SheetHeader>
                                                            <form action={updateApi} className="space-y-4 py-4">
                                                                <input type="hidden" name="id" value={api.id} />
                                                                <div className="space-y-2">
                                                                    <label htmlFor="name" className="text-sm font-medium">Name</label>
                                                                    <Input id="name" name="name" defaultValue={api.name} required />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label htmlFor="category" className="text-sm font-medium">Category</label>
                                                                    <Input id="category" name="category" defaultValue={api.category} required />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label htmlFor="pricingType" className="text-sm font-medium">Pricing Type</label>
                                                                    <select
                                                                        id="pricingType"
                                                                        name="pricingType"
                                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                                                        defaultValue={api.pricingType}
                                                                    >
                                                                        <option value="Free">Free</option>
                                                                        <option value="Freemium">Freemium</option>
                                                                        <option value="Paid">Paid</option>
                                                                        <option value="Trial">Trial</option>
                                                                    </select>
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label htmlFor="affiliateUrl" className="text-sm font-medium">Affiliate URL</label>
                                                                    <Input id="affiliateUrl" name="affiliateUrl" defaultValue={api.affiliateUrl || ""} placeholder="https://..." />
                                                                </div>
                                                                <SheetFooter>
                                                                    <SheetClose asChild>
                                                                        <Button type="submit">Save changes</Button>
                                                                    </SheetClose>
                                                                </SheetFooter>
                                                            </form>
                                                        </SheetContent>
                                                    </Sheet>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                            <div className="flex items-center justify-end space-x-2 py-4">
                                <Button variant="outline" size="sm" disabled={page <= 1} asChild>
                                    <a href={`/admin?page=${page - 1}`}>Previous</a>
                                </Button>
                                <Button variant="outline" size="sm" disabled={page >= totalPages} asChild>
                                    <a href={`/admin?page=${page + 1}`}>Next</a>
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="import">
                    <Card>
                        <CardHeader>
                            <CardTitle>Bulk Import</CardTitle>
                            <CardDescription>Upload a JSON file to update the catalog.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <form action={handleBulkImport} className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 flex flex-col items-center justify-center text-center space-y-4 hover:bg-muted/50 transition-colors">
                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                    <Upload className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <label htmlFor="file-upload" className="cursor-pointer font-medium text-primary hover:underline">
                                        Click to upload
                                    </label>
                                    <span className="text-muted-foreground"> or drag and drop</span>
                                    <p className="text-sm text-muted-foreground">Supports .json (Array of Api objects)</p>
                                </div>
                                <input id="file-upload" name="file" type="file" accept=".json" className="hidden" />
                                <Button type="submit">Start Import</Button>
                            </form>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="suggestions">
                    <Card>
                        <CardHeader>
                            <CardTitle>User Suggestions</CardTitle>
                            <CardDescription>Review API submissions from the community.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Category</TableHead>
                                            <TableHead>Docs</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {pendingApis.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                                                    No pending suggestions.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            pendingApis.map((api) => (
                                                <TableRow key={api.id}>
                                                    <TableCell className="font-medium">{api.name}</TableCell>
                                                    <TableCell>{api.category}</TableCell>
                                                    <TableCell>
                                                        <a href={api.docsUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline flex items-center gap-1">
                                                            Link <Eye className="h-3 w-3" />
                                                        </a>
                                                    </TableCell>
                                                    <TableCell className="text-right flex justify-end gap-2">
                                                        <form action={approveSuggestion.bind(null, api.id)}>
                                                            <Button size="sm" variant="default" className="bg-green-600 hover:bg-green-700">
                                                                <Check className="h-4 w-4 mr-1" /> Approve
                                                            </Button>
                                                        </form>
                                                        <form action={rejectSuggestion.bind(null, api.id)}>
                                                            <Button size="sm" variant="destructive">
                                                                <X className="h-4 w-4 mr-1" /> Reject
                                                            </Button>
                                                        </form>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
