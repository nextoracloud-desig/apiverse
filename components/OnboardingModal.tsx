"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Search, Heart, Key, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export function OnboardingModal({ onboarded }: { onboarded: boolean }) {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(1);
    const router = useRouter();

    useEffect(() => {
        if (!onboarded) {
            setOpen(true);
        }
    }, [onboarded]);

    const handleComplete = async () => {
        setOpen(false);
        // Call server action to update onboarded status
        await fetch("/api/user/onboard", { method: "POST" });
        router.refresh();
    };

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
        else handleComplete();
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleComplete()}>
            <DialogContent className="sm:max-w-md bg-background border shadow-lg z-50">
                <DialogHeader>
                    <DialogTitle className="text-2xl text-center">Welcome to APIverse! 🚀</DialogTitle>
                    <DialogDescription className="text-center pt-2">
                        Get started with your API journey in 3 simple steps.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center py-6 space-y-6">
                    {step === 1 && (
                        <div className="text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mx-auto bg-primary/10 p-4 rounded-full w-20 h-20 flex items-center justify-center text-primary">
                                <Search className="h-10 w-10" />
                            </div>
                            <h3 className="font-semibold text-lg">1. Discover APIs</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                Browse over 1700+ curated APIs. Use filters and semantic search to find exactly what you need.
                            </p>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mx-auto bg-red-100 p-4 rounded-full w-20 h-20 flex items-center justify-center text-red-500">
                                <Heart className="h-10 w-10 fill-red-500" />
                            </div>
                            <h3 className="font-semibold text-lg">2. Save Favorites</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                Bookmark APIs you like. They'll be saved to your personal dashboard for quick access.
                            </p>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="text-center space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mx-auto bg-blue-100 p-4 rounded-full w-20 h-20 flex items-center justify-center text-blue-500">
                                <Key className="h-10 w-10" />
                            </div>
                            <h3 className="font-semibold text-lg">3. Generate Keys</h3>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
                                Create secure internal proxy keys for any supported API directly from the details page.
                            </p>
                        </div>
                    )}

                    <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className={`h-2 w-2 rounded-full transition-colors ${step === i ? "bg-primary" : "bg-muted"}`} />
                        ))}
                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between w-full">
                    {step < 3 && (
                        <Button variant="ghost" onClick={handleComplete} className="mr-auto">
                            Skip
                        </Button>
                    )}
                    <Button onClick={handleNext} className="ml-auto sm:ml-0 w-full sm:w-auto min-w-[150px]">
                        {step === 3 ? "Let's Go!" : "Next"} <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
