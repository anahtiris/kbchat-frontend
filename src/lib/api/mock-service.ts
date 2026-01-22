import { Document, ChatMessage } from "../types";

// Mock Data
let documents: Document[] = [
    {
        id: "1",
        service_id: 1,
        service_submodule: "Module 1",
        blob_directory: "/docs/protocols.pdf",
        page_from_inclusive: 1,
        page_to_inclusive: 45,
        filename: "Clinic_ Protocols_v2.pdf",
        uploadedBy: "Admin User",
        uploadedAt: "2023-10-25T10:00:00Z",
        size: "2.4 MB",
        pageCount: 45,
        boundaries: [],
    },
    {
        id: "2",
        service_id: 1,
        service_submodule: "Module 2",
        blob_directory: "/docs/drug_interactions.pdf",
        page_from_inclusive: 1,
        page_to_inclusive: 12,
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
        content: "Hello! I'm your Ondamed Assistant. How can I help you today with machine instructions or guidelines?",
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
            id: Math.random().toString(36).substring(2, 9),
            service_id: 1,
            service_submodule: "Upload",
            blob_directory: `/uploads/${file.name}`,
            page_from_inclusive: 1,
            page_to_inclusive: 50,
            filename: file.name,
            uploadedBy: "Admin User", // Mock
            uploadedAt: new Date().toISOString(),
            size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
            pageCount: 50,
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
        const responseText = "This is a simulated response based on the Ondamed manuals. In a real application, this would be streamed from the RAG backend.";

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
