"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useState, useEffect } from "react";
// import { getNotifications, markRead } from "@/actions/notification-actions"; // We need to create this

export function Notifications() {
    const [open, setOpen] = useState(false);
    // Mock notifications for now as we haven't implemented the action fully or seeded data
    const notifications = [
        { id: "1", title: "Welcome to APIverse!", message: "Explore the best APIs.", read: false, createdAt: new Date() }
    ];

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative hover:bg-primary/10 hover:text-primary transition-colors rounded-xl">
                    <Bell className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                    {notifications.some(n => !n.read) && (
                        <span className="absolute right-2.5 top-2.5 h-2 w-2 rounded-full bg-primary ring-2 ring-background" />
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold">Notifications</h4>
                    {/* <Button variant="ghost" size="sm" className="text-xs h-auto p-0">Mark all read</Button> */}
                </div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-4 text-center text-sm text-muted-foreground">
                            No notifications.
                        </div>
                    ) : (
                        notifications.map((n) => (
                            <div key={n.id} className="border-b px-4 py-3 last:border-0 hover:bg-muted/50 transition-colors">
                                <div className="flex items-start gap-2">
                                    <div className="flex-1 space-y-1">
                                        <p className="text-sm font-medium leading-none">{n.title}</p>
                                        <p className="text-xs text-muted-foreground">{n.message}</p>
                                        <p className="text-[10px] text-muted-foreground pt-1">
                                            {n.createdAt.toLocaleDateString()}
                                        </p>
                                    </div>
                                    {!n.read && <span className="h-2 w-2 rounded-full bg-blue-500 mt-1" />}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
