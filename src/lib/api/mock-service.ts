import { ChatMessage } from "../types";

/**
 * Mock API service for features that are still in development or don't have a backend implementation yet.
 * Features like Documents and Service Management have been moved to real backend API calls.
 */
export const mockApi = {
    /**
     * Simulated streaming response for the Ondamed Assistant.
     * This will be replaced with a real RAG backend streaming endpoint in the future.
     */
    sendMessage: async (content: string): Promise<ReadableStream<string>> => {
        const encoder = new TextEncoder();
        const responseText = "Thinking... In a real production environment, I would now be querying the Ondamed Knowledge Base via RAG to provide you with the most accurate technical answer from the manuals. Since the chat backend is still under development, I am providing this mock response.";

        return new ReadableStream({
            async start(controller) {
                const words = responseText.split(" ");
                for (const word of words) {
                    controller.enqueue(word + " ");
                    await new Promise((r) => setTimeout(r, 60)); // Simulate typing latency
                }
                controller.close();
            }
        });
    }
};
