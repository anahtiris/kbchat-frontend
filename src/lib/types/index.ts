export type Role = "admin" | "doctor" | "staff";

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
}

export interface RagBoundary {
    type: "include" | "exclude";
    pageStart: number;
    pageEnd: number;
}

export interface Document {
    id: string;
    filename: string;
    uploadedBy: string;
    uploadedAt: string; // ISO date
    size: string;
    pageCount: number;
    boundaries: RagBoundary[];
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    citations?: string[]; // IDs of documents cited
}
