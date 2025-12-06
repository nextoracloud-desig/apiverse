"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Compass, Key, LayoutDashboard } from "lucide-react";
import { useRouter } from "next/navigation";

export function OnboardingTour() {
    const [open, setOpen] = useState(false);
    const [step, setStep] = useState(0);
    const router = useRouter();

    useEffect(() => {
        // Check local storage
        const hasSeenTour = localStorage.getItem("apiverse_tour_seen");
        if (!hasSeenTour) {
            // Small delay to allow fade in
            setTimeout(() => setOpen(true), 1000);
        }
    }, []);

    const handleNext = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            handleComplete();
        }
    };

    const handleComplete = () => {
        localStorage.setItem("apiverse_tour_seen", "true");
        setOpen(false);
    };

    const steps = [
        {
            title: "Welcome to Apiverse",
            description: "Your new developer-first API command center. Let's get you set up.",
            icon: <LayoutDashboard className="h-12 w-12 text-primary mb-4" />,
            action: () => { }
        },
        {
            title: "Discover APIs",
            description: "Browse 1000+ APIs with reliability scores and lock-in analysis on the Explore page.",
            icon: <Compass className="h-12 w-12 text-blue-500 mb-4" />,
            action: () => { }
        },
        {
            title: "Get Your Portal Key",
            description: "Generate a universal internal key to track usage across multiple providers.",
            icon: <Key className="h-12 w-12 text-amber-500 mb-4" />,
            action: () => router.push("/keys")
        }
    ];

    const currentStep = steps[step];

    return (
        <Dialog open={open} onOpenChange={(val) => !val && handleComplete()}>
            <DialogContent className="sm:max-w-md text-center">
                <DialogHeader className="flex flex-col items-center">
                    {currentStep.icon}
                    <DialogTitle className="text-xl">{currentStep.title}</DialogTitle>
                    <DialogDescription className="text-base mt-2">
                        {currentStep.description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="sm:justify-center mt-4">
                    <div className="flex gap-2 w-full justify-center">
                        {step > 0 && (
                            <Button variant="ghost" onClick={() => setStep(step - 1)}>
                                Back
                            </Button>
                        )}
                        <Button onClick={handleNext} className="w-full sm:w-auto">
                            {step === steps.length - 1 ? "Get Started" : "Next"}
                        </Button>
                    </div>
                </DialogFooter>
                <div className="flex justify-center gap-1 mt-2">
                    {steps.map((_, i) => (
                        <div
                            key={i}
                            className={`h-2 w-2 rounded-full transition-colors ${i === step ? "bg-primary" : "bg-muted"}`}
                        />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
}
