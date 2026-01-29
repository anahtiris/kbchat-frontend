"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/features/auth/auth-context";
import { DocumentList } from "@/components/features/documents/document-list";
import { ServiceManager } from "@/components/features/documents/service-manager";
import { Loader2, FileText, Database } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/constants/auth";

export default function DocumentsPage() {
    const { user, isLoading } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<"manuals" | "services">("services");

    useEffect(() => {
        if (!isLoading && user && user.role !== ROLES.ADMIN) {
            router.push("/dashboard");
        }
    }, [user, isLoading, router]);

    if (isLoading) return null;
    if (!user || user.role !== ROLES.ADMIN) {
        return (
            <div className="flex h-full items-center justify-center text-slate-400">
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying permissions...
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-2">
                <div className="flex gap-4">
                    <button
                        onClick={() => setActiveTab("services")}
                        className={cn(
                            "flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium transition-colors",
                            activeTab === "services"
                                ? "border-slate-900 text-slate-900"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <Database className="h-4 w-4" />
                        {t.docs.tabServices}
                    </button>
                    <button
                        onClick={() => setActiveTab("manuals")}
                        className={cn(
                            "flex items-center gap-2 border-b-2 px-1 pb-4 text-sm font-medium transition-colors",
                            activeTab === "manuals"
                                ? "border-slate-900 text-slate-900"
                                : "border-transparent text-slate-500 hover:text-slate-700"
                        )}
                    >
                        <FileText className="h-4 w-4" />
                        {t.docs.tabManuals}
                    </button>
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                {activeTab === "services" ? (
                    <ServiceManager />
                ) : (
                    <DocumentList />
                )}
            </div>
        </div>
    );
}
