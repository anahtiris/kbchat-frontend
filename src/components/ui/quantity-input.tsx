"use client";

import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuantityInputProps {
    value: number;
    onChange: (value: number) => void;
    min?: number;
    max?: number;
    step?: number;
    disabled?: boolean;
    className?: string;
}

export function QuantityInput({ value, onChange, min = 0, max, step = 1, disabled, className }: QuantityInputProps) {
    const decrement = () => {
        const next = value - step;
        if (next >= min) onChange(next);
    };

    const increment = () => {
        const next = value + step;
        if (max === undefined || next <= max) onChange(next);
    };

    return (
        <div className={cn("inline-flex items-center rounded-md border border-slate-200 bg-white", disabled && "opacity-50 pointer-events-none", className)}>
            <button
                type="button"
                onClick={decrement}
                disabled={disabled || value <= min}
                className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-l-md transition-colors"
            >
                <Minus className="h-3 w-3" />
            </button>
            <span className="w-10 text-center text-sm font-medium text-slate-900 select-none">
                {value}
            </span>
            <button
                type="button"
                onClick={increment}
                disabled={disabled || (max !== undefined && value >= max)}
                className="flex h-8 w-8 items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed rounded-r-md transition-colors"
            >
                <Plus className="h-3 w-3" />
            </button>
        </div>
    );
}
