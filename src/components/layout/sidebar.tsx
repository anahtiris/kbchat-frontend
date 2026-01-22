"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/features/auth/auth-context";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { useLayout } from "@/components/layout/layout-context";
import { LayoutDashboard, MessageSquare, FileText, Settings, LogOut, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const { isMobileMenuOpen, setMobileMenuOpen } = useLayout();

    if (!user) return null;

    const links = [
        {
            name: t.nav.chat,
            href: "/dashboard",
            icon: MessageSquare,
            role: ["admin", "doctor", "staff"]
        },
        {
            name: t.nav.documents,
            href: "/documents",
            icon: FileText,
            role: ["admin"]
        },
        {
            name: t.nav.settings,
            href: "/settings",
            icon: Settings,
            role: ["admin"]
        }
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm md:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <div className={cn(
                "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out md:static md:translate-x-0",
                isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="flex h-16 items-center justify-between px-6 font-bold tracking-wider">
                    <div className="flex items-center">
                        <LayoutDashboard className="mr-2 h-6 w-6 text-blue-400" />
                        ONDA<span className="text-blue-400">MED</span>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="md:hidden text-white hover:bg-slate-800 hover:text-blue-400"
                        onClick={() => setMobileMenuOpen(false)}
                    >
                        <X className="h-6 w-6" />
                    </Button>
                </div>

                <div className="flex-1 space-y-1 px-3 py-4">
                    {links.map((link) => {
                        if (!link.role.includes(user.role)) return null;

                        const isActive = pathname === link.href;

                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setMobileMenuOpen(false)}
                                className={cn(
                                    "group flex w-full items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-slate-800 hover:text-white",
                                    isActive ? "bg-slate-800 text-blue-400" : "text-slate-400"
                                )}
                            >
                                <link.icon className={cn("mr-3 h-5 w-5", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white")} />
                                {link.name}
                            </Link>
                        );
                    })}
                </div>

                <div className="border-t border-slate-800 p-4">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-xs font-bold">
                            {user.name.charAt(0)}
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate text-sm font-medium text-white">{user.name}</p>
                            <p className="truncate text-xs text-slate-400 capitalize">{user.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => logout()}
                        className="flex w-full items-center justify-center rounded-md border border-slate-700 p-2 text-xs text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                        <LogOut className="mr-2 h-3 w-3" /> {t.nav.signOut}
                    </button>
                </div>
            </div>
        </>
    );
}
