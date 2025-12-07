export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { Book, ShieldCheck, Zap, Code, Terminal } from "lucide-react";

export default function DocsPage() {
    const sidebarLinks = [
        { title: "Introduction", href: "#intro", icon: Book },
        { title: "Authentication", href: "#auth", icon: ShieldCheck },
        { title: "Rate Limits", href: "#limits", icon: Zap },
        { title: "SDKs & Tools", href: "#sdks", icon: Code },
        { title: "CLI Reference", href: "#cli", icon: Terminal },
    ];

    return (
        <div className="container py-8 max-w-7xl flex gap-10">
            {/* Docs Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0 sticky top-24 h-[calc(100vh-8rem)]">
                <div className="space-y-4">
                    <h3 className="font-semibold text-lg tracking-tight">Documentation</h3>
                    <ScrollArea className="h-full py-2">
                        <nav className="space-y-1">
                            {sidebarLinks.map((link) => (
                                <Button key={link.href} variant="ghost" className="w-full justify-start gap-2" asChild>
                                    <Link href={link.href}>
                                        <link.icon className="h-4 w-4" />
                                        {link.title}
                                    </Link>
                                </Button>
                            ))}
                        </nav>
                    </ScrollArea>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 space-y-12 min-w-0">
                <div id="intro" className="space-y-4">
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Apiverse Documentation</h1>
                    <p className="text-xl text-muted-foreground">
                        Your complete guide to integrating and managing APIs.
                    </p>
                </div>

                <div className="space-y-8">
                    <section id="getting-started" className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                <Book className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Getting Started</h2>
                        </div>
                        <p className="leading-7 text-muted-foreground">
                            APIverse provides a unified layer to access thousands of APIs with a single key.
                            Our platform handles the complexity of authentication, billing, and rate limiting.
                        </p>
                        <Card>
                            <CardHeader>
                                <CardTitle>Quick Start</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>1. Create an account</p>
                                <p>2. Generate a Portal Key in your dashboard</p>
                                <p>3. Use the key in the `x-portal-key` header</p>
                            </CardContent>
                        </Card>
                    </section>

                    <section id="auth" className="space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-lg bg-green-500/10 flex items-center justify-center text-green-600">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <h2 className="text-2xl font-bold tracking-tight">Authentication</h2>
                        </div>
                        <p className="leading-7 text-muted-foreground">
                            We support standard Bearer authentication.
                        </p>
                        <Card className="bg-muted">
                            <CardContent className="p-4 overflow-x-auto">
                                <pre className="text-sm font-mono text-foreground">
                                    {`curl -X GET https://api.apiverse.com/v1/users \\
  -H "Authorization: Bearer YOUR_PORTAL_KEY"`}
                                </pre>
                            </CardContent>
                        </Card>
                    </section>
                </div>
            </main>
        </div>
    );
}
