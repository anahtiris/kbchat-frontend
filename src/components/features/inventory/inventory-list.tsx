"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { Package, Plus, RotateCcw, History, Pencil, Search, ArrowUpDown, ChevronDown, Check } from "lucide-react";
import { InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StockBadge } from "@/components/ui/badge";
import { StockAdjustmentDialog } from "./stock-adjustment-dialog";
import { ItemForm } from "./item-form";
import { MovementHistoryPanel } from "./movement-history-panel";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { getExpiryDays as calcExpiryDays, getExpiryStatus as calcExpiryStatus, EXPIRY_CRITICAL_DAYS, EXPIRY_WARNING_DAYS } from "@/lib/expiry";

interface InventoryListProps {
    items: InventoryItem[];
    isAdmin: boolean;
    onItemUpdated: (updated: InventoryItem) => void;
    onItemAdded: (item: InventoryItem) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
    injectable: "Injectables",
    consumable: "Consumables",
    topical: "Topicals",
    solution: "Solutions",
    equipment: "Equipment",
};

function getStockStatus(item: InventoryItem) {
    if (item.quantity <= 0) return "out" as const;
    if (item.min_threshold !== undefined && item.quantity <= item.min_threshold) return "low" as const;
    return "ok" as const;
}

function getExpiryStatus(item: InventoryItem) {
    return calcExpiryStatus(item.nearest_expiry, item);
}

function getExpiryDays(item: InventoryItem): number | null {
    return calcExpiryDays(item.nearest_expiry);
}

function StockBar({ item }: { item: InventoryItem }) {
    if (item.min_threshold === undefined || item.min_threshold <= 0) return null;
    const par = item.min_threshold * 2;
    const pct = Math.min(100, (item.quantity / par) * 100);
    const status = getStockStatus(item);
    return (
        <div className="mt-1.5 h-1 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
            <div
                className={cn(
                    "h-full rounded-full transition-all",
                    status === "out" ? "bg-red-500" : status === "low" ? "bg-amber-400" : "bg-green-500"
                )}
                style={{ width: `${pct}%` }}
            />
        </div>
    );
}

interface MultiSelectOption { value: string; label: string }

function MultiSelectDropdown({
    label,
    options,
    selected,
    onChange,
}: {
    label: string;
    options: MultiSelectOption[];
    selected: string[];
    onChange: (next: string[]) => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const toggle = (value: string) => {
        onChange(selected.includes(value) ? selected.filter((v) => v !== value) : [...selected, value]);
    };

    const buttonLabel = selected.length === 0
        ? label
        : selected.length === 1
            ? options.find((o) => o.value === selected[0])?.label ?? selected[0]
            : `${label} (${selected.length})`;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen((v) => !v)}
                className={cn(
                    "flex h-9 items-center gap-1.5 rounded-md border px-3 text-sm transition-colors",
                    selected.length > 0
                        ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                        : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                )}
            >
                <span>{buttonLabel}</span>
                <ChevronDown className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")} />
            </button>

            {open && (
                <div className="absolute left-0 top-full z-50 mt-1 min-w-[160px] rounded-md border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-lg">
                    {options.map((opt) => {
                        const active = selected.includes(opt.value);
                        return (
                            <button
                                key={opt.value}
                                onClick={() => toggle(opt.value)}
                                className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-left hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                <span className={cn(
                                    "flex h-4 w-4 shrink-0 items-center justify-center rounded border",
                                    active
                                        ? "border-blue-500 bg-blue-500"
                                        : "border-slate-300 dark:border-slate-600"
                                )}>
                                    {active && <Check className="h-3 w-3 text-white" />}
                                </span>
                                <span className="text-slate-700 dark:text-slate-300">{opt.label}</span>
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export function InventoryList({ items, isAdmin, onItemUpdated, onItemAdded }: InventoryListProps) {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState("");
    const [categoryFilters, setCategoryFilters] = useState<string[]>([]);
    const [statusFilters, setStatusFilters] = useState<string[]>([]);
    const [adjustTarget, setAdjustTarget] = useState<InventoryItem | null>(null);
    const [editItem, setEditItem] = useState<InventoryItem | undefined>(undefined);
    const [showItemForm, setShowItemForm] = useState(false);
    const [historyItem, setHistoryItem] = useState<InventoryItem | null>(null);

    const categories = useMemo(() => {
        const cats = Array.from(new Set(items.map((i) => i.category).filter(Boolean) as string[])).sort();
        return cats;
    }, [items]);

    const filtered = items.filter((item) => {
        const q = searchQuery.toLowerCase();
        const matchSearch =
            !q ||
            item.name.toLowerCase().includes(q) ||
            item.sku?.toLowerCase().includes(q) ||
            item.supplier_name?.toLowerCase().includes(q);
        const matchCat = categoryFilters.length === 0 || categoryFilters.includes(item.category);
        const status = getStockStatus(item);
        const matchStatus = statusFilters.length === 0 || statusFilters.includes(status);
        return matchSearch && matchCat && matchStatus;
    });

    const outCount = items.filter((i) => getStockStatus(i) === "out").length;
    const lowCount = items.filter((i) => getStockStatus(i) === "low").length;
    const expiredCount = items.filter((i) => getExpiryStatus(i) === "expired").length;
    const expiringSoonCount = items.filter((i) => getExpiryStatus(i) === "soon").length;
    const expiryAlertCount = expiredCount + expiringSoonCount;

    const openCreate = () => { setEditItem(undefined); setShowItemForm(true); };
    const openEdit = (item: InventoryItem) => { setEditItem(item); setShowItemForm(true); };

    const handleSaved = (saved: InventoryItem) => {
        if (editItem) { onItemUpdated(saved); } else { onItemAdded(saved); }
        setShowItemForm(false);
        setEditItem(undefined);
    };

    const hasFilters = searchQuery || categoryFilters.length > 0 || statusFilters.length > 0;

    return (
        <div className="space-y-4">
            {/* Summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: t.inventory.title, value: items.length, color: "text-slate-900 dark:text-slate-100" },
                    { label: t.inventory.statusLow, value: lowCount, color: lowCount > 0 ? "text-amber-600" : "text-slate-900 dark:text-slate-100" },
                    { label: t.inventory.statusOut, value: outCount, color: outCount > 0 ? "text-red-600" : "text-slate-900 dark:text-slate-100" },
                    {
                        label: t.inventory.expiringSoon,
                        value: expiryAlertCount,
                        color: expiredCount > 0 ? "text-red-600" : expiryAlertCount > 0 ? "text-amber-600" : "text-slate-900 dark:text-slate-100",
                    },
                ].map((card) => (
                    <div key={card.label} className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm text-center">
                        <p className={cn("text-2xl font-bold", card.color)}>{card.value}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{card.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters + Search + Add */}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-900 p-4">
                <div className="relative min-w-[180px] flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t.inventory.searchPlaceholder} className="pl-9 h-9" />
                </div>

                <MultiSelectDropdown
                    label={t.inventory.filterCategory}
                    options={categories.map((c) => ({ value: c, label: CATEGORY_LABELS[c] ?? c }))}
                    selected={categoryFilters}
                    onChange={setCategoryFilters}
                />

                <MultiSelectDropdown
                    label={t.inventory.stockStatus}
                    options={[
                        { value: "ok", label: t.inventory.statusOk },
                        { value: "low", label: t.inventory.statusLow },
                        { value: "out", label: t.inventory.statusOut },
                    ]}
                    selected={statusFilters}
                    onChange={setStatusFilters}
                />

                {hasFilters && (
                    <Button variant="ghost" size="sm" onClick={() => { setSearchQuery(""); setCategoryFilters([]); setStatusFilters([]); }} className="h-9 px-3 text-slate-500">
                        <RotateCcw className="mr-2 h-3 w-3" /> {t.common.clearFilters}
                    </Button>
                )}

                <div className="ml-auto text-xs text-slate-500">{filtered.length} items</div>

                {isAdmin && (
                    <Button className="bg-blue-600 hover:bg-blue-700 shrink-0" onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> {t.inventory.addItem}
                    </Button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-sm overflow-hidden">
                {filtered.length === 0 ? (
                    <div className="p-16 text-center">
                        <Package className="mx-auto mb-4 h-14 w-14 text-slate-200 dark:text-slate-700" />
                        <p className="text-slate-500">{t.inventory.noItems}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100 dark:divide-slate-800">
                        {/* Header */}
                        <div className="hidden sm:grid grid-cols-[2fr_1fr_80px_1fr_144px] gap-4 px-5 py-3 bg-slate-50 dark:bg-slate-800/50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                            <span>{t.inventory.itemName}</span>
                            <span>{t.inventory.quantity}</span>
                            <span>Expiry</span>
                            <span>{t.inventory.stockStatus}</span>
                            <span />
                        </div>

                        {filtered.map((item) => {
                            const status = getStockStatus(item);
                            const expiry = getExpiryStatus(item);
                            const days = getExpiryDays(item);
                            return (
                                <div
                                    key={item.id}
                                    className={cn(
                                        "grid grid-cols-1 sm:grid-cols-[2fr_1fr_80px_1fr_144px] gap-2 sm:gap-4 items-center px-5 py-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                                        status === "out" && "bg-red-50/30 dark:bg-red-900/10",
                                    )}
                                >
                                    {/* Name + SKU + expiry badge */}
                                    <div>
                                        <p className="font-semibold text-slate-900 dark:text-slate-100 text-sm flex items-center flex-wrap gap-1.5">
                                            {item.name}
                                            {expiry === "expired" && (
                                                <span className="inline-flex items-center rounded-full bg-red-100 dark:bg-red-900/40 px-1.5 py-0.5 text-[10px] font-medium text-red-700 dark:text-red-400">
                                                    {t.inventory.expired}
                                                </span>
                                            )}
                                            {expiry === "soon" && (
                                                <span className="inline-flex items-center rounded-full bg-amber-100 dark:bg-amber-900/40 px-1.5 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-400">
                                                    Exp. soon
                                                </span>
                                            )}
                                        </p>
                                        {item.sku && <p className="text-xs text-slate-400">{item.sku}</p>}
                                    </div>

                                    {/* Quantity + bar */}
                                    <div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="font-semibold text-slate-900 dark:text-slate-100">{item.quantity}</span>
                                            {item.min_threshold !== undefined && (
                                                <span className="text-xs text-slate-400">/ {item.min_threshold * 2}</span>
                                            )}
                                            <span className="text-xs text-slate-400 ml-0.5">{item.unit}</span>
                                        </div>
                                        <StockBar item={item} />
                                        {item.min_threshold !== undefined && (
                                            <p className="text-[11px] text-slate-400 mt-0.5">min {item.min_threshold}</p>
                                        )}
                                    </div>

                                    {/* Expiry days */}
                                    <div className="text-sm">
                                        {days !== null ? (
                                            <>
                                                <span className={cn(
                                                    "font-medium tabular-nums",
                                                    days < 0 ? "text-red-600 dark:text-red-400" :
                                                    days <= EXPIRY_CRITICAL_DAYS ? "text-orange-600 dark:text-orange-400" :
                                                    days <= EXPIRY_WARNING_DAYS ? "text-amber-600 dark:text-amber-400" :
                                                    "text-slate-600 dark:text-slate-400"
                                                )}>
                                                    {days < 0 ? `${Math.abs(days)}d ago` : `${days}d`}
                                                </span>
                                                <p className="text-[11px] text-slate-400">
                                                    {days < 0 ? "Expired" : days <= EXPIRY_CRITICAL_DAYS ? "Critical" : days <= EXPIRY_WARNING_DAYS ? "Soon" : "OK"}
                                                </p>
                                            </>
                                        ) : (
                                            <span className="text-slate-300 dark:text-slate-600">—</span>
                                        )}
                                    </div>

                                    {/* Status badge */}
                                    <StockBadge status={status} />

                                    {/* Actions */}
                                    <div className="flex gap-1 justify-end">
                                        <Button
                                            variant="ghost" size="sm"
                                            className="h-8 px-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                            onClick={() => setHistoryItem(item)}
                                            title={t.inventory.movementHistory}
                                        >
                                            <History className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button
                                            variant="ghost" size="sm"
                                            className="h-8 px-2 text-slate-500 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                                            onClick={() => setAdjustTarget(item)}
                                            title={t.inventory.adjustStock}
                                        >
                                            <ArrowUpDown className="h-3.5 w-3.5" />
                                        </Button>
                                        {isAdmin && (
                                            <Button
                                                variant="ghost" size="sm"
                                                className="h-8 px-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                                                onClick={() => openEdit(item)}
                                                title={t.inventory.editItem}
                                            >
                                                <Pencil className="h-3.5 w-3.5" />
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
                    item={adjustTarget}
                    onClose={() => setAdjustTarget(null)}
                    onSuccess={(updated) => { onItemUpdated(updated); setAdjustTarget(null); }}
                />
            )}

            {showItemForm && (
                <ItemForm
                    item={editItem}
                    onClose={() => { setShowItemForm(false); setEditItem(undefined); }}
                    onSaved={handleSaved}
                />
            )}

            {historyItem && (
                <MovementHistoryPanel item={historyItem} onClose={() => setHistoryItem(null)} />
            )}
        </div>
    );
}
