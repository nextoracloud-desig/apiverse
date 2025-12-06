"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import {
    LayoutDashboard,
    Compass,
    Bookmark,
    Key,
    Users,
    CreditCard,
    FileText,
    LifeBuoy,
    Settings,
    LogOut,
    Zap
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

const sidebarItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Explore APIs", href: "/", icon: Compass },
    { name: "Saved APIs", href: "/saved", icon: Bookmark },
    { name: "My API Keys", href: "/keys", icon: Key },
    { name: "Community", href: "/community", icon: Users },
    { name: "Plans", href: "/plans", icon: CreditCard },
    { name: "Documentation", href: "/docs", icon: FileText },
    { name: "Support", href: "/support", icon: LifeBuoy },
];

export function SidebarContent() {
    const pathname = usePathname();

    return (
        <div className="flex flex-col justify-between h-full">
            <div className="flex h-16 items-center border-b border-border/40 px-6 bg-background/20 backdrop-blur-md">
                <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight group">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-lg shadow-primary/20 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                        <Zap className="h-5 w-5 fill-current" />
                    </div>
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">APIverse</span>
                </Link>
            </div>

            <div className="flex flex-col justify-between flex-1 p-4">
                <nav className="space-y-1.5">
                    {sidebarItems.map((item) => {
                        const isActive = pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 relative overflow-hidden",
                                    isActive
                                        ? "text-primary shadow-sm"
                                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                                )}
                            >
                                {isActive && (
                                    <div className="absolute inset-0 bg-primary/10 border-l-2 border-primary" />
                                )}
                                <item.icon className={cn("h-4 w-4 transition-transform duration-300 group-hover:scale-110 relative z-10", isActive ? "text-primary" : "text-muted-foreground group-hover:text-primary")} />
                                <span className="relative z-10">{item.name}</span>
                            </Link>
                        );
                    })}
                </nav>

                <div className="space-y-1.5 border-t border-border/40 pt-4">
                    <Link
                        href="/settings"
                        className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-muted/50 hover:text-foreground"
                    >
                        <Settings className="h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                        Settings
                    </Link>
                    <button
                        onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                        className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-all duration-300 hover:bg-destructive/10 hover:text-destructive"
                    >
                        <LogOut className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
                        Logout
                    </button>
                </div>
            </div>
        </div>
    );
}

export function Sidebar() {
    return (
        <aside className="hidden md:flex h-screen w-64 flex-col fixed left-0 top-0 z-40 border-r border-border/40 bg-background/60 backdrop-blur-2xl transition-all duration-300 shadow-xl shadow-black/5">
            <ScrollArea className="h-full">
                <SidebarContent />
            </ScrollArea>
        </aside>
    );
}
