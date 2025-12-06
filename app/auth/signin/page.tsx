"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Zap } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-background p-4">
            <Card className="w-full max-w-md border-border/50 bg-card/50 backdrop-blur-xl">
                <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                        <Zap className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl">Welcome to APIverse</CardTitle>
                    <CardDescription>Sign in to manage your APIs and keys</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Button
                        className="w-full"
                        variant="outline"
                        onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
                    >
                        Sign in with Google
                    </Button>
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                        </div>
                    </div>
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            signIn("credentials", {
                                email: formData.get("email"),
                                password: formData.get("password"),
                                callbackUrl: "/dashboard",
                            });
                        }}
                        className="space-y-4"
                    >
                        <input
                            name="email"
                            type="email"
                            placeholder="Email (demo@example.com)"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            required
                        />
                        <input
                            name="password"
                            type="password"
                            placeholder="Password (demo123)"
                            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                            required
                        />
                        <Button type="submit" className="w-full">
                            Sign In with Credentials
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
