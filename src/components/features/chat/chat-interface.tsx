"use client";

import { useState, useRef, useEffect } from "react";
import { Send, StopCircle, RefreshCw, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage, Document } from "@/lib/types";
import { mockApi } from "@/lib/api/mock-service";
import { MessageBubble } from "./message-bubble";
import { ScopeSelector } from "./scope-selector";
import { useTranslation } from "@/lib/i18n/context";

export function ChatInterface() {
    const { t } = useTranslation();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [inputValue, setInputValue] = useState("");
    const [isStreaming, setIsStreaming] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Load available documents for scope
        mockApi.getDocuments().then(setDocuments);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!inputValue.trim() || isStreaming) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: "user",
            content: inputValue,
            timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, userMsg]);
        setInputValue("");
        setIsStreaming(true);

        try {
            const stream = await mockApi.sendMessage(userMsg.content);
            const reader = stream.getReader();

            const assistantMsgId = (Date.now() + 1).toString();

            setMessages((prev) => [
                ...prev,
                {
                    id: assistantMsgId,
                    role: "assistant",
                    content: "",
                    timestamp: new Date().toISOString(),
                },
            ]);

            let accumulatedContent = "";

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                accumulatedContent += value;
                // Update the last message with new content
                setMessages((prev) =>
                    prev.map(m =>
                        m.id === assistantMsgId
                            ? { ...m, content: accumulatedContent }
                            : m
                    )
                );
            }
        } catch (error) {
            console.error("Chat error:", error);
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
                        documents={documents}
                        selectedIds={selectedDocIds}
                        onSelectionChange={setSelectedDocIds}
                    />
                    {selectedDocIds.length > 0 && (
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
                        <MessageBubble key={msg.id} message={msg} />
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
