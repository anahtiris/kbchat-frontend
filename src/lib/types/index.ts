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

export type StockStatus = "ok" | "low" | "out";

export interface InventoryItem {
    id: string;
    name: string;
    sku?: string;
    category: string;
    unit: string;
    quantity: number;
    min_threshold?: number;
    supplier_name?: string;
    is_active: boolean;
    created_at?: string;
    updated_at?: string;
}

export interface StockMovement {
    id: string;
    item_id: string;
    type: "receive" | "consume" | "adjust" | "expire";
    quantity_delta: number;
    reference_id?: string;
    reference_type?: "procedure_execution" | "manual_adjustment";
    notes?: string;
    performed_by: string;
    created_at: string;
}

export interface ProcedureConsumable {
    item_id: string;
    item_name: string;
    unit: string;
    default_quantity: number;
    is_optional: boolean;
}

export interface Procedure {
    id: string;
    name: string;
    category?: string;
    estimated_duration_min?: number;
    notes?: string;
    is_active: boolean;
    consumables: ProcedureConsumable[];
    created_at?: string;
}

export interface ConsumableLineItem extends ProcedureConsumable {
    adjusted_quantity: number;
    current_stock: number;
    min_threshold?: number;
    status: StockStatus;
    checked: boolean;
}

export interface ProcedureExecution {
    id: string;
    procedure_id: string;
    procedure_name: string;
    performed_by: string;
    notes?: string;
    items: { item_id: string; item_name: string; quantity_consumed: number; unit: string }[];
    created_at: string;
}
