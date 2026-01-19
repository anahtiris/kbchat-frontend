import { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bot, User as UserIcon } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export function MessageBubble({ message }: { message: ChatMessage }) {
    const isUser = message.role === "user";
    const { t } = useTranslation();

    return (
        <div
            className={cn(
                "flex w-full gap-3 p-4",
                isUser ? "flex-row-reverse bg-slate-50/50" : "bg-white"
            )}
        >
            <div
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm",
                    isUser
                        ? "bg-white text-slate-700"
                        : "border-blue-100 bg-blue-50 text-blue-600"
                )}
            >
                {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className={cn("flex flex-col gap-1 max-w-[80%]", isUser ? "items-end" : "items-start")}>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500">
                        {isUser ? t.bubble.you : t.bubble.assistant}
                    </span>
                    <span className="text-xs text-slate-400">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className={cn(
                    "rounded-lg px-4 py-3 text-sm leading-relaxed",
                    isUser
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-800 border border-slate-100"
                )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                </div>
                {message.citations && message.citations.length > 0 && (
                    <div className="mt-2 flex gap-2">
                        {message.citations.map(cit => (
                            <span key={cit} className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                {t.bubble.ref} {cit}
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
