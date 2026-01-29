"use client";

import { useAuth, Role } from "./auth-context";
import { useTranslation } from "@/lib/i18n/context";

interface RoleGuardProps {
    children: React.ReactNode;
    allowedRoles: Role[];
    fallback?: React.ReactNode;
}

/**
 * RoleGuard component to conditionally render children based on the user's role.
 * This is a frontend-only visibility check. Secure authorization MUST also be
 * enforced on the backend /api routes.
 */
export function RoleGuard({ children, allowedRoles, fallback = null }: RoleGuardProps) {
    const { user, isLoading } = useAuth();
    const { t } = useTranslation();

    if (isLoading) return null;

    if (!user) {
        return <>{fallback}</>;
    }

    const hasPermission = allowedRoles.includes(user.role) ||
        user.roles?.some(r => allowedRoles.includes(r as Role));

    if (!hasPermission) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
}
