"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type AIModel = "ollama" | "gemini";

interface ChatSettingsContextType {
    aiModel: AIModel;
    setAiModel: (model: AIModel) => void;
    relevanceThreshold: number;
    setRelevanceThreshold: (threshold: number) => void;
}

const ChatSettingsContext = createContext<ChatSettingsContextType | undefined>(undefined);

const STORAGE_KEY_MODEL = "chat_ai_model";
const STORAGE_KEY_THRESHOLD = "chat_relevance_threshold";
const DEFAULT_MODEL: AIModel = "ollama";
const DEFAULT_THRESHOLD = 0.6;

export function ChatSettingsProvider({ children }: { children: React.ReactNode }) {
    const [aiModel, setAiModel] = useState<AIModel>(DEFAULT_MODEL);
    const [relevanceThreshold, setRelevanceThreshold] = useState<number>(DEFAULT_THRESHOLD);
    const [isHydrated, setIsHydrated] = useState(false);

    // Load settings from localStorage on mount
    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedModel = localStorage.getItem(STORAGE_KEY_MODEL) as AIModel | null;
            const savedThreshold = localStorage.getItem(STORAGE_KEY_THRESHOLD);

            if (savedModel) {
                setAiModel(savedModel);
            }
            if (savedThreshold) {
                setRelevanceThreshold(parseFloat(savedThreshold));
            }
            setIsHydrated(true);
        }
    }, []);

    // Save model to localStorage whenever it changes
    const handleSetAiModel = (model: AIModel) => {
        setAiModel(model);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_MODEL, model);
        }
    };

    // Save threshold to localStorage whenever it changes
    const handleSetRelevanceThreshold = (threshold: number) => {
        setRelevanceThreshold(threshold);
        if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY_THRESHOLD, threshold.toString());
        }
    };

    // Don't render until hydrated to avoid hydration mismatches
    if (!isHydrated) {
        return <>{children}</>;
    }

    return (
        <ChatSettingsContext.Provider
            value={{
                aiModel,
                setAiModel: handleSetAiModel,
                relevanceThreshold,
                setRelevanceThreshold: handleSetRelevanceThreshold,
            }}
        >
            {children}
        </ChatSettingsContext.Provider>
    );
}

export function useChatSettings() {
    const context = useContext(ChatSettingsContext);
    if (context === undefined) {
        throw new Error("useChatSettings must be used within a ChatSettingsProvider");
    }
    return context;
}
