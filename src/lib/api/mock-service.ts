import { Document, ChatMessage } from "../types";

// Mock Data
let documents: Document[] = [
    {
        id: "1",
        filename: "Clinic_ Protocols_v2.pdf",
        uploadedBy: "Admin User",
        uploadedAt: "2023-10-25T10:00:00Z",
        size: "2.4 MB",
        pageCount: 45,
        boundaries: [],
    },
    {
        id: "2",
        filename: "Drug_Interactions_2024.pdf",
        uploadedBy: "Dr. Smith",
        uploadedAt: "2023-11-01T14:30:00Z",
        size: "1.1 MB",
        pageCount: 12,
        boundaries: [
            { type: "exclude", pageStart: 10, pageEnd: 12 }
        ],
    },
];

let chatHistory: ChatMessage[] = [
    {
        id: "m1",
        role: "assistant",
        content: "Hello! I'm your clinical decision support assistant. How can I help you today?",
        timestamp: new Date().toISOString(),
    }
];

export const mockApi = {
    getDocuments: async (): Promise<Document[]> => {
        await new Promise((resolve) => setTimeout(resolve, 600));
        return [...documents];
    },

    uploadDocument: async (file: File): Promise<Document> => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const newDoc: Document = {
            id: Math.random().toString(36).substr(2, 9),
            filename: file.name,
            uploadedBy: "Admin User", // Mock
            uploadedAt: new Date().toISOString(),
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            pageCount: Math.floor(Math.random() * 50) + 5,
            boundaries: [],
        };
        documents = [newDoc, ...documents];
        return newDoc;
    },

    updateDocumentBoundaries: async (docId: string, boundaries: any[]): Promise<void> => {
        await new Promise((resolve) => setTimeout(resolve, 800));
        documents = documents.map(d => d.id === docId ? { ...d, boundaries } : d);
    },

    sendMessage: async (content: string): Promise<ReadableStream<string>> => {
        // Simulate streaming response
        const encoder = new TextEncoder();
        const responseText = "This is a simulated response based on the clinical protocols. In a real application, this would be streamed from the RAG backend.";

        return new ReadableStream({
            async start(controller) {
                const words = responseText.split(" ");
                for (const word of words) {
                    controller.enqueue(word + " ");
                    await new Promise((r) => setTimeout(r, 50)); // typing effect
                }
                controller.close();
            }
        });
    }
};
