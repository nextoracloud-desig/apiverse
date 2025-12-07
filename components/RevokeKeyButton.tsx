"use client";

import { revokeApiKey } from "@/actions/api-actions";
import { Button } from "@/components/ui/button";
import { Loader2, Trash2 } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function RevokeKeyButton({ keyId }: { keyId: string }) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRevoke = async () => {
        if (!confirm("Are you sure you want to revoke this key? apps using it will break.")) return;

        setLoading(true);
        try {
            await revokeApiKey(keyId);
            router.refresh(); // Refresh server component to show "Revoked" status
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleRevoke}
            disabled={loading}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            <span className="sr-only">Revoke</span>
        </Button>
    );
}
