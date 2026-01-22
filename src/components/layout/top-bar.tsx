"use client";

import { useAuth } from "@/components/features/auth/auth-context";
import { Bell, Menu } from "lucide-react";
import { LanguageSwitcher } from "./language-switcher";
import { useLayout } from "./layout-context";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

export function TopBar() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const { toggleMobileMenu } = useLayout();
    const envName = process.env.NEXT_PUBLIC_ENV_NAME;

    return (
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-4 sm:px-6">
            <div className="flex items-center gap-3">
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden -ml-2 text-slate-500"
                    onClick={toggleMobileMenu}
                >
                    <Menu className="h-5 w-5" />
                </Button>
                <div className="flex items-center gap-2">
                    <h1 className="text-lg font-semibold text-slate-900 truncate max-w-[150px] sm:max-w-none">
                        {t.common.appName}
                    </h1>
                    {envName && envName !== 'production' && (
                        <span className="rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800 border border-yellow-200">
                            {envName}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-4">
                <LanguageSwitcher />
                <button className="relative rounded-full p-1 text-slate-400 hover:text-slate-600">
                    <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    <Bell className="h-5 w-5" />
                </button>
            </div>
        </header>
    );
}
