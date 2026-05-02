"use client";

import { useState, useMemo } from "react";
import { Play, Layers, Search, Plus, Pencil } from "lucide-react";
import { Procedure, InventoryItem } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProcedureForm } from "./procedure-form";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface ProcedureListProps {
    procedures: Procedure[];
    availableItems: InventoryItem[];
    onRun: (procedure: Procedure) => void;
    isAdmin: boolean;
    onProcedureAdded: (proc: Procedure) => void;
    onProcedureUpdated: (proc: Procedure) => void;
}

function isBlocked(proc: Procedure, items: InventoryItem[]): boolean {
    return proc.consumables.some((c) => {
        if (c.is_optional) return false;
        const item = items.find((i) => i.id === c.item_id);
        return !item || item.quantity <= 0;
    });
}

export function ProcedureList({
    procedures,
    availableItems,
    onRun,
    isAdmin,
    onProcedureAdded,
    onProcedureUpdated,
}: ProcedureListProps) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [editProcedure, setEditProcedure] = useState<Procedure | undefined>(undefined);
    const [showForm, setShowForm] = useState(false);

    const categories = useMemo(() => {
        const cats = Array.from(new Set(procedures.map((p) => p.category).filter(Boolean) as string[])).sort();
        return ["All", ...cats];
    }, [procedures]);

    const filtered = procedures.filter((p) => {
        const matchSearch =
            !search ||
            p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.category?.toLowerCase().includes(search.toLowerCase());
        const matchCat = activeCategory === "All" || p.category === activeCategory;
        return matchSearch && matchCat;
    });

    const openCreate = () => { setEditProcedure(undefined); setShowForm(true); };
    const openEdit = (proc: Procedure) => { setEditProcedure(proc); setShowForm(true); };

    const handleSaved = (saved: Procedure) => {
        if (editProcedure) { onProcedureUpdated(saved); } else { onProcedureAdded(saved); }
        setShowForm(false);
        setEditProcedure(undefined);
    };

    return (
        <div className="space-y-4">
            {/* Search + Add */}
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={t.procedures.searchPlaceholder}
                        className="pl-9"
                    />
                </div>
                {isAdmin && (
                    <Button className="bg-blue-600 hover:bg-blue-700 shrink-0" onClick={openCreate}>
                        <Plus className="mr-2 h-4 w-4" /> {t.procedures.addProcedure}
                    </Button>
                )}
            </div>

            {/* Category tabs */}
            {categories.length > 1 && (
                <div className="flex flex-wrap gap-1.5">
                    {categories.map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={cn(
                                "rounded-full px-3.5 py-1 text-sm font-medium transition-colors",
                                activeCategory === cat
                                    ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                            )}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            )}

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 p-12 text-center">
                    <Layers className="mx-auto mb-4 h-12 w-12 text-slate-300 dark:text-slate-600" />
                    <p className="text-slate-500">{t.procedures.noProcedures}</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((proc) => {
                        const blocked = isBlocked(proc, availableItems);
                        return (
                            <div
                                key={proc.id}
                                className="flex flex-col rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5 shadow-sm hover:shadow-md transition-shadow"
                            >
                                {/* Header row: category + edit */}
                                <div className="flex items-center justify-between mb-3">
                                    {proc.category ? (
                                        <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:text-slate-400">
                                            {proc.category}
                                        </span>
                                    ) : <span />}
                                    {isAdmin && (
                                        <button
                                            onClick={() => openEdit(proc)}
                                            className="rounded p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-300"
                                            title={t.procedures.editProcedure}
                                        >
                                            <Pencil className="h-3.5 w-3.5" />
                                        </button>
                                    )}
                                </div>

                                {/* Name */}
                                <h4 className="font-bold text-slate-900 dark:text-slate-100 leading-snug text-base mb-3">
                                    {proc.name}
                                </h4>

                                {/* Consumable tags */}
                                {proc.consumables.length > 0 && (
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        {proc.consumables.slice(0, 4).map((c) => (
                                            <span
                                                key={c.item_id}
                                                className="inline-flex items-center rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[11px] text-slate-500 dark:text-slate-400"
                                            >
                                                {c.item_name}
                                            </span>
                                        ))}
                                        {proc.consumables.length > 4 && (
                                            <span className="inline-flex items-center rounded bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1.5 py-0.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                +{proc.consumables.length - 4}
                                            </span>
                                        )}
                                    </div>
                                )}

                                {proc.notes && (
                                    <p className="text-xs text-slate-400 dark:text-slate-500 line-clamp-2 mb-3">{proc.notes}</p>
                                )}

                                <div className="mt-auto space-y-3">
                                    {/* Status */}
                                    <div className="flex items-center gap-1.5">
                                        <span className={cn("w-1.5 h-1.5 rounded-full", blocked ? "bg-red-500" : "bg-green-500")} />
                                        <span className={cn("text-xs font-medium", blocked ? "text-red-600 dark:text-red-400" : "text-green-600 dark:text-green-400")}>
                                            {blocked ? t.procedures.blocked : t.procedures.ready}
                                        </span>
                                    </div>

                                    <Button
                                        className="w-full bg-blue-600 hover:bg-blue-700"
                                        onClick={() => onRun(proc)}
                                    >
                                        <Play className="mr-2 h-4 w-4" />
                                        {t.procedures.runProcedure}
                                    </Button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {showForm && (
                <ProcedureForm
                    procedure={editProcedure}
                    availableItems={availableItems}
                    onClose={() => { setShowForm(false); setEditProcedure(undefined); }}
                    onSaved={handleSaved}
                />
            )}
        </div>
    );
}
