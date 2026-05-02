/**
 * Adapter — routes calls to mock or real backend.
 * Set NEXT_PUBLIC_USE_MOCK_INVENTORY=false to switch to the real API.
 * All real fetch calls must include `credentials: "include"`.
 */
import { inventoryMockApi, buildConsumableLineItems } from "./inventory-mock";
import { ConsumableLineItem, InventoryItem, Procedure, ProcedureExecution, StockMovement } from "@/lib/types";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_INVENTORY !== "false";

export const inventoryService = {
    getItems: (): Promise<InventoryItem[]> =>
        USE_MOCK ? inventoryMockApi.getItems() : realFetch("/api/inventory/items"),

    createItem: (item: Omit<InventoryItem, "id" | "created_at" | "updated_at">): Promise<InventoryItem> =>
        USE_MOCK ? inventoryMockApi.createItem(item) : realPost("/api/inventory/items", item),

    updateItem: (id: string, patch: Partial<InventoryItem>): Promise<InventoryItem> =>
        USE_MOCK ? inventoryMockApi.updateItem(id, patch) : realPut(`/api/inventory/items/${id}`, patch),

    deleteItem: (id: string): Promise<void> =>
        USE_MOCK ? inventoryMockApi.deleteItem(id) : realDelete(`/api/inventory/items/${id}`),

    receiveStock: (itemId: string, qty: number, notes?: string): Promise<InventoryItem> =>
        USE_MOCK ? inventoryMockApi.receiveStock(itemId, qty, notes) : realPost("/api/inventory/movements/receive", { item_id: itemId, quantity: qty, notes }),

    adjustStock: (itemId: string, delta: number, notes: string, options?: { lot_number?: string; expiry_date?: string }): Promise<InventoryItem> =>
        USE_MOCK ? inventoryMockApi.adjustStock(itemId, delta, notes, options) : realPost("/api/inventory/movements/adjust", { item_id: itemId, quantity_delta: delta, notes, ...options }),

    expireStock: (itemId: string, qty: number, notes?: string, lot_number?: string): Promise<InventoryItem> =>
        USE_MOCK ? inventoryMockApi.expireStock(itemId, qty, notes, lot_number) : realPost("/api/inventory/movements/expire", { item_id: itemId, quantity: qty, notes, lot_number }),

    getMovements: (itemId: string): Promise<StockMovement[]> =>
        USE_MOCK ? inventoryMockApi.getMovements(itemId) : realFetch(`/api/inventory/items/${itemId}/movements`),

    getProcedures: (): Promise<Procedure[]> =>
        USE_MOCK ? inventoryMockApi.getProcedures() : realFetch("/api/procedures"),

    createProcedure: (proc: Omit<Procedure, "id">): Promise<Procedure> =>
        USE_MOCK ? inventoryMockApi.createProcedure(proc) : realPost("/api/procedures", proc),

    updateProcedure: (id: string, patch: Partial<Procedure>): Promise<Procedure> =>
        USE_MOCK ? inventoryMockApi.updateProcedure(id, patch) : realPut(`/api/procedures/${id}`, patch),

    deleteProcedure: (id: string): Promise<void> =>
        USE_MOCK ? inventoryMockApi.deleteProcedure(id) : realDelete(`/api/procedures/${id}`),

    executeProcedure: (procedureId: string, lines: ConsumableLineItem[], notes?: string): Promise<ProcedureExecution> =>
        USE_MOCK ? inventoryMockApi.executeProcedure(procedureId, lines, notes) : realPost(`/api/procedures/${procedureId}/execute`, { items: lines.filter(l => l.checked).map(l => ({ item_id: l.item_id, quantity: l.adjusted_quantity })), notes }),

    buildConsumableLineItems,
};

const backendUrl = () => process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

async function realFetch<T>(path: string): Promise<T> {
    const res = await fetch(`${backendUrl()}${path}`, { credentials: "include" });
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return res.json();
}

async function realPost<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${backendUrl()}${path}`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return res.json();
}

async function realPut<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${backendUrl()}${path}`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
    return res.json();
}

async function realDelete(path: string): Promise<void> {
    const res = await fetch(`${backendUrl()}${path}`, { method: "DELETE", credentials: "include" });
    if (!res.ok) throw new Error(`${path} failed: ${res.status}`);
}
