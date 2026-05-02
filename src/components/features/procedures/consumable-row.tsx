"use client";

import { ConsumableLineItem, StockStatus } from "@/lib/types";
import { QuantityInput } from "@/components/ui/quantity-input";
import { StockBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ConsumableRowProps {
    line: ConsumableLineItem;
    onChange: (updated: ConsumableLineItem) => void;
    disabled?: boolean;
}

function recomputeStatus(currentStock: number, adjustedQty: number, minThreshold?: number): StockStatus {
    if (currentStock <= 0) return "out";
    if (minThreshold !== undefined && currentStock - adjustedQty < minThreshold) return "low";
    return "ok";
}

export function ConsumableRow({ line, onChange, disabled }: ConsumableRowProps) {
    const handleQtyChange = (qty: number) => {
        onChange({
            ...line,
            adjusted_quantity: qty,
            status: recomputeStatus(line.current_stock, qty, line.min_threshold),
        });
    };

    const handleChecked = (checked: boolean) => {
        onChange({ ...line, checked });
    };

    return (
        <div className={cn(
            "flex items-center gap-3 px-4 py-3 transition-colors",
            !line.checked && "opacity-40",
            line.status === "out" && line.checked && !disabled && "bg-red-50 dark:bg-red-900/20",
            line.status === "low" && line.checked && !disabled && "bg-amber-50/40 dark:bg-amber-900/10",
        )}>
            {/* Optional checkbox */}
            <div className="h-4 w-4 shrink-0 flex items-center justify-center">
                {line.is_optional ? (
                    <input
                        type="checkbox"
                        checked={line.checked}
                        onChange={(e) => handleChecked(e.target.checked)}
                        disabled={disabled}
                        className="h-4 w-4 rounded border-slate-300 accent-blue-600 cursor-pointer"
                    />
                ) : (
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
                )}
            </div>

            {/* Item info */}
            <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {line.item_name}
                    {line.is_optional && (
                        <span className="ml-1.5 text-[10px] font-normal text-slate-400 uppercase tracking-wide">optional</span>
                    )}
                </p>
                <p className="text-xs text-slate-500">
                    {line.current_stock} {line.unit} in stock
                </p>
            </div>

            {/* Stock badge — hidden on small screens */}
            <StockBadge status={line.status} className="shrink-0 hidden sm:flex" />

            {/* Qty spinner */}
            <QuantityInput
                value={line.adjusted_quantity}
                onChange={handleQtyChange}
                min={line.is_optional ? 0 : 1}
                max={line.current_stock > 0 ? undefined : 0}
                disabled={disabled || (line.is_optional && !line.checked) || line.status === "out"}
            />
        </div>
    );
}
