/**
 * Chat API service for communicating with the backend chat/RAG endpoint
 */

import { ChatSource } from "../types";
import { AIModel } from "../contexts/chat-settings-context";

export interface ChatRequest {
    question: string;
    service: string;
    submodule: string;
    username: string;
    model?: AIModel;
}

export interface ChatResponse {
    answer: string;
    sources?: ChatSource[];
}

export interface ChatStreamResult {
    answer: string;
    sources?: ChatSource[];
}

/**
 * Sends a chat message to the backend API with service context
 * Returns the parsed chat response with answer and sources
 */
export const chatService = {
    sendChatMessage: async (
        question: string,
        service: string,
        submodule: string,
        username: string,
        model?: AIModel,
        options?: {
            stream?: boolean;
            onToken?: (token: string) => void;
            onStatus?: (status: string) => void;
            onDone?: (sources: any[], model: string) => void;
            onError?: (message: string) => void;
        }
    ): Promise<ChatStreamResult> => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
        const request: ChatRequest & { stream?: boolean } = {
            question,
            service,
            submodule,
            username,
            model,
        };
        if (options?.stream) request.stream = true;

        // Streaming mode
        if (options?.stream) {
            const response = await fetch(`${backendUrl}/api/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(request),
                credentials: "include",
            });
            if (!response.ok) {
                throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
            }
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let answer = "";
            let sources: any[] = [];
            let modelName = "";
            if (!reader) {
                throw new Error("No response body for streaming");
            }
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                const chunk = decoder.decode(value);
                const lines = chunk.split("\n");
                for (const line of lines) {
                    if (line.startsWith("data: ")) {
                        try {
                            const data = JSON.parse(line.slice(6));
                            if (data.type === "token") {
                                answer += data.token;
                                options?.onToken?.(data.token);
                            }
                            if (data.type === "status") {
                                options?.onStatus?.(data.message);
                            }
                            if (data.type === "done") {
                                sources = data.sources || [];
                                modelName = typeof data.model === "string" ? data.model : "";
                                options?.onDone?.(sources, modelName);
                            }
                            if (data.type === "error") {
                                options?.onError?.(data.message);
                            }
                        } catch (err) {
                            // Ignore parse errors
                        }
                    }
                }
            }
            return { answer, sources };
        }

        // Fallback to normal fetch
        const response = await fetch(`${backendUrl}/api/chat`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(request),
            credentials: "include",
        });
        if (!response.ok) {
            throw new Error(`Chat API error: ${response.status} ${response.statusText}`);
        }
        const data = await response.json() as ChatResponse;
        return {
            answer: data.answer,
            sources: data.sources,
        };
    },
};
