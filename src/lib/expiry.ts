export const EXPIRY_CRITICAL_DAYS = 7;   // within a week — high urgency
export const EXPIRY_WARNING_DAYS = 30;   // within a month — watch

export type ExpiryStatus = "expired" | "critical" | "soon" | null;

interface ExpiryOptions {
    track_expiry?: boolean;
    expiry_critical_days?: number;
    expiry_warning_days?: number;
}

function daysUntil(isoDate: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(isoDate);
    expiry.setHours(0, 0, 0, 0);
    return Math.ceil((expiry.getTime() - today.getTime()) / 86_400_000);
}

export function getExpiryDays(nearestExpiry: string | undefined | null): number | null {
    if (!nearestExpiry) return null;
    return daysUntil(nearestExpiry);
}

export function getExpiryStatus(
    nearestExpiry: string | undefined | null,
    options?: ExpiryOptions
): ExpiryStatus {
    if (!nearestExpiry) return null;
    if (options?.track_expiry === false) return null;
    const critical = options?.expiry_critical_days ?? EXPIRY_CRITICAL_DAYS;
    const warning = options?.expiry_warning_days ?? EXPIRY_WARNING_DAYS;
    const days = daysUntil(nearestExpiry);
    if (days < 0) return "expired";
    if (days <= critical) return "critical";
    if (days <= warning) return "soon";
    return null;
}
