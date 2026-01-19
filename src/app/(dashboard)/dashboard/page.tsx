"use client";

import { ChatInterface } from "@/components/features/chat/chat-interface";
import { useTranslation } from "@/lib/i18n/context";

export default function DashboardPage() {
    const { t } = useTranslation();

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">{t.dashboard.title}</h2>
                <p className="text-slate-500">
                    {t.dashboard.subtitle}
                </p>
            </div>
            <div className="flex-1 min-h-0 bg-white shadow-sm ring-1 ring-slate-900/5 sm:rounded-xl">
                <ChatInterface />
            </div>
        </div>
    );
}
