"use client";

import * as React from "react";
// import * as TooltipPrimitive from "@radix-ui/react-tooltip"; // Removed to use custom implementation
import { cn } from "@/lib/utils";

// We need to install @radix-ui/react-tooltip
// If we can't install, I'll build a simple CSS-only one or use title attribute for MVP,
// but the prompt asked for "Tooltip explaining...".
// I'll assume I can install or write a simple custom one to avoid deps if I can.
// Let's write a simple custom one to keep deps low and speed high.

export const TooltipProvider = ({ children }: { children: React.ReactNode }) => (
    <div className="contents">{children}</div>
);

export const Tooltip = ({
    children,
    content,
    disabled = false
}: {
    children: React.ReactNode;
    content: string;
    disabled?: boolean;
}) => {
    const [isVisible, setIsVisible] = React.useState(false);

    if (!content) return <>{children}</>;

    return (
        <div
            className="relative inline-block"
            onMouseEnter={() => setIsVisible(true)}
            onMouseLeave={() => setIsVisible(false)}
        >
            {children}
            {isVisible && (
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-max max-w-[200px] rounded bg-slate-900 px-2 py-1 text-xs text-white shadow-md animate-in fade-in zoom-in-95">
                    {content}
                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
                </div>
            )}
        </div>
    );
};
