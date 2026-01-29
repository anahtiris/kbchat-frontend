"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/i18n/context";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, CheckCircle, XCircle } from "lucide-react";
import { useAuth } from "@/components/features/auth/auth-context";
import { ROLES } from "@/lib/constants/auth";

export default function SettingsPage() {
    const { t } = useTranslation();
    const { user } = useAuth();
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

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold text-slate-900">{t.settings.title}</h2>
                <p className="text-sm text-slate-500">{t.settings.description}</p>
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
