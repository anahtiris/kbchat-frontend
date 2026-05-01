"use client";

import { useState } from "react";
import { AlertCircle, Loader2, ArrowUp, ArrowDown } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/api/inventory-service";
import { useTranslation } from "@/lib/i18n/context";

type AdjustMode = "receive" | "adjust";

interface StockAdjustmentDialogProps {
    item: InventoryItem;
    mode: AdjustMode;
    onClose: () => void;
    onSuccess: (updated: InventoryItem) => void;
}

export function StockAdjustmentDialog({ item, mode, onClose, onSuccess }: StockAdjustmentDialogProps) {
    const { t } = useTranslation();
    const [qty, setQty] = useState("");
    const [delta, setDelta] = useState<"add" | "subtract">("add");
    const [notes, setNotes] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const parsedQty = parseFloat(qty);
    const isValid = !isNaN(parsedQty) && parsedQty > 0;

    const handleSave = async () => {
        if (!isValid) { setError(t.inventory.quantityMustBePositive); return; }
        setError(null);
        setIsSaving(true);
        try {
            let updated: InventoryItem;
            if (mode === "receive") {
                updated = await inventoryService.receiveStock(item.id, parsedQty, notes || undefined);
            } else {
                const sign = delta === "add" ? 1 : -1;
                updated = await inventoryService.adjustStock(item.id, sign * parsedQty, notes);
            }
            onSuccess(updated);
        } catch {
            setError(t.common.unknownError);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog open={true} onClose={isSaving ? () => {} : onClose}>
            <div className="w-80 space-y-4 pt-1">
                <div>
                    <h3 className="font-bold text-slate-900">
                        {mode === "receive" ? t.inventory.receiveStock : t.inventory.adjustStock}
                    </h3>
                    <p className="text-sm text-slate-500">{item.name}</p>
                </div>

                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {error}
                    </div>
                )}

                {mode === "adjust" && (
                    <div className="flex rounded-lg border border-slate-200 overflow-hidden">
                        <button
                            onClick={() => setDelta("add")}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors ${delta === "add" ? "bg-green-50 text-green-700" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                            <ArrowUp className="h-4 w-4" /> Add
                        </button>
                        <button
                            onClick={() => setDelta("subtract")}
                            className={`flex flex-1 items-center justify-center gap-1.5 py-2 text-sm font-medium transition-colors border-l border-slate-200 ${delta === "subtract" ? "bg-red-50 text-red-700" : "text-slate-500 hover:bg-slate-50"}`}
                        >
                            <ArrowDown className="h-4 w-4" /> Remove
                        </button>
                    </div>
                )}

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">
                        {t.inventory.quantity} ({item.unit})
                    </label>
                    <Input
                        type="number"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                        placeholder="0"
                        min={1}
                        autoFocus
                    />
                    <p className="text-xs text-slate-400">
                        Current stock: {item.quantity} {item.unit}
                        {isValid && (
                            <> → {mode === "receive"
                                ? item.quantity + parsedQty
                                : Math.max(0, item.quantity + (delta === "add" ? parsedQty : -parsedQty))
                            } {item.unit}</>
                        )}
                    </p>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-700">{t.inventory.reason}</label>
                    <Input
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder={mode === "receive" ? "e.g. Monthly restock from supplier" : "e.g. Damaged items removed"}
                    />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <Button variant="ghost" onClick={onClose} disabled={isSaving}>{t.common.cancel}</Button>
                    <Button onClick={handleSave} disabled={!isValid || isSaving} className="bg-blue-600 hover:bg-blue-700 min-w-[100px]">
                        {isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t.common.saving}</> : t.common.save}
                    </Button>
                </div>
            </div>
        </Dialog>
    );
}
