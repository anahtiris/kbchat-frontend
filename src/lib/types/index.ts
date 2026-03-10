import { Role } from "../constants/auth";

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
    id: string; // Internal UI ID (fallback)
    document_id?: number; // Backend ID
    service_id: number;
    service_name?: string;
    service_submodule: string;
    blob_directory: string;
    page_from_inclusive: number;
    page_to_inclusive: number;
    page_to_skip?: number | null;
    created_date?: string;
    // UI derived fields
    filename: string;
    uploadedBy: string;
    uploadedAt: string; // ISO date
    size: string;
    pageCount: number;
    boundaries: RagBoundary[];
}

export interface ChatSource {
    id: string;
    similarity: number;
    metadata: {
        domain: string;
        source: string;
        chunk_index: number;
        document_id: string;
        page_number: number[];
        section_title: string;
        hierarchy_level: number;
    };
}

export interface ChatMessage {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: string;
    sources?: ChatSource[]; // Sources/citations from the answer
    citations?: string[]; // IDs of documents cited (legacy)
}

export interface KnowledgeBaseService {
    service_id: number;
    service_name: string;
    submodules: string[];
}
