"use client";

import { useState, useEffect } from "react";
import { X, ArrowUp, ArrowDown, Settings2, AlertTriangle } from "lucide-react";
import { InventoryItem, StockMovement } from "@/lib/types";
import { inventoryService } from "@/lib/api/inventory-service";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface MovementHistoryPanelProps {
    item: InventoryItem;
    onClose: () => void;
}

function MovementIcon({ type }: { type: StockMovement["type"] }) {
    if (type === "receive") return <ArrowDown className="h-4 w-4 text-green-600" />;
    if (type === "consume") return <ArrowUp className="h-4 w-4 text-red-500" />;
    if (type === "adjust") return <Settings2 className="h-4 w-4 text-blue-500" />;
    return <AlertTriangle className="h-4 w-4 text-amber-500" />;
}

function movementLabel(type: StockMovement["type"], t: ReturnType<typeof useTranslation>["t"]) {
    if (type === "receive") return t.inventory.movementReceive;
    if (type === "consume") return t.inventory.movementConsume;
    if (type === "adjust") return t.inventory.movementAdjust;
    return t.inventory.movementExpire;
}

export function MovementHistoryPanel({ item, onClose }: MovementHistoryPanelProps) {
    const { t } = useTranslation();
    const [movements, setMovements] = useState<StockMovement[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        inventoryService.getMovements(item.id).then((data) => {
            setMovements(data);
            setIsLoading(false);
        });
    }, [item.id]);

    return (
        <>
            <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 flex w-full flex-col bg-white dark:bg-slate-900 shadow-2xl">
                <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5">
                    <div>
                        <h3 className="font-semibold text-slate-900 dark:text-slate-100">{t.inventory.movementHistory}</h3>
                        <p className="text-xs text-slate-500">{item.name}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <div className="flex items-center justify-center p-12">
                            <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent" />
                        </div>
                    ) : movements.length === 0 ? (
                        <div className="p-12 text-center text-slate-400 text-sm">No movement history found.</div>
                    ) : (
                        <div className="divide-y divide-slate-100 dark:divide-slate-800">
                            {movements.map((mv) => (
                                <div key={mv.id} className="flex items-start gap-3 px-5 py-3.5">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                                        <MovementIcon type={mv.type} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                                                {movementLabel(mv.type, t)}
                                            </span>
                                            <span
                                                className={cn(
                                                    "shrink-0 text-sm font-bold",
                                                    mv.quantity_delta > 0 ? "text-green-600" : "text-red-600"
                                                )}
                                            >
                                                {mv.quantity_delta > 0 ? "+" : ""}
                                                {mv.quantity_delta} {item.unit}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 truncate">{mv.performed_by}</p>
                                        {(mv.lot_number || mv.expiry_date) && (
                                            <div className="flex flex-wrap gap-2 mt-1">
                                                {mv.lot_number && (
                                                    <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                                                        Lot: {mv.lot_number}
                                                    </span>
                                                )}
                                                {mv.expiry_date && (
                                                    <span className="inline-flex items-center rounded bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 text-[11px] text-slate-600 dark:text-slate-300">
                                                        Exp: {mv.expiry_date}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                        {mv.notes && (
                                            <p className="text-xs text-slate-400 mt-0.5 italic">{mv.notes}</p>
                                        )}
                                        <p className="text-[11px] text-slate-400 mt-0.5">
                                            {new Date(mv.created_at).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
