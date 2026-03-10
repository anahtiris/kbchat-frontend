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
        model?: AIModel
    ): Promise<ChatStreamResult> => {
        const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

        const request: ChatRequest = {
            question,
            service,
            submodule,
            username,
            model,
        };

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
