"use client";

import { useState } from "react";
import { Package, Plus, ArrowDown, Settings2, RotateCcw } from "lucide-react";
import { InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { StockBadge } from "@/components/ui/badge";
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type AdjustTarget = { item: InventoryItem; mode: "receive" | "adjust" } | null;

interface InventoryListProps {
    items: InventoryItem[];
    isAdmin: boolean;
    onItemUpdated: (updated: InventoryItem) => void;
}

const CATEGORIES = ["injectable", "consumable", "topical", "solution", "equipment"];

function getStockStatus(item: InventoryItem) {
    if (item.quantity <= 0) return "out" as const;
    if (item.min_threshold !== undefined && item.quantity <= item.min_threshold) return "low" as const;
    return "ok" as const;
}

export function InventoryList({ items, isAdmin, onItemUpdated }: InventoryListProps) {
    const { t } = useTranslation();
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [adjustTarget, setAdjustTarget] = useState<AdjustTarget>(null);

    const filtered = items.filter((item) => {
        const matchCat = categoryFilter === "all" || item.category === categoryFilter;
        const status = getStockStatus(item);
        const matchStatus = statusFilter === "all" || status === statusFilter;
        return matchCat && matchStatus;
    });

    const outCount = items.filter((i) => getStockStatus(i) === "out").length;
    const lowCount = items.filter((i) => getStockStatus(i) === "low").length;

    return (
        <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
                {[
                    { label: "Total Items", value: items.length, color: "text-slate-900" },
                    { label: t.inventory.statusLow, value: lowCount, color: lowCount > 0 ? "text-amber-600" : "text-slate-900" },
                    { label: t.inventory.statusOut, value: outCount, color: outCount > 0 ? "text-red-600" : "text-slate-900" },
                ].map((card) => (
                    <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
                        <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters + Add */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">{t.inventory.filterCategory}</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">{t.inventory.stockStatus}</option>
                    <option value="ok">{t.inventory.statusOk}</option>
                    <option value="low">{t.inventory.statusLow}</option>
                    <option value="out">{t.inventory.statusOut}</option>
                </select>

                {(categoryFilter !== "all" || statusFilter !== "all") && (
                    <Button variant="ghost" size="sm" onClick={() => { setCategoryFilter("all"); setStatusFilter("all"); }} className="h-9 px-3 text-slate-500">
                        <RotateCcw className="mr-2 h-3 w-3" /> {t.common.clearFilters}
                    </Button>
                )}

                <div className="ml-auto text-xs text-slate-500">{filtered.length} items</div>

                {isAdmin && (
                    <Button className="bg-blue-600 hover:bg-blue-700 shrink-0">
                        <Plus className="mr-2 h-4 w-4" /> {t.inventory.addItem}
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <Package className="mx-auto mb-4 h-14 w-14 text-slate-200" />
                        <p className="text-slate-500">{t.inventory.noItems}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {/* Header */}
                        <div className="hidden sm:grid grid-cols-[2fr_1fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <span>{t.inventory.itemName}</span>
                            <span>{t.inventory.category}</span>
                            <span>{t.inventory.quantity}</span>
                            <span>{t.inventory.stockStatus}</span>
                            <span />
                        </div>

                        {filtered.map((item) => {
                            const status = getStockStatus(item);
                            return (
                                <div key={item.id} className={cn(
                                    "grid grid-cols-1 sm:grid-cols-[2fr_1fr_1fr_1fr_auto] gap-2 sm:gap-4 items-center px-5 py-3.5 hover:bg-slate-50 transition-colors",
                                    status === "out" && "bg-red-50/30",
                                )}>
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                                        {item.sku && <p className="text-xs text-slate-400">{item.sku}</p>}
                                    </div>
                                    <span className="text-sm text-slate-600 capitalize">{item.category}</span>
                                    <div>
                                        <span className="font-semibold text-slate-900">{item.quantity}</span>
                                        <span className="text-xs text-slate-400 ml-1">{item.unit}</span>
                                        {item.min_threshold !== undefined && (
                                            <p className="text-[11px] text-slate-400">min: {item.min_threshold}</p>
                                        )}
                                    </div>
                                    <StockBadge status={status} />
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost" size="sm"
                                            className="h-8 px-2 text-slate-500 hover:text-green-700 hover:bg-green-50"
                                            onClick={() => setAdjustTarget({ item, mode: "receive" })}
                                            title={t.inventory.receiveStock}
                                        >
                                            <ArrowDown className="h-3.5 w-3.5" />
                                        </Button>
                                        {isAdmin && (
                                            <Button
                                                variant="ghost" size="sm"
                                                className="h-8 px-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50"
                                                onClick={() => setAdjustTarget({ item, mode: "adjust" })}
                                                title={t.inventory.adjustStock}
                                            >
                                                <Settings2 className="h-3.5 w-3.5" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {adjustTarget && (
                <StockAdjustmentDialog
                    item={adjustTarget.item}
                    mode={adjustTarget.mode}
                    onClose={() => setAdjustTarget(null)}
                    onSuccess={(updated) => {
                        onItemUpdated(updated);
                        setAdjustTarget(null);
                    }}
                />
            )}
        </div>
    );
}
