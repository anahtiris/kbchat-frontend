import { cn } from "@/lib/utils";
import { StockStatus } from "@/lib/types";

interface BadgeProps {
    children: React.ReactNode;
    variant?: "default" | "blue" | "green" | "amber" | "red" | "slate";
    className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
    return (
        <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            variant === "default" && "bg-slate-100 text-slate-700",
            variant === "blue"    && "bg-blue-100 text-blue-700",
            variant === "green"   && "bg-green-100 text-green-700",
            variant === "amber"   && "bg-amber-100 text-amber-700",
            variant === "red"     && "bg-red-100 text-red-700",
            variant === "slate"   && "bg-slate-200 text-slate-600",
            className,
        )}>
            {children}
        </span>
    );
}

const statusConfig: Record<StockStatus, { dot: string; text: string; variant: BadgeProps["variant"] }> = {
    ok:  { dot: "bg-green-500", text: "In Stock", variant: "green" },
    low: { dot: "bg-amber-500", text: "Low Stock", variant: "amber" },
    out: { dot: "bg-red-500",   text: "Out of Stock", variant: "red" },
};

interface StockBadgeProps {
    status: StockStatus;
    showDot?: boolean;
    className?: string;
}

export function StockBadge({ status, showDot = true, className }: StockBadgeProps) {
    const cfg = statusConfig[status];
    return (
        <Badge variant={cfg.variant} className={className}>
            {showDot && <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", cfg.dot)} />}
            {cfg.text}
        </Badge>
    );
}
