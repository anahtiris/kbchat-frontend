"use client";

import { ChatInterface } from "@/components/features/chat/chat-interface";
import { useTranslation } from "@/lib/i18n/context";

export default function ChatPage() {
    const { t } = useTranslation();

    return (
        <div className="h-full flex flex-col">
            <div className="mb-4">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">{t.nav.chat}</h2>
                <p className="text-slate-500 dark:text-slate-400">
                    {t.dashboard.subtitle}
                </p>
            </div>
            <div className="flex-1 min-h-0">
                <ChatInterface />
            </div>
        </div>
    );
}
