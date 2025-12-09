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
    const [isLogin, setIsLogin] = useState<boolean>(true);

    async function onSubmit(event: React.SyntheticEvent) {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        const target = event.target as typeof event.target & {
            email: { value: string };
            password: { value: string };
            name?: { value: string };
            confirmPassword?: { value: string };
        };

        const email = target.email.value;
        const password = target.password.value;

        try {
            if (isLogin) {
                // SIGN IN FLOW
                const result = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                    callbackUrl,
                });

                if (result?.error) {
                    console.error("Sign-in error:", result.error);
                    setError(result.error);
                } else {
                    router.push(callbackUrl);
                    router.refresh();
                }
            } else {
                // REGISTER FLOW
                const name = target.name?.value;
                const confirmPassword = target.confirmPassword?.value;

                if (password !== confirmPassword) {
                    setError("Passwords do not match");
                    setIsLoading(false);
                    return;
                }

                // 1. Create Account
                const res = await fetch("/api/auth/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password, name }),
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || "Registration failed");
                }

                // 2. Auto Login on Success
                const loginResult = await signIn("credentials", {
                    email,
                    password,
                    redirect: false,
                    callbackUrl,
                });

                if (loginResult?.error) {
                    setError(loginResult.error);
                } else {
                    router.push(callbackUrl);
                    router.refresh();
                }
            }
        } catch (err: any) {
            setError(err.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <div className={className}>
            <div className="flex flex-col space-y-2 text-center mb-6">
                <h1 className="text-2xl font-semibold tracking-tight">
                    {isLogin ? "Sign In" : "Create your free account"}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {isLogin
                        ? "Enter your email below to sign in to your account"
                        : "Enter your details below to create your account"}
                </p>
            </div>

            <form onSubmit={onSubmit}>
                <div className="grid gap-4">
                    {!isLogin && (
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                placeholder="John Doe"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="name"
                                autoCorrect="off"
                                disabled={isLoading}
                                required
                            />
                        </div>
                    )}
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
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            disabled={isLoading}
                            required
                        />
                    </div>
                    {!isLogin && (
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                placeholder="••••••••"
                                type="password"
                                autoCapitalize="none"
                                autoComplete="new-password"
                                disabled={isLoading}
                                required
                            />
                        </div>
                    )}
                    {error && <p className="text-sm text-destructive">{error}</p>}
                    <Button disabled={isLoading}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isLogin ? "Sign In" : "Create free account"}
                    </Button>
                </div>
            </form>
            <div className="mt-4 text-center text-sm text-muted-foreground">
                {isLogin ? (
                    <>
                        New here?{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(false);
                                setError(null);
                            }}
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Create an account
                        </button>
                    </>
                ) : (
                    <>
                        Already have an account?{" "}
                        <button
                            type="button"
                            onClick={() => {
                                setIsLogin(true);
                                setError(null);
                            }}
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Sign in
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
