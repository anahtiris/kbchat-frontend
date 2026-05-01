"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ConsumableRow } from "./consumable-row";
import { inventoryService } from "@/lib/api/inventory-service";
import { ConsumableLineItem, InventoryItem, Procedure, ProcedureExecution, StockStatus } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/context";

interface ProcedureRunnerProps {
    procedure: Procedure;
    items: InventoryItem[];
    onClose: () => void;
    onSuccess: (execution: ProcedureExecution, updatedItems: InventoryItem[]) => void;
}

function computeStatus(currentStock: number, adjustedQty: number, minThreshold?: number): StockStatus {
    if (currentStock <= 0) return "out";
    if (minThreshold !== undefined && currentStock - adjustedQty < minThreshold) return "low";
    return "ok";
}

export function ProcedureRunner({ procedure, items, onClose, onSuccess }: ProcedureRunnerProps) {
    const { t } = useTranslation();
    const [lines, setLines] = useState<ConsumableLineItem[]>([]);
    const [isConfirming, setIsConfirming] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Build lines from procedure consumables + live stock
    useEffect(() => {
        const built = inventoryService.buildConsumableLineItems(procedure);
        // Sync with the items prop passed from the parent (which may be more up-to-date)
        const synced = built.map((line) => {
            const item = items.find((i) => i.id === line.item_id);
            if (!item) return line;
            return {
                ...line,
                current_stock: item.quantity,
                min_threshold: item.min_threshold,
                status: computeStatus(item.quantity, line.adjusted_quantity, item.min_threshold),
            };
        });
        setLines(synced);
    }, [procedure, items]);

    const handleLineChange = (updated: ConsumableLineItem) => {
        setLines((prev) => prev.map((l) => (l.item_id === updated.item_id ? updated : l)));
    };

    const checkedLines = lines.filter((l) => l.checked);
    const blockedCount = checkedLines.filter((l) => !l.is_optional && l.status === "out").length;
    const lowCount = checkedLines.filter((l) => l.status === "low").length;
    const canConfirm = blockedCount === 0 && checkedLines.length > 0 && !isConfirming;

    const handleConfirm = async () => {
        setError(null);
        setIsConfirming(true);
        try {
            const execution = await inventoryService.executeProcedure(procedure.id, lines);
            const updatedItems = await inventoryService.getItems();
            onSuccess(execution, updatedItems);
        } catch {
            setError(t.procedures.executionError);
            setIsConfirming(false);
        }
    };

    return (
        <Dialog open={true} onClose={isConfirming ? () => {} : onClose}>
            <div className="w-[520px] max-w-[90vw] space-y-4 pt-1">
                <div>
                    <h3 className="text-lg font-bold text-slate-900">{t.procedures.runnerTitle}</h3>
                    <p className="text-sm text-slate-500">{procedure.name} — {t.procedures.runnerSubtitle}</p>
                </div>

                <div className="rounded-lg border border-slate-200 divide-y divide-slate-100 overflow-hidden">
                    <div className="grid grid-cols-[1rem_1fr_auto_auto] gap-3 px-4 py-2 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                        <span />
                        <span>Item</span>
                        <span className="hidden sm:block">Status</span>
                        <span>Qty</span>
                    </div>
                    {lines.length === 0 ? (
                        <p className="p-4 text-sm text-slate-400 italic">{t.procedures.noConsumables}</p>
                    ) : (
                        lines.map((line) => (
                            <ConsumableRow
                                key={line.item_id}
                                line={line}
                                onChange={handleLineChange}
                                disabled={isConfirming}
                            />
                        ))
                    )}
                </div>

                {/* Alerts */}
                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}
                {blockedCount > 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {t.procedures.outOfStockError.replace("{n}", String(blockedCount))}
                    </div>
                )}
                {lowCount > 0 && blockedCount === 0 && (
                    <div className="flex items-center gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-700 border border-amber-100">
                        <AlertTriangle className="h-4 w-4 shrink-0" />
                        {t.procedures.lowStockWarning.replace("{n}", String(lowCount))}
                    </div>
                )}

                <div className="flex justify-end gap-2 border-t border-slate-100 pt-3">
                    <Button variant="ghost" onClick={onClose} disabled={isConfirming}>
                        {t.common.cancel}
                    </Button>
                    <Button
                        onClick={handleConfirm}
                        disabled={!canConfirm}
                        className="bg-blue-600 hover:bg-blue-700 min-w-[160px]"
                    >
                        {isConfirming ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.common.saving}</>
                        ) : (
                            <><CheckCircle2 className="mr-2 h-4 w-4" />{t.procedures.confirmDeduct}</>
                        )}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
