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
    const [isEmailSent, setIsEmailSent] = useState<boolean>(false);

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const target = event.target as typeof event.target & {
            email: { value: string };
        };

        const result = await signIn("email", {
            email: target.email.value,
            callbackUrl,
            redirect: false,
        });

        setIsLoading(false);

        if (result?.error) {
            console.error("Sign-in error:", result.error);
            setError("Failed to send login email. Please try again or check logs.");
        } else {
            setIsEmailSent(true);
        }
    }

    if (isEmailSent) {
        return (
            <div className={className}>
                <div className="flex flex-col space-y-4 text-center">
                    <div className="flex justify-center">
                        <div className="rounded-full bg-green-100 p-3 text-green-600 dark:bg-green-900 dark:text-green-300">
                            <span className="text-xl">✉️</span>
                        </div>
                    </div>
                    <h3 className="text-xl font-medium">Check your email</h3>
                    <p className="text-sm text-muted-foreground">
                        We sent a login link to your email address.<br />
                        Click the link to sign in.
                    </p>
                    <Button variant="outline" onClick={() => setIsEmailSent(false)}>
                        Try another email
                    </Button>
                </div>
            </div>
        );
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
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Send Login Link
                    </Button>
                </div>
            </form>

            <div className="mt-6 text-center text-sm">
                <span className="text-muted-foreground">Don't have an account? </span>
                <span className="text-primary font-medium">
                    It will be created automatically.
                </span>
            </div>
        </div>
    );
}
