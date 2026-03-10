"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, XCircle, Settings2 } from "lucide-react";
import { useAuth } from "@/components/features/auth/auth-context";
import { ROLES } from "@/lib/constants/auth";
import { useChatSettings } from "@/lib/contexts/chat-settings-context";

export default function SettingsPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { aiModel, setAiModel, relevanceThreshold, setRelevanceThreshold } = useChatSettings();
    const [backendStatus, setBackendStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [dbStatus, setDbStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
    const [backendMessage, setBackendMessage] = useState<string>("");
    const [dbMessage, setDbMessage] = useState<string>("");

    if (user?.role !== ROLES.ADMIN) {
        return <div className="p-8 text-center text-slate-500">{t.common.accessDenied}</div>;
    }

    const testConnection = async (type: 'backend' | 'db') => {
        const setStatus = type === 'backend' ? setBackendStatus : setDbStatus;
        const setMessage = type === 'backend' ? setBackendMessage : setDbMessage;
        const endpoint = type === 'backend' ? '/api/test-backend' : '/api/test-db';

        setStatus("loading");
        setMessage("");

        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
            const response = await fetch(`${backendUrl}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                setStatus("success");
                setMessage(data.message || t.common.ok);
            } else {
                throw new Error(`Status: ${response.status}`);
            }
        } catch (error) {
            console.error(`${type} Connection failed`, error);
            setStatus("error");
            setMessage(error instanceof Error ? error.message : t.common.unknownError);
        }
    };

    // System Prompt Editor state
    const [prompt, setPrompt] = useState<string>("");
    const [promptLoading, setPromptLoading] = useState<boolean>(false);
    const [promptSaving, setPromptSaving] = useState<boolean>(false);
    const [promptStatus, setPromptStatus] = useState<"idle" | "success" | "error">("idle");
    const [promptMessage, setPromptMessage] = useState<string>("");

    // Fetch current prompt
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

    // Save prompt
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
                setPromptMessage("Prompt updated successfully.");
            } else {
                throw new Error(`Status: ${res.status}`);
            }
        } catch (err) {
            setPromptStatus("error");
            setPromptMessage(err instanceof Error ? err.message : "Unknown error");
        } finally {
            setPromptSaving(false);
        }
    };

    // Fetch prompt on mount
    useState(() => { fetchPrompt(); }, []);

    return (
        <div className="space-y-6">
                        {/* System Prompt Editor */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings2 className="h-5 w-5 text-slate-500" />
                                    {t.settings.systemPromptTitle}
                                </CardTitle>
                                <CardDescription>
                                    {t.settings.systemPromptDesc}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <textarea
                                    className="w-full min-h-[120px] border border-slate-300 rounded p-2 text-sm"
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    disabled={promptLoading || promptSaving}
                                    placeholder={t.settings.systemPromptPlaceholder}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        onClick={savePrompt}
                                        disabled={promptSaving || promptLoading}
                                    >
                                        {promptSaving ? t.settings.systemPromptSaving : t.settings.systemPromptSave}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={fetchPrompt}
                                        disabled={promptLoading || promptSaving}
                                    >
                                        {promptLoading ? t.settings.systemPromptLoading : t.settings.systemPromptReload}
                                    </Button>
                                </div>
                                {promptStatus === "success" && (
                                    <div className="text-green-600 text-sm">{t.settings.systemPromptSuccess}</div>
                                )}
                                {promptStatus === "error" && (
                                    <div className="text-red-600 text-sm">{t.settings.systemPromptError}</div>
                                )}
                            </CardContent>
                        </Card>
            <div>
                <h2 className="text-lg font-semibold text-slate-900">{t.settings.title}</h2>
                <p className="text-sm text-slate-500">{t.settings.description}</p>
            </div>

            {/* Chat Settings Section */}
            <div className="grid gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings2 className="h-5 w-5 text-slate-500" />
                            {t.settings.chatSettings}
                        </CardTitle>
                        <CardDescription>
                            {t.settings.chatSettingsDesc}
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {/* AI Model Selection */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-slate-900">
                                {t.settings.aiModel}
                            </label>
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        id="model-ollama"
                                        name="ai-model"
                                        value="ollama"
                                        checked={aiModel === "ollama"}
                                        onChange={(e) => setAiModel(e.target.value as "ollama" | "gemini")}
                                        className="h-4 w-4 cursor-pointer accent-blue-600"
                                    />
                                    <label htmlFor="model-ollama" className="text-sm text-slate-700 cursor-pointer flex items-center gap-2">
                                        {t.settings.ollama} <span className="text-xs text-green-600 font-medium">{t.settings.ollamaLocal}</span>
                                    </label>
                                </div>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        id="model-gemini"
                                        name="ai-model"
                                        value="gemini"
                                        checked={aiModel === "gemini"}
                                        onChange={(e) => setAiModel(e.target.value as "ollama" | "gemini")}
                                        className="h-4 w-4 cursor-pointer accent-blue-600"
                                    />
                                    <label htmlFor="model-gemini" className="text-sm text-slate-700 cursor-pointer">
                                        {t.settings.gemini}
                                    </label>
                                </div>
                            </div>
                            <p className="text-xs text-slate-500 mt-2">
                                {aiModel === "ollama"
                                    ? t.settings.ollamaDescription
                                    : t.settings.geminiDescription}
                            </p>
                        </div>

                        {/* Relevance Threshold */}
                        <div className="space-y-3 border-t border-slate-200 pt-6">
                            <label className="text-sm font-medium text-slate-900">
                                {t.settings.relevanceThreshold}: {(relevanceThreshold * 100).toFixed(0)}%
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.05"
                                value={relevanceThreshold}
                                onChange={(e) => setRelevanceThreshold(parseFloat(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <p className="text-xs text-slate-500">
                                {t.settings.relevanceDescription.replace("{percentage}", (relevanceThreshold * 100).toFixed(0))}
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-slate-500" />
                            {t.settings.backendTest}
                        </CardTitle>
                        <CardDescription>
                            {process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/test-backend
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={() => testConnection('backend')}
                                disabled={backendStatus === "loading"}
                            >
                                {backendStatus === "loading" ? t.settings.testing : t.settings.test}
                            </Button>

                            {backendStatus === "success" && (
                                <div className="flex items-center text-green-600 text-sm">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {t.settings.success}: {backendMessage}
                                </div>
                            )}

                            {backendStatus === "error" && (
                                <div className="flex items-center text-red-600 text-sm">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {t.settings.failure}: {backendMessage}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Activity className="h-5 w-5 text-slate-500" />
                            {t.settings.dbTest}
                        </CardTitle>
                        <CardDescription>
                            {process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000"}/api/test-db
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-col gap-4">
                            <Button
                                onClick={() => testConnection('db')}
                                disabled={dbStatus === "loading"}
                                variant="outline"
                            >
                                {dbStatus === "loading" ? t.settings.testing : t.settings.test}
                            </Button>

                            {dbStatus === "success" && (
                                <div className="flex items-center text-green-600 text-sm">
                                    <CheckCircle className="mr-2 h-4 w-4" />
                                    {t.settings.success}: {dbMessage}
                                </div>
                            )}

                            {dbStatus === "error" && (
                                <div className="flex items-center text-red-600 text-sm">
                                    <XCircle className="mr-2 h-4 w-4" />
                                    {t.settings.failure}: {dbMessage}
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
