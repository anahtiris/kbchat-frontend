"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, XCircle, Settings2, Palette } from "lucide-react";
import { useAuth } from "@/components/features/auth/auth-context";
import { ROLES } from "@/lib/constants/auth";
import { useChatSettings } from "@/lib/contexts/chat-settings-context";
import { useAppearance } from "@/lib/contexts/appearance-context";
import type { Theme, FontSize } from "@/lib/contexts/appearance-context";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { aiModel, setAiModel, relevanceThreshold, setRelevanceThreshold } = useChatSettings();
    const { theme, setTheme, fontSize, setFontSize } = useAppearance();

    const [backendStatus, setBackendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [dbStatus, setDbStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [backendMessage, setBackendMessage] = useState("");
    const [dbMessage, setDbMessage] = useState("");

    const [prompt, setPrompt] = useState("");
    const [promptLoading, setPromptLoading] = useState(false);
    const [promptSaving, setPromptSaving] = useState(false);
    const [promptStatus, setPromptStatus] = useState<"idle" | "success" | "error">("idle");
    const [promptMessage, setPromptMessage] = useState("");

    const isAdmin = user?.role === ROLES.ADMIN;

    const fetchPrompt = async () => {
        setPromptLoading(true);
        setPromptStatus("idle");
        setPromptMessage("");
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
            const res = await fetch(`${backendUrl}/api/admin/system-prompt`, { method: "GET" });
            if (res.ok) {
                const data = await res.json();
                setPrompt(data.prompt || "");
            } else {
                throw new Error(`Status: ${res.status}`);
            }
        } catch (err) {
            setPromptStatus("error");
            setPromptMessage(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setPromptLoading(false);
        }
    };

    useEffect(() => {
        if (isAdmin) fetchPrompt();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isAdmin]);

    const savePrompt = async () => {
        setPromptSaving(true);
        setPromptStatus("idle");
        setPromptMessage("");
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
            const res = await fetch(`${backendUrl}/api/admin/system-prompt`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ prompt }),
            });
            if (res.ok) {
                setPromptStatus("success");
                setPromptMessage(t.settings.systemPromptSuccess);
            } else {
                throw new Error(`Status: ${res.status}`);
            }
        } catch (err) {
            setPromptStatus("error");
            setPromptMessage(err instanceof Error ? err.message : t.common.unknownError);
        } finally {
            setPromptSaving(false);
        }
    };

    const testConnection = async (type: "backend" | "db") => {
        const setStatus = type === "backend" ? setBackendStatus : setDbStatus;
        const setMessage = type === "backend" ? setBackendMessage : setDbMessage;
        const endpoint = type === "backend" ? "/api/test-backend" : "/api/test-db";

        setStatus("loading");
        setMessage("");
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
            const response = await fetch(`${backendUrl}${endpoint}`, {
                method: "GET",
                headers: { "Content-Type": "application/json" },
            });
            if (response.ok) {
                const data = await response.json();
                setStatus("success");
                setMessage(data.message || t.common.ok);
            } else {
                throw new Error(`Status: ${response.status}`);
            }
        } catch (error) {
            setStatus("error");
            setMessage(error instanceof Error ? error.message : t.common.unknownError);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">{t.settings.title}</h2>
                <p className="text-sm text-slate-500">{t.settings.description}</p>
            </div>

            {/* Appearance — all roles */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Palette className="h-5 w-5 text-slate-500" />
                        {t.settings.appearance}
                    </CardTitle>
                    <CardDescription>{t.settings.appearanceDesc}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-3">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.settings.themeLabel}</p>
                        <div className="flex gap-3">
                            {(["light", "dark"] as Theme[]).map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setTheme(opt)}
                                    className={cn(
                                        "flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors",
                                        theme === opt
                                            ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                    )}
                                >
                                    {opt === "light" ? t.settings.themeLight : t.settings.themeDark}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-5">
                        <p className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.settings.fontSizeLabel}</p>
                        <div className="flex gap-3">
                            {(["sm", "md", "lg"] as FontSize[]).map((opt) => (
                                <button
                                    key={opt}
                                    onClick={() => setFontSize(opt)}
                                    className={cn(
                                        "flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors",
                                        fontSize === opt
                                            ? "border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                    )}
                                >
                                    {opt === "sm" ? t.settings.fontSizeSmall : opt === "md" ? t.settings.fontSizeMedium : t.settings.fontSizeLarge}
                                </button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Admin-only sections */}
            {isAdmin && (
                <>
                    {/* System Prompt Editor */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-slate-500" />
                                {t.settings.systemPromptTitle}
                            </CardTitle>
                            <CardDescription>{t.settings.systemPromptDesc}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <textarea
                                className="w-full min-h-[120px] rounded border border-slate-300 bg-white p-2 text-sm text-slate-900 placeholder:text-slate-400 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                disabled={promptLoading || promptSaving}
                                placeholder={t.settings.systemPromptPlaceholder}
                            />
                            <div className="flex gap-2">
                                <Button onClick={savePrompt} disabled={promptSaving || promptLoading}>
                                    {promptSaving ? t.settings.systemPromptSaving : t.settings.systemPromptSave}
                                </Button>
                                <Button variant="outline" onClick={fetchPrompt} disabled={promptLoading || promptSaving}>
                                    {promptLoading ? t.settings.systemPromptLoading : t.settings.systemPromptReload}
                                </Button>
                            </div>
                            {promptStatus === "success" && <div className="text-green-600 text-sm">{promptMessage}</div>}
                            {promptStatus === "error" && <div className="text-red-600 text-sm">{promptMessage}</div>}
                        </CardContent>
                    </Card>

                    {/* Chat Settings */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Settings2 className="h-5 w-5 text-slate-500" />
                                {t.settings.chatSettings}
                            </CardTitle>
                            <CardDescription>{t.settings.chatSettingsDesc}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">{t.settings.aiModel}</label>
                                <div className="space-y-2">
                                    {(["ollama", "gemini"] as const).map((model) => (
                                        <div key={model} className="flex items-center gap-3">
                                            <input
                                                type="radio"
                                                id={`model-${model}`}
                                                name="ai-model"
                                                value={model}
                                                checked={aiModel === model}
                                                onChange={(e) => setAiModel(e.target.value as "ollama" | "gemini")}
                                                className="h-4 w-4 cursor-pointer accent-blue-600"
                                            />
                                            <label htmlFor={`model-${model}`} className="text-sm text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
                                                {model === "ollama" ? t.settings.ollama : t.settings.gemini}
                                                {model === "ollama" && <span className="text-xs text-green-600 font-medium">{t.settings.ollamaLocal}</span>}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500 mt-2">
                                    {aiModel === "ollama" ? t.settings.ollamaDescription : t.settings.geminiDescription}
                                </p>
                            </div>

                            <div className="space-y-3 border-t border-slate-200 dark:border-slate-700 pt-6">
                                <label className="text-sm font-medium text-slate-900 dark:text-slate-100">
                                    {t.settings.relevanceThreshold}: {(relevanceThreshold * 100).toFixed(0)}%
                                </label>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={relevanceThreshold}
                                    onChange={(e) => setRelevanceThreshold(parseFloat(e.target.value))}
                                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:bg-slate-700"
                                />
                                <p className="text-xs text-slate-500">
                                    {t.settings.relevanceDescription.replace("{percentage}", (relevanceThreshold * 100).toFixed(0))}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Connection Tests */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {(["backend", "db"] as const).map((type) => {
                            const status = type === "backend" ? backendStatus : dbStatus;
                            const message = type === "backend" ? backendMessage : dbMessage;
                            const endpoint = type === "backend" ? "/api/test-backend" : "/api/test-db";
                            const label = type === "backend" ? t.settings.backendTest : t.settings.dbTest;
                            return (
                                <Card key={type}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Activity className="h-5 w-5 text-slate-500" />
                                            {label}
                                        </CardTitle>
                                        <CardDescription>
                                            {process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}{endpoint}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex flex-col gap-4">
                                            <Button
                                                onClick={() => testConnection(type)}
                                                disabled={status === "loading"}
                                                variant={type === "db" ? "outline" : "default"}
                                            >
                                                {status === "loading" ? t.settings.testing : t.settings.test}
                                            </Button>
                                            {status === "success" && (
                                                <div className="flex items-center text-green-600 text-sm">
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    {t.settings.success}: {message}
                                                </div>
                                            )}
                                            {status === "error" && (
                                                <div className="flex items-center text-red-600 text-sm">
                                                    <XCircle className="mr-2 h-4 w-4" />
                                                    {t.settings.failure}: {message}
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                </>
            )}
        </div>
    );
}
