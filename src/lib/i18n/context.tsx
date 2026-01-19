"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { dictionary, Language, Dictionary } from "./dictionaries";

interface LanguageContextType {
    language: Language;
    t: Dictionary;
    setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>("en");

    // Load from local storage
    useEffect(() => {
        const saved = localStorage.getItem("app_lang") as Language;
        if (saved && (saved === "en" || saved === "th")) {
            setLanguage(saved);
        }
    }, []);

    const changeLanguage = (lang: Language) => {
        setLanguage(lang);
        localStorage.setItem("app_lang", lang);
    };

    return (
        <LanguageContext.Provider value={{ language, t: dictionary[language], setLanguage: changeLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useTranslation() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useTranslation must be used within a LanguageProvider");
    }
    return context;
}
