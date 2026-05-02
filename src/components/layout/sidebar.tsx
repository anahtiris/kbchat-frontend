"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/features/auth/auth-context";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/lib/i18n/context";
import { useLayout } from "@/components/layout/layout-context";
import { Home, MessageSquare, FileText, Settings, LogOut, X, Package, Stethoscope, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROLES } from "@/lib/constants/auth";
import { inventoryService } from "@/lib/api/inventory-service";
import { useState, useEffect } from "react";
import { InventoryItem } from "@/lib/types";
import { getExpiryStatus } from "@/lib/expiry";

function useInventoryAlertCount() {
    const [count, setCount] = useState(0);

    useEffect(() => {
        inventoryService.getItems().then((items: InventoryItem[]) => {
            let n = 0;
            for (const item of items) {
                const isOut = item.quantity <= 0;
                const isLow = !isOut && item.min_threshold !== undefined && item.quantity <= item.min_threshold;
                const expiryStatus = getExpiryStatus(item.nearest_expiry, item);
                if (isOut) n++;
                if (isLow) n++;
                if (expiryStatus !== null) n++;
            }
            setCount(n);
        }).catch(() => {});
    }, []);

    return count;
}

export function Sidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const { t } = useTranslation();
    const { isMobileMenuOpen, setMobileMenuOpen } = useLayout();
    const inventoryAlertCount = useInventoryAlertCount();

    if (!user) return null;

    const links: { name: string; href: string; icon: React.ElementType; role: string[]; badge?: number }[] = [
        {
            name: t.nav.dashboard,
            href: "/dashboard",
            icon: Home,
            role: [ROLES.ADMIN, ROLES.VIEWER, ROLES.STAFF]
        },
        {
            name: t.nav.chat,
            href: "/chat",
            icon: MessageSquare,
            role: [ROLES.ADMIN, ROLES.VIEWER, ROLES.STAFF]
        },
        {
            name: t.nav.procedures,
            href: "/procedures",
            icon: Stethoscope,
            role: [ROLES.ADMIN, ROLES.STAFF]
        },
        {
            name: t.nav.inventory,
            href: "/inventory",
            icon: Package,
            role: [ROLES.ADMIN, ROLES.STAFF, ROLES.VIEWER],
            badge: inventoryAlertCount > 0 ? inventoryAlertCount : undefined,
        },
        {
            name: t.nav.documents,
            href: "/documents",
            icon: FileText,
            role: [ROLES.ADMIN]
        },
        {
            name: t.nav.settings,
            href: "/settings",
            icon: Settings,
            role: [ROLES.ADMIN, ROLES.STAFF, ROLES.VIEWER]
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
                {/* Brand */}
                <div className="flex h-16 items-center justify-between px-6 font-bold tracking-wider">
                    <div className="flex items-center">
                        <LayoutDashboard className="mr-2 h-6 w-6 text-blue-400" />
                        CLINIC<span className="text-blue-400">OS</span>
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

                {/* Nav */}
                <div className="flex-1 px-3 py-4 overflow-y-auto">
                    <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                        {t.nav.workspace}
                    </p>
                    <div className="space-y-0.5">
                        {links.map((link) => {
                            const hasPermission = link.role.includes(user.role) ||
                                user.roles?.some(r => link.role.includes(r as any));

                            if (!hasPermission) return null;

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
                                    <link.icon className={cn("mr-3 h-4 w-4 shrink-0", isActive ? "text-blue-400" : "text-slate-400 group-hover:text-white")} />
                                    <span className="flex-1">{link.name}</span>
                                    {link.badge ? (
                                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                                            {link.badge}
                                        </span>
                                    ) : null}
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* User profile + sign out */}
                <div className="border-t border-slate-800 p-4">
                    <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 p-3 mb-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-600 text-xs font-bold ring-2 ring-slate-700">
                            {user.name
                                ? user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
                                : user.email?.charAt(0).toUpperCase() || "?"}
                        </div>
                        <div className="flex flex-1 flex-col overflow-hidden text-left">
                            <p className="truncate text-sm font-semibold text-white leading-none mb-1">
                                {user.name}
                            </p>
                            <p className="truncate text-[10px] font-medium text-slate-400 uppercase tracking-tight">
                                {Array.isArray(user.roles) ? user.roles.join(" • ") : (user.role || "User")}
                            </p>
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
