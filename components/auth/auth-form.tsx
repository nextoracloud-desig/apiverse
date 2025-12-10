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
    // const callbackUrl = searchParams.get("callbackUrl") || "/dashboard"; // snippet uses hardcoded /dashboard
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [isLogin, setIsLogin] = useState<boolean>(true);

    async function handleSignIn(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);
        const form = e.target as HTMLFormElement; // Cast to HTMLFormElement
        // Use form.elements or direct access if named inputs, easiest is FormData or target casting
        // User snippet used FormData from e.currentTarget. Adapting to be robust.
        const formData = new FormData(form);
        const email = String(formData.get('email') || '').trim();
        const password = String(formData.get('password') || '');

        try {
            const res = await signIn('credentials', { redirect: false, email, password });
            if (!res) {
                setErrorMsg('Unexpected auth error, check server logs.');
                setLoading(false);
                return;
            }
            if (res.error) {
                setErrorMsg(res.error || 'Invalid email or password.');
                setLoading(false);
                return;
            }
            // success -> dashboard
            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            console.error('AUTH DEBUG signIn error', err);
            setErrorMsg('Unexpected auth error, check server logs.');
        } finally {
            setLoading(false);
        }
    }

    async function handleCreateAccount(e: React.FormEvent) {
        e.preventDefault();
        setErrorMsg(null);
        setLoading(true);
        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const password = String(formData.get('password') || '');
        const confirmPassword = String(formData.get('confirmPassword') || '');

        if (password !== confirmPassword) {
            setErrorMsg("Passwords do not match");
            setLoading(false);
            return;
        }

        try {
            const r = await fetch('/api/auth/create-account', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });
            if (!r.ok) {
                const txt = await r.json(); // Assuming JSON error from my endpoint
                setErrorMsg(txt.error || 'Something went wrong while creating your account.');
                setLoading(false);
                return;
            }
            // auto-login
            const signRes = await signIn('credentials', { redirect: false, email, password });
            if (!signRes || signRes.error) {
                setErrorMsg(signRes?.error || 'Account created but auto-login failed.');
                setLoading(false);
                return;
            }
            router.push('/dashboard');
            router.refresh();
        } catch (err) {
            console.error('AUTH DEBUG create error', err);
            setErrorMsg('Something went wrong, check server logs.');
        } finally {
            setLoading(false);
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

            <form onSubmit={isLogin ? handleSignIn : handleCreateAccount}>
                <div className="grid gap-4">
                    {!isLogin && (
                        <div className="grid gap-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="John Doe"
                                type="text"
                                autoCapitalize="words"
                                autoComplete="name"
                                autoCorrect="off"
                                disabled={loading}
                                required
                            />
                        </div>
                    )}
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={loading}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            placeholder="••••••••"
                            type="password"
                            autoCapitalize="none"
                            autoComplete={isLogin ? "current-password" : "new-password"}
                            disabled={loading}
                            required
                        />
                    </div>
                    {!isLogin && (
                        <div className="grid gap-2">
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                                id="confirmPassword"
                                name="confirmPassword"
                                placeholder="••••••••"
                                type="password"
                                autoCapitalize="none"
                                autoComplete="new-password"
                                disabled={loading}
                                required
                            />
                        </div>
                    )}
                    {errorMsg && <p className="text-sm text-destructive">{errorMsg}</p>}
                    <Button disabled={loading}>
                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
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
                                setErrorMsg(null);
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
                                setErrorMsg(null);
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
