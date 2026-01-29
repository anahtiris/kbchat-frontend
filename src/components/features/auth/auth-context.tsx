"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Role, ROLES } from "@/lib/constants/auth";

export { type Role };

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    roles?: string[];
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (role: Role) => Promise<void>;
    logout: () => Promise<void>;
    refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

    const login = async (role: Role) => {
        setIsLoading(true);
        // Simulate API delay
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUser: User = {
            id: "123",
            name: role === ROLES.ADMIN ? "Admin User" : role === ROLES.VIEWER ? "Dr. Smith" : "Staff Member",
            email: `${role}@clinic.local`,
            role: role,
        };

        setUser(mockUser);
        localStorage.setItem("mock_user", JSON.stringify(mockUser));
        setIsLoading(false);
        router.push("/dashboard");
    };

    // BFF Pattern: The frontend trusts the backend session (Stateful Cookie)
    // We never store tokens in localStorage to prevent XSS theft.
    const refreshSession = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${backendUrl}/api/auth/me`, {
                credentials: "include", // Required to send/receive HttpOnly cookies
            });
            if (response.ok) {
                const userData = await response.json();

                // Normalize the user role structure
                // Azure roles often come in a 'roles' array and can be case-sensitive
                const rawRoles = Array.isArray(userData.roles) ? userData.roles : (userData.role ? [userData.role] : []);
                const normalizedRoles = rawRoles.map((r: string) => r.toLowerCase());

                // Primary role selection (prioritize admin)
                const primaryRole = normalizedRoles.includes(ROLES.ADMIN)
                    ? ROLES.ADMIN
                    : (normalizedRoles.includes(ROLES.STAFF) ? ROLES.STAFF : (normalizedRoles[0] as Role || ROLES.VIEWER));

                setUser({
                    ...userData,
                    role: primaryRole,
                    roles: normalizedRoles
                });
            } else {
                setUser(null);
            }
        } catch (error) {
            console.error("Auth check failed:", error);
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    }, [backendUrl]);

    useEffect(() => {
        // Fallback to localStorage check for development persistency
        const stored = localStorage.getItem("mock_user");
        if (stored) {
            setUser(JSON.parse(stored));
            setIsLoading(false);
            return;
        }

        refreshSession();
    }, [refreshSession]);

    const logout = async () => {
        setIsLoading(true);
        try {
            await fetch(`${backendUrl}/api/auth/logout`, {
                method: "POST",
                credentials: "include",
            });
        } catch (error) {
            console.error("Selective logout error:", error);
        }
        setUser(null);
        localStorage.removeItem("mock_user");
        setIsLoading(false);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout, refreshSession }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
