export const dynamic = "force-dynamic";
export const runtime = "nodejs";

import { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/auth/auth-form";
import { RocketIcon } from "lucide-react";

export const metadata: Metadata = {
    title: "Authentication | APIverse",
    description: "Login to your APIverse account",
};

export default function AuthenticationPage() {
    return (
        <div className="container relative h-[800px] flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
            <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
                <div className="absolute inset-0 bg-zinc-900" />
                <div className="relative z-20 flex items-center text-lg font-medium">
                    <RocketIcon className="mr-2 h-6 w-6" />
                    APIverse <span className="ml-2 text-xs text-zinc-400">v2.0 now live</span>
                </div>
                <div className="relative z-20 mt-auto">
                    <div className="space-y-6">
                        <h1 className="text-4xl font-bold tracking-tight">
                            Your API command center <br />
                            <span className="text-blue-400">in one dashboard</span>
                        </h1>
                        <p className="text-lg text-zinc-300">
                            Discover, test, and manage all your API integrations in a single unified platform.
                            Stop wrestling with scattered documentation and keys.
                        </p>
                        <ul className="space-y-2 text-sm text-zinc-400">
                            <li className="flex items-center">
                                <span className="mr-2 text-blue-500">✓</span> Instant access to premium APIs
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2 text-blue-500">✓</span> Unified billing and usage tracking
                            </li>
                            <li className="flex items-center">
                                <span className="mr-2 text-blue-500">✓</span> Smart AI-powered recommendations
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
            <div className="p-4 lg:p-8 h-full flex items-center justify-center">
                <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
                    <div className="flex flex-col space-y-2 text-center">
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Sign In to your account
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            Enter your email below to sign in or create a new account
                        </p>
                    </div>
                    <AuthForm />
                    <p className="px-8 text-center text-sm text-muted-foreground">
                        By clicking continue, you agree to our{" "}
                        <Link
                            href="/terms"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link
                            href="/privacy"
                            className="underline underline-offset-4 hover:text-primary"
                        >
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </div>
            </div>
        </div>
    );
}
