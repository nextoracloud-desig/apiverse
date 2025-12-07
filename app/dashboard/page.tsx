import { SmartAssistantCard } from "@/components/dashboard/SmartAssistantCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CreditCard, Key, Server, TrendingUp, Search, BarChart3 } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SimpleLineChart } from "@/components/ui/chart";
import { getDashboardStats } from "@/actions/api-actions";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { OnboardingModal } from "@/components/OnboardingModal";


export default async function DashboardPage() {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/api/auth/signin");
    }

    const stats = await getDashboardStats();

    // Analytics Data Fetching
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const assistantSearches = await prisma.recommendationEvent.count({
        where: { createdAt: { gte: sevenDaysAgo } }
    });

    const categoryStats = await prisma.recommendationEvent.groupBy({
        by: ['primaryCategory'],
        _count: { primaryCategory: true },
        orderBy: { _count: { primaryCategory: 'desc' } },
        take: 1
    });
    const topCategory = categoryStats[0]?.primaryCategory || "None";

    const topRecommended = await prisma.api.findMany({
        take: 3,
        orderBy: { popularityScore: 'desc' },
        where: { status: "active" },
        select: { id: true, name: true, category: true }
    });

    // Fetch fresh user data to bypass stale JWT session
    const user = await prisma.user.findUnique({
        where: { id: (session.user as any).id },
        select: { onboarded: true }
    });

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>

            <SmartAssistantCard />

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalRequests || 0}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Keys</CardTitle>
                        <Key className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.activeKeys || 0}</div>
                        <p className="text-xs text-muted-foreground">Active API keys</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Saved APIs</CardTitle>
                        <CreditCard className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.savedApis || 0}</div>
                        <p className="text-xs text-muted-foreground">Bookmarked APIs</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                        <Server className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.uptime || 0}%</div>
                        <p className="text-xs text-muted-foreground">All systems operational</p>
                    </CardContent>
                </Card>
            </div>

            <OnboardingModal onboarded={user?.onboarded ?? false} />

            {/* Smart Section: Recommended & Recent */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            Recommended for You
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {topRecommended.map((api: any) => (
                                <div key={api.name} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div className="space-y-1">
                                        <p className="font-medium leading-none">{api.name}</p>
                                        <p className="text-sm text-muted-foreground">{api.category}</p>
                                    </div>
                                    <Button variant="outline" size="sm" asChild>
                                        <a href={`/api/${api.id}`}>View</a>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-3">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Search className="h-5 w-5 text-blue-500" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {/* Using mock for now as recent activity is dynamic */}
                        <div className="space-y-8">
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">New Key Generated</p>
                                    <p className="text-sm text-muted-foreground">OpenAI GPT-4</p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground">2m ago</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">Subscription Upgraded</p>
                                    <p className="text-sm text-muted-foreground">Pro Plan</p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground">1h ago</div>
                            </div>
                            <div className="flex items-center">
                                <div className="ml-4 space-y-1">
                                    <p className="text-sm font-medium leading-none">API Limit Reached</p>
                                    <p className="text-sm text-muted-foreground">Weather API</p>
                                </div>
                                <div className="ml-auto font-medium text-xs text-muted-foreground">5h ago</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-4">
                    <CardHeader>
                        <CardTitle>Usage Overview</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[200px] w-full pt-4">
                            <SimpleLineChart
                                data={[10, 25, 18, 30, 45, 35, 55, 48, 60, 75, 65, 80]}
                                height={180}
                                color="currentColor"
                                className="text-primary"
                            />
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
