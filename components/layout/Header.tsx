"use client";

import { Bell, Menu, User, Settings, Key, LogOut } from "lucide-react";
import { Notifications } from "@/components/layout/Notifications";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { SidebarContent } from "@/components/layout/Sidebar";
import { SearchInput } from "@/components/marketplace/SearchInput";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";

export function Header() {
    const { data: session } = useSession();
    const user = session?.user;

    return (
        <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b border-border/40 bg-background/60 backdrop-blur-xl px-4 md:px-6 transition-all duration-300">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="md:hidden bg-background/50 backdrop-blur-sm border-border/50 hover:bg-primary/10 hover:text-primary transition-colors">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Toggle navigation</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-72 p-0 border-r border-border/40 bg-background/80 backdrop-blur-2xl">
                    <SidebarContent />
                </SheetContent>
            </Sheet>
            <div className="w-full flex-1">
                <div className="relative group md:w-2/3 lg:w-1/3">
                    <SearchInput />
                </div>
            </div>

            <div className="flex items-center gap-3 md:gap-4">
                <Notifications />

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <div className="h-9 w-9 rounded-xl flex items-center justify-center overflow-hidden border border-border/50 hover:border-primary/50 transition-all cursor-pointer shadow-sm hover:shadow-md bg-muted/50">
                            <Avatar className="h-full w-full">
                                <AvatarImage src={user?.image || ""} alt={user?.name || "User"} />
                                <AvatarFallback className="bg-transparent">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </AvatarFallback>
                            </Avatar>
                        </div>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                        <DropdownMenuLabel>
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.name || "User"}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                            <Link href="/settings" className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>Settings</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link href="/keys" className="cursor-pointer">
                                <Key className="mr-2 h-4 w-4" />
                                <span>My API Keys</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={() => signOut({ callbackUrl: "/auth/signin" })}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
