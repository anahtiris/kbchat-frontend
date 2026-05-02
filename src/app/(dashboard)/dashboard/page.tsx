"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/api/inventory-service";
import { useAuth } from "@/components/features/auth/auth-context";
import { useTranslation } from "@/lib/i18n/context";
import { ArrowRight } from "lucide-react";
import { getExpiryDays, getExpiryStatus } from "@/lib/expiry";

function getGreetingKey(t: ReturnType<typeof useTranslation>["t"]): string {
    const h = new Date().getHours();
    if (h < 12) return t.dashboard.goodMorning;
    if (h < 17) return t.dashboard.goodAfternoon;
    return t.dashboard.goodEvening;
}

interface Alert {
    id: string;
    severity: "high" | "warn";
    message: string;
}

export default function DashboardPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [dateStr, setDateStr] = useState("");
    const [greeting, setGreeting] = useState("");

    useEffect(() => {
        inventoryService.getItems().then(setItems);
        const now = new Date();
        setDateStr(now.toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
        setGreeting(getGreetingKey(t));
    }, []);

    const alerts: Alert[] = [];

    for (const item of items) {
        const expiryStatus = getExpiryStatus(item.nearest_expiry, item);
        const days = getExpiryDays(item.nearest_expiry);
        if (expiryStatus === "expired") {
            alerts.push({ id: `exp-${item.id}`, severity: "high", message: `${item.name} has expired` });
        } else if (expiryStatus === "critical") {
            alerts.push({ id: `expiring-${item.id}`, severity: "high", message: `${item.name} expires in ${days} day${days !== 1 ? "s" : ""}` });
        } else if (expiryStatus === "soon") {
            alerts.push({ id: `expiring-${item.id}`, severity: "warn", message: `${item.name} expires in ${days} day${days !== 1 ? "s" : ""}` });
        }

        if (item.quantity <= 0) {
            alerts.push({ id: `out-${item.id}`, severity: "high", message: `${item.name} is out of stock` });
        } else if (item.min_threshold !== undefined && item.quantity <= item.min_threshold) {
            alerts.push({ id: `low-${item.id}`, severity: "warn", message: `${item.name} is low (${item.quantity} ${item.unit} remaining)` });
        }
    }

    const firstName = user?.name ? user.name.split(" ")[0] : "";

    return (
        <div className="space-y-6 max-w-2xl">
            {/* Greeting */}
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                    {greeting}{firstName ? `, ${firstName}` : ""}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{dateStr}</p>
            </div>

            {/* Needs attention */}
            {alerts.length > 0 ? (
                <div className="rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10 overflow-hidden">
                    <div className="flex items-center gap-3 px-5 py-4 border-b border-red-200 dark:border-red-900/30">
                        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse shrink-0" />
                        <span className="font-semibold text-red-800 dark:text-red-300">{t.dashboard.needsAttention}</span>
                        <span className="ml-auto text-xs text-red-600 dark:text-red-400">{alerts.length} items</span>
                    </div>
                    <div className="divide-y divide-red-100 dark:divide-red-900/20">
                        {alerts.map((a) => (
                            <div key={a.id} className="flex items-center gap-3 px-5 py-3">
                                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.severity === "high" ? "bg-red-500" : "bg-amber-400"}`} />
                                <span className="text-sm text-slate-700 dark:text-slate-300 flex-1">{a.message}</span>
                            </div>
                        ))}
                    </div>
                    <div className="px-5 py-3 border-t border-red-100 dark:border-red-900/20">
                        <Link href="/inventory" className="inline-flex items-center gap-1.5 text-sm font-medium text-red-700 dark:text-red-400 hover:underline">
                            {t.dashboard.reviewInventory}
                            <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                    </div>
                </div>
            ) : items.length > 0 ? (
                <div className="rounded-xl border border-green-200 dark:border-green-900/30 bg-green-50/50 dark:bg-green-900/10 p-5">
                    <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-green-500 shrink-0" />
                        <span className="font-semibold text-green-800 dark:text-green-300">{t.dashboard.allGood}</span>
                        <span className="text-sm text-green-700 dark:text-green-400">{t.dashboard.noAlerts}</span>
                    </div>
                </div>
            ) : null}
        </div>
    );
}
