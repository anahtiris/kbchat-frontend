import { memo, useState } from "react";
import { ChatMessage } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Bot, User as UserIcon, FileText } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { useChatSettings } from "@/lib/contexts/chat-settings-context";
import { PDFViewerOverlay } from "../documents/pdf-viewer-overlay";

export const MessageBubble = memo(function MessageBubble({ message, selectedServiceName, selectedSubmodule }: { message: ChatMessage, selectedServiceName?: string | null, selectedSubmodule?: string | null }) {
    const isUser = message.role === "user";
    const { t } = useTranslation();
    const { relevanceThreshold } = useChatSettings();

    // Filter sources by relevance threshold
    const relevantSources = message.sources?.filter(
        (source) => source.similarity >= relevanceThreshold
    ) || [];

    // PDF overlay state
    const [pdfOpen, setPdfOpen] = useState(false);
    const [pdfUrl, setPdfUrl] = useState("");
    const [pdfPage, setPdfPage] = useState<number | undefined>(undefined);

    const handleSourceClick = (source: any) => {
        const service = selectedServiceName || source.metadata.domain;
        const submodule = selectedSubmodule || source.metadata.submodule || source.metadata.source;
        const page = Array.isArray(source.metadata.page_number) ? source.metadata.page_number[0] : 1;
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        setPdfUrl(`${backendUrl}/api/documents/pdf?service=${service}&submodule=${submodule}`);
        setPdfPage(page);
        setPdfOpen(true);
    };

    return (
        <div
            className={cn(
                "flex w-full gap-3 p-4",
                isUser ? "flex-row-reverse bg-slate-50/50 dark:bg-slate-800/30" : "bg-white dark:bg-slate-900"
            )}
        >
            <div
                className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border shadow-sm",
                    isUser
                        ? "bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-700 dark:text-slate-300"
                        : "border-blue-100 dark:border-blue-900/40 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                )}
            >
                {isUser ? <UserIcon className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
            </div>

            <div className={cn("flex flex-col gap-1 max-w-[90%]", isUser ? "items-end" : "items-start")}>
                <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                        {isUser ? t.bubble.you : t.bubble.assistant}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
                <div className={cn(
                    "rounded-lg px-4 py-3 text-sm leading-relaxed",
                    isUser
                        ? "bg-slate-900 text-white dark:bg-slate-700"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-700"
                )}>
                    <p className="whitespace-pre-wrap">{message.content}</p>
                </div>

                {/* Display sources as references */}
                {relevantSources.length > 0 && (
                    <div className="mt-3 w-full">
                        <div className="text-xs font-semibold text-slate-600 dark:text-slate-400 mb-2 flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {t.bubble.sources}
                        </div>
                        <div className="space-y-1">
                            {relevantSources.map((source) => (
                                <button
                                    key={source.id}
                                    className="text-xs bg-slate-100 dark:bg-slate-800 rounded px-2 py-1.5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 w-full text-left hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer"
                                    onClick={() => handleSourceClick(source)}
                                >
                                    <div className="font-medium">{source.metadata.section_title}</div>
                                    <div className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">
                                        p. {Array.isArray(source.metadata.page_number) ? source.metadata.page_number.join(", ") : source.metadata.page_number} • {(source.similarity * 100).toFixed(1)}%
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Display citations (legacy) */}
                {message.citations && message.citations.length > 0 ? (
                    <div className="mt-2 flex gap-2">
                        {message.citations.map(cit => (
                            <span key={cit} className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 px-2 py-0.5 text-xs font-medium text-blue-700 dark:text-blue-400">
                                {t.bubble.ref} {cit}
                            </span>
                        ))}
                    </div>
                ) : null}

                {/* PDF overlay */}
                {pdfOpen && (
                    <PDFViewerOverlay
                        open={pdfOpen}
                        onClose={() => setPdfOpen(false)}
                        pdfUrl={pdfUrl}
                        pageNumber={pdfPage}
                    />
                )}
            </div>
        </div>
    );
});
