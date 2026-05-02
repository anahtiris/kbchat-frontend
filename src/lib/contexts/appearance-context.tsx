"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Theme = "light" | "dark";
export type FontSize = "sm" | "md" | "lg";

interface AppearanceContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    fontSize: FontSize;
    setFontSize: (size: FontSize) => void;
}

const AppearanceContext = createContext<AppearanceContextType | undefined>(undefined);

const STORAGE_KEY_THEME = "app_theme";
const STORAGE_KEY_FONT = "app_font_size";
const FONT_SIZE_MAP: Record<FontSize, string> = { sm: "14px", md: "16px", lg: "18px" };

export function AppearanceProvider({ children }: { children: React.ReactNode }) {
    const [theme, setThemeState] = useState<Theme>("light");
    const [fontSize, setFontSizeState] = useState<FontSize>("md");
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const savedTheme = localStorage.getItem(STORAGE_KEY_THEME) as Theme | null;
        const savedFont = localStorage.getItem(STORAGE_KEY_FONT) as FontSize | null;
        if (savedTheme) setThemeState(savedTheme);
        if (savedFont) setFontSizeState(savedFont);
        setIsHydrated(true);
    }, []);

    useEffect(() => {
        if (!isHydrated) return;
        document.documentElement.classList.toggle("dark", theme === "dark");
    }, [theme, isHydrated]);

    useEffect(() => {
        if (!isHydrated) return;
        document.documentElement.style.setProperty("--app-font-size", FONT_SIZE_MAP[fontSize]);
    }, [fontSize, isHydrated]);

    const setTheme = (t: Theme) => {
        setThemeState(t);
        localStorage.setItem(STORAGE_KEY_THEME, t);
    };

    const setFontSize = (s: FontSize) => {
        setFontSizeState(s);
        localStorage.setItem(STORAGE_KEY_FONT, s);
    };

    return (
        <AppearanceContext.Provider value={{ theme, setTheme, fontSize, setFontSize }}>
            {children}
        </AppearanceContext.Provider>
    );
}

export function useAppearance() {
    const ctx = useContext(AppearanceContext);
    if (!ctx) throw new Error("useAppearance must be used within AppearanceProvider");
    return ctx;
}
