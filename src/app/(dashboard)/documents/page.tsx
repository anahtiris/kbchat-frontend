"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/features/auth/auth-context";
import { DocumentList } from "@/components/features/documents/document-list";
import { Loader2 } from "lucide-react";

export default function DocumentsPage() {
    const { user, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && user && user.role !== "admin") {
            router.push("/dashboard");
        }
    }, [user, isLoading, router]);

    if (isLoading) return null;
    if (!user || user.role !== "admin") {
        return (
            <div className="flex h-full items-center justify-center text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying permissions...
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl">
            <DocumentList />
        </div>
    );
}
