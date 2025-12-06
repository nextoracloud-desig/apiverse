"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "next-auth/react";
import { useState } from "react";
// import { updateProfile } from "@/actions/user-actions"; // We'll need this

export default function SettingsPage() {
    const { data: session } = useSession();
    const user = session?.user;
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div className="container py-8 max-w-4xl space-y-8">
            <h1 className="text-3xl font-bold tracking-tight">Settings</h1>

            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile</CardTitle>
                        <CardDescription>
                            Manage your public profile information.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Display Name</Label>
                            <Input id="name" defaultValue={user?.name || ""} />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input id="email" defaultValue={user?.email || ""} disabled className="bg-muted" />
                            <p className="text-[0.8rem] text-muted-foreground">
                                Email cannot be changed at this time.
                            </p>
                        </div>
                    </CardContent>
                    <CardFooter className="border-t px-6 py-4">
                        <Button disabled={isLoading}>Save Changes</Button>
                    </CardFooter>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Notifications</CardTitle>
                        <CardDescription>
                            Configure how you receive notifications.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between space-x-2 rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="emails" className="text-base">Email Notifications</Label>
                                <div className="text-sm text-muted-foreground">Receive emails about your account activity and API updates.</div>
                            </div>
                            {/* Reusing checkbox or switch - let's assume default checkbox for now or just a button toggle if no Switch component yet */}
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="emails" className="h-4 w-4 rounded border-gray-300" defaultChecked />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
