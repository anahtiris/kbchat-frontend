"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/components/features/auth/auth-context";
import { Sidebar } from "@/components/layout/sidebar";
import { TopBar } from "@/components/layout/top-bar";
import { Loader2 } from "lucide-react";
import { LayoutProvider } from "@/components/layout/layout-context";
import { useTranslation } from "@/lib/i18n/context";

function DashboardLayoutContent({ children }: { children: React.ReactNode }) {
    const { user, isLoading } = useAuth();
    const { t } = useTranslation();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && !user) {
            router.push("/login");
        }
    }, [user, isLoading, router]);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                <span className="font-medium text-slate-500 animate-pulse">{t.common.loading}</span>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-slate-950">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden">
                <TopBar />
                <main className="flex-1 overflow-auto p-6 dark:bg-slate-950">
                    {children}
                </main>
            </div>
        </div>
    );
}


export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <LayoutProvider>
            <DashboardLayoutContent>{children}</DashboardLayoutContent>
        </LayoutProvider>
    );
}
