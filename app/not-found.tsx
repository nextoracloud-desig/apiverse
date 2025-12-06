import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">404</h1>
            <h2 className="text-2xl font-semibold tracking-tight">Page Not Found</h2>
            <p className="text-muted-foreground max-w-[500px]">
                Sorry, the page you are looking for does not exist. It might have been moved or deleted.
            </p>
            <div className="flex gap-4 pt-4">
                <Button asChild>
                    <Link href="/dashboard">Back to Dashboard</Link>
                </Button>
                <Button variant="outline" asChild>
                    <Link href="/">Explore APIs</Link>
                </Button>
            </div>
        </div>
    );
}
