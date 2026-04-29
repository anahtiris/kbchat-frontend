"use client";

import { useState, useRef, useEffect } from "react";
import { Send, StopCircle, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, KnowledgeBaseService } from "@/lib/types";
import { chatService } from "@/lib/api/chat-service";
import { MessageBubble } from "./message-bubble";
import { ScopeSelector } from "./scope-selector";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "../auth/auth-context";
import { useChatSettings } from "@/lib/contexts/chat-settings-context";

export function ChatInterface() {
    const { t } = useTranslation();
    const { user } = useAuth();
    const { aiModel } = useChatSettings();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [services, setServices] = useState<KnowledgeBaseService[]>([]);
    const [selectedServiceId, setSelectedServiceId] = useState<number | null>(null);
    const [selectedSubmodule, setSelectedSubmodule] = useState<string | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadServices = async () => {
            try {
                const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
                const response = await fetch(`${backendUrl}/api/admin/services`);
                if (response.ok) {
                    const data = await response.json();
                    setServices(data);
                }
            } catch (error) {
                console.error("Failed to fetch services:", error);
            }
        };
        loadServices();
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isStreaming || !user) return;

        // Validate required context
        if (!selectedServiceId || !selectedSubmodule) {
            console.warn("Service and submodule must be selected before sending message");
            return;
        }

        const userMsg: ChatMessage = {
            id: crypto.randomUUID(),
            role: "user",
            content: inputValue,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsStreaming(true);

        try {
            // Find the selected service name
            const selectedService = services.find((s) => s.service_id === selectedServiceId);
            const serviceName = selectedService?.service_name || selectedServiceId.toString();

            const assistantMsgId = crypto.randomUUID();

            // Add loading message
            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMsgId,
                    role: "assistant",
                    content: "",
                    timestamp: new Date().toISOString(),
                    sources: [],
                },
            ]);

            let answer = "";
            let sources: any[] = [];
            let model = "";
            let statusText = "";

            await chatService.sendChatMessage(
                userMsg.content,
                serviceName,
                selectedSubmodule,
                user.name,
                aiModel,
                {
                    stream: true,
                    onToken: (token) => {
                        answer += token;
                        setMessages((prev) =>
                            prev.map(m =>
                                m.id === assistantMsgId
                                    ? { ...m, content: answer }
                                    : m
                            )
                        );
                    },
                    onStatus: (message) => {
                        statusText = message;
                        setMessages((prev) =>
                            prev.map(m =>
                                m.id === assistantMsgId
                                    ? { ...m, content: answer ? answer + "\n" + message : message}
                                    : m
                            )
                        );
                    },
                    onDone: (src, mdl) => {
                        sources = src;
                        model = mdl;
                        setMessages((prev) =>
                            prev.map(m =>
                                m.id === assistantMsgId
                                    ? { ...m, content: answer, sources }
                                    : m
                            )
                        );
                    },
                    onError: (msg) => {
                        setMessages((prev) => [
                            ...prev.filter(m => m.id !== assistantMsgId),
                            {
                                id: crypto.randomUUID(),
                                role: "assistant",
                                content: `${t.chat.error}: ${msg}`,
                                timestamp: new Date().toISOString(),
                            },
                        ]);
                    },
                }
            );
        } catch (error) {
            console.error("Chat error:", error);
            // Add error message to chat
            const errorMsg: ChatMessage = {
                id: crypto.randomUUID(),
                role: "assistant",
                content: `${t.chat.error}: ${error instanceof Error ? error.message : t.chat.failedToSend}`,
                timestamp: new Date().toISOString(),
            };
            setMessages((prev) => [...prev, errorMsg]);
        } finally {
            setIsStreaming(false);
        }
    };

    return (
        <div className="flex flex-col h-full bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
            {/* Chat Header / Toolbar */}
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 p-4">
                <div className="flex items-center gap-4">
                    <ScopeSelector
                        services={services}
                        selectedServiceId={selectedServiceId}
                        selectedSubmodule={selectedSubmodule}
                        onSelectionChange={(sid, sub) => {
                            setSelectedServiceId(sid);
                            setSelectedSubmodule(sub);
                        }}
                    />
                    {(selectedServiceId || selectedSubmodule) && (
                        <span className="text-xs text-green-600 font-medium flex items-center bg-green-50 px-2 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5 animate-pulse"></span>
                            {t.chat.contextActive}
                        </span>
                    )}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setMessages([])} title={t.chat.clearChat}>
                    <RefreshCw className="h-4 w-4 text-slate-400" />
                </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col">
                    {messages.map((msg) => (
                        <MessageBubble
                            key={msg.id}
                            message={msg}
                            selectedServiceName={services.find(s => s.service_id === selectedServiceId)?.service_name ?? null}
                            selectedSubmodule={selectedSubmodule}
                        />
                    ))}
                    <div ref={messagesEndRef} />
                </div>

                {messages.length === 0 && (
                    <div className="flex h-full flex-col items-center justify-center text-slate-300">
                        <MessageSquare className="h-12 w-12 mb-2 opacity-20" />
                        <p>{t.chat.noMessages}</p>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="border-t border-slate-100 p-4 bg-white">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={t.chat.placeholder}
                        className="flex-1 text-slate-900 placeholder:text-slate-400 border-slate-300"
                        disabled={isStreaming}
                    />
                    <Button type="submit" disabled={isStreaming || !inputValue.trim()} className={isStreaming ? "w-24" : "w-12"}>
                        {isStreaming ? (
                            <StopCircle className="h-4 w-4 animate-pulse" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>
                </form>
                <div className="mt-2 text-center">
                    <p className="text-[10px] text-slate-400">
                        {t.chat.disclaimer}
                    </p>
                </div>
            </div>
        </div>
    );
}
