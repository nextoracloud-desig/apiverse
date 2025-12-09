"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface AuthFormProps {
    className?: string;
}

export function AuthForm({ className }: AuthFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const target = event.target as typeof event.target & {
            email: { value: string };
            password: { value: string };
        };

        const result = await signIn("credentials", {
            email: target.email.value,
            password: target.password.value,
            redirect: false, // We handle redirect manually to check for errors first
            callbackUrl,
        });

        setIsLoading(false);

        if (result?.error) {
            console.error("Sign-in error:", result.error);
            setError("Invalid email or password.");
        } else {
            router.push(callbackUrl);
            router.refresh();
        }
    }

    return (
        <div className={className}>
            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            placeholder="••••••••"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="current-password"
                            disabled={isLoading}
                            required
                        />
                    </div>
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Sign In / Create Account
                    </Button>
                </div>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
                New here? Enter a new email + password and we’ll create your account automatically.
            </div>
        </div>
    );
}
