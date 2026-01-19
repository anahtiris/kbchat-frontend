"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export type Role = "admin" | "doctor" | "staff";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (role: Role) => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        // Simulate session check
        const checkSession = async () => {
            // For now, no persistent session on refresh in this simple mock unless we use localStorage
            // Let's use localStorage to persist mock session for better DX
            const stored = localStorage.getItem("mock_user");
            if (stored) {
                setUser(JSON.parse(stored));
            }
            setIsLoading(false);
        };
        checkSession();
    }, []);

    const login = async (role: Role) => {
        setIsLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 800));

        const mockUser: User = {
            id: "123",
            name: role === "admin" ? "Admin User" : role === "doctor" ? "Dr. Smith" : "Staff Member",
            email: `${role}@clinic.local`,
            role: role,
        };

        setUser(mockUser);
        localStorage.setItem("mock_user", JSON.stringify(mockUser));
        setIsLoading(false);
        router.push("/dashboard");
    };

    const logout = async () => {
        setIsLoading(true);
        await new Promise((resolve) => setTimeout(resolve, 500));
        setUser(null);
        localStorage.removeItem("mock_user");
        setIsLoading(false);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, login, logout }}>
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
