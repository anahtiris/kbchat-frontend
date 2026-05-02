"use client";

import { useState } from "react";
import { AlertCircle, Loader2, ArrowUp, ArrowDown, CalendarX2 } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/api/inventory-service";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

type Direction = "add" | "remove" | "expire";

interface StockAdjustmentDialogProps {
    item: InventoryItem;
    onClose: () => void;
    onSuccess: (updated: InventoryItem) => void;
}

const inputCls =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";
const labelCls = "text-sm font-medium text-slate-700 dark:text-slate-300";

export function StockAdjustmentDialog({ item, onClose, onSuccess }: StockAdjustmentDialogProps) {
    const { t } = useTranslation();
    const [direction, setDirection] = useState<Direction>("add");
    const [qty, setQty] = useState("");
    const [lotNumber, setLotNumber] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parsedQty = parseFloat(qty);
    const isValid = !isNaN(parsedQty) && parsedQty > 0;
    const newQty = isValid
        ? direction === "add"
            ? item.quantity + parsedQty
            : Math.max(0, item.quantity - parsedQty)
        : null;

    const handleSave = async () => {
        if (!isValid) { setError(t.inventory.quantityMustBePositive); return; }
        setError(null);
        setIsSaving(true);
        try {
            let updated: InventoryItem;
            if (direction === "add") {
                updated = await inventoryService.adjustStock(item.id, parsedQty, notes, {
                    lot_number: lotNumber || undefined,
                    expiry_date: expiryDate || undefined,
                });
            } else if (direction === "remove") {
                updated = await inventoryService.adjustStock(item.id, -parsedQty, notes);
            } else {
                updated = await inventoryService.expireStock(item.id, parsedQty, notes || undefined, lotNumber || undefined);
            }
            onSuccess(updated);
        } catch {
            setError(t.common.unknownError);
        } finally {
            setIsSaving(false);
        }
    };

    const directionBtn = (d: Direction, icon: React.ReactNode, label: string, active: string, border = true) => (
        <button
            onClick={() => setDirection(d)}
            className={cn(
                "flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors",
                border && "border-l border-slate-200 dark:border-slate-700",
                direction === d ? active : "text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
        >
            {icon} {label}
        </button>
    );

    return (
        <Dialog open={true} onClose={isSaving ? () => {} : onClose}>
            <div className="w-80 space-y-4 pt-1">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-slate-100">{t.inventory.stockMovement}</h3>
                    <p className="text-sm text-slate-500">{item.name}</p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100 dark:bg-red-900/20 dark:border-red-900/40 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {/* Direction toggle */}
                <div className="flex rounded-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
                    {directionBtn("add",    <ArrowUp className="h-3.5 w-3.5" />,    t.inventory.directionAdd,    "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-400", false)}
                    {directionBtn("remove", <ArrowDown className="h-3.5 w-3.5" />,  t.inventory.directionRemove, "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400")}
                    {directionBtn("expire", <CalendarX2 className="h-3.5 w-3.5" />, t.inventory.expireStock,     "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400")}
                </div>

                {/* Quantity */}
                <div className="space-y-1.5">
                    <label className={labelCls}>{t.inventory.quantity} ({item.unit})</label>
                    <Input type="number" value={qty} onChange={(e) => setQty(e.target.value)} placeholder="0" min={1} autoFocus />
                    {newQty !== null && (
                        <p className="text-xs text-slate-400">{item.quantity} → {newQty} {item.unit}</p>
                    )}
                </div>

                {/* Lot + Expiry — only when adding */}
                {direction === "add" && (
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className={labelCls}>{t.inventory.lotNumber}</label>
                            <input className={inputCls} value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} placeholder="Optional" />
                        </div>
                        <div className="space-y-1.5">
                            <label className={labelCls}>{t.inventory.expiryDate}</label>
                            <input className={inputCls} type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
                        </div>
                    </div>
                )}

                {/* Lot reference — only when expiring */}
                {direction === "expire" && (
                    <div className="space-y-1.5">
                        <label className={labelCls}>{t.inventory.lotNumber}</label>
                        <input className={inputCls} value={lotNumber} onChange={(e) => setLotNumber(e.target.value)} placeholder="Optional" />
                    </div>
                )}

                {/* Notes */}
                <div className="space-y-1.5">
                    <label className={labelCls}>{t.inventory.reason}</label>
                    <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={
                            direction === "add" ? "e.g. Monthly restock" :
                            direction === "expire" ? "e.g. Past expiry date" :
                            "e.g. Damaged items removed"
                        }
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>{t.common.cancel}</Button>
                    <Button
                        onClick={handleSave}
                        disabled={!isValid || isSaving}
                        className={cn(
                            "min-w-[100px]",
                            direction === "expire" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
                        )}
                    >
                        {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.common.saving}</> : t.common.save}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
