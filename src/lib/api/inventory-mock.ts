import {
    InventoryItem,
    Procedure,
    StockMovement,
    ConsumableLineItem,
    ProcedureExecution,
} from "@/lib/types";

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Mutable in-memory store — resets on page refresh
const mockItems: InventoryItem[] = [
    { id: "item-1", name: "Botox Vial 100u", sku: "BTX-100", category: "injectable", unit: "vial", quantity: 12, min_threshold: 5, supplier_name: "Allergan", nearest_expiry: "2026-05-20", track_expiry: true, expiry_critical_days: 14, expiry_warning_days: 60, is_active: true },
    { id: "item-2", name: "Cotton Pads", sku: "CTN-PAD", category: "consumable", unit: "piece", quantity: 200, min_threshold: 50, track_expiry: false, is_active: true },
    { id: "item-3", name: "Numbing Cream 30g", sku: "NMB-30", category: "topical", unit: "tube", quantity: 1, min_threshold: 3, nearest_expiry: "2026-04-25", track_expiry: true, is_active: true },
    { id: "item-4", name: "Saline Solution 250ml", sku: "SAL-250", category: "solution", unit: "bottle", quantity: 24, min_threshold: 6, is_active: true },
    { id: "item-5", name: "Hyaluronic Filler 1ml", sku: "HYA-1ML", category: "injectable", unit: "syringe", quantity: 4, min_threshold: 4, supplier_name: "Juvederm", nearest_expiry: "2026-06-20", track_expiry: true, expiry_critical_days: 14, expiry_warning_days: 60, is_active: true },
    { id: "item-6", name: "Alcohol Swabs", sku: "ALC-SWB", category: "consumable", unit: "piece", quantity: 0, min_threshold: 100, track_expiry: false, is_active: true },
    { id: "item-7", name: "Sterile Gloves (M)", sku: "GLV-MED", category: "consumable", unit: "pair", quantity: 30, min_threshold: 10, is_active: true },
    { id: "item-8", name: "Laser Cooling Gel", sku: "LSR-GEL", category: "topical", unit: "tube", quantity: 8, min_threshold: 2, is_active: true },
];

const mockMovements: StockMovement[] = [
    { id: "mv-1", item_id: "item-1", type: "receive", quantity_delta: 20, lot_number: "BTX-2024-12A", expiry_date: "2026-05-20", performed_by: "Admin User", created_at: "2026-04-01T09:00:00Z" },
    { id: "mv-2", item_id: "item-1", type: "consume", quantity_delta: -8, reference_type: "procedure_execution", reference_id: "exec-1", performed_by: "Staff Member", created_at: "2026-04-15T11:30:00Z" },
    { id: "mv-3", item_id: "item-3", type: "receive", quantity_delta: 5, lot_number: "NMB-2025-03B", expiry_date: "2026-04-25", performed_by: "Admin User", created_at: "2026-03-20T10:00:00Z" },
    { id: "mv-4", item_id: "item-3", type: "consume", quantity_delta: -4, reference_type: "procedure_execution", performed_by: "Staff Member", created_at: "2026-04-28T14:00:00Z" },
    { id: "mv-5", item_id: "item-6", type: "receive", quantity_delta: 200, performed_by: "Admin User", created_at: "2026-03-01T08:00:00Z" },
    { id: "mv-6", item_id: "item-6", type: "consume", quantity_delta: -200, reference_type: "procedure_execution", performed_by: "Staff Member", created_at: "2026-04-30T16:00:00Z" },
];

const mockProcedures: Procedure[] = [
    {
        id: "proc-1",
        name: "Botox Forehead",
        category: "Botox",
        is_active: true,
        consumables: [
            { item_id: "item-1", item_name: "Botox Vial 100u", unit: "vial", default_quantity: 1, is_optional: false },
            { item_id: "item-2", item_name: "Cotton Pads", unit: "piece", default_quantity: 5, is_optional: false },
            { item_id: "item-3", item_name: "Numbing Cream 30g", unit: "tube", default_quantity: 1, is_optional: true },
            { item_id: "item-6", item_name: "Alcohol Swabs", unit: "piece", default_quantity: 4, is_optional: false },
        ],
    },
    {
        id: "proc-2",
        name: "Hyaluronic Filler — Lips",
        category: "Filler",
        is_active: true,
        consumables: [
            { item_id: "item-5", item_name: "Hyaluronic Filler 1ml", unit: "syringe", default_quantity: 1, is_optional: false },
            { item_id: "item-3", item_name: "Numbing Cream 30g", unit: "tube", default_quantity: 1, is_optional: false },
            { item_id: "item-6", item_name: "Alcohol Swabs", unit: "piece", default_quantity: 3, is_optional: false },
            { item_id: "item-7", item_name: "Sterile Gloves (M)", unit: "pair", default_quantity: 1, is_optional: false },
        ],
    },
    {
        id: "proc-3",
        name: "Laser Skin Resurfacing",
        category: "Laser",
        is_active: true,
        consumables: [
            { item_id: "item-8", item_name: "Laser Cooling Gel", unit: "tube", default_quantity: 1, is_optional: false },
            { item_id: "item-3", item_name: "Numbing Cream 30g", unit: "tube", default_quantity: 1, is_optional: false },
            { item_id: "item-2", item_name: "Cotton Pads", unit: "piece", default_quantity: 10, is_optional: false },
            { item_id: "item-4", item_name: "Saline Solution 250ml", unit: "bottle", default_quantity: 1, is_optional: true },
        ],
    },
    {
        id: "proc-4",
        name: "Hydra Facial",
        category: "Facial",
        is_active: true,
        consumables: [
            { item_id: "item-4", item_name: "Saline Solution 250ml", unit: "bottle", default_quantity: 2, is_optional: false },
            { item_id: "item-2", item_name: "Cotton Pads", unit: "piece", default_quantity: 20, is_optional: false },
            { item_id: "item-7", item_name: "Sterile Gloves (M)", unit: "pair", default_quantity: 1, is_optional: false },
        ],
    },
];

function computeStatus(item: InventoryItem, requiredQty: number) {
    if (item.quantity <= 0) return "out" as const;
    if (item.min_threshold !== undefined && item.quantity - requiredQty < item.min_threshold) return "low" as const;
    return "ok" as const;
}

export function buildConsumableLineItems(procedure: Procedure): ConsumableLineItem[] {
    return procedure.consumables.map((c) => {
        const item = mockItems.find((i) => i.id === c.item_id);
        const stock = item?.quantity ?? 0;
        const adjusted = c.default_quantity;
        return {
            ...c,
            adjusted_quantity: adjusted,
            current_stock: stock,
            min_threshold: item?.min_threshold,
            status: item ? computeStatus(item, adjusted) : "out",
            checked: true,
        };
    });
}

export const inventoryMockApi = {
    getItems: async (): Promise<InventoryItem[]> => {
        await delay(300);
        return mockItems.filter((i) => i.is_active).map((i) => ({ ...i }));
    },

    createItem: async (item: Omit<InventoryItem, "id" | "created_at" | "updated_at">): Promise<InventoryItem> => {
        await delay(300);
        const created: InventoryItem = { ...item, id: crypto.randomUUID(), created_at: new Date().toISOString(), is_active: true };
        mockItems.push(created);
        return { ...created };
    },

    updateItem: async (id: string, patch: Partial<InventoryItem>): Promise<InventoryItem> => {
        await delay(300);
        const idx = mockItems.findIndex((i) => i.id === id);
        if (idx === -1) throw new Error("Item not found");
        mockItems[idx] = { ...mockItems[idx], ...patch, updated_at: new Date().toISOString() };
        return { ...mockItems[idx] };
    },

    deleteItem: async (id: string): Promise<void> => {
        await delay(300);
        const idx = mockItems.findIndex((i) => i.id === id);
        if (idx !== -1) mockItems[idx].is_active = false;
    },

    receiveStock: async (itemId: string, qty: number, notes?: string): Promise<InventoryItem> => {
        await delay(300);
        const item = mockItems.find((i) => i.id === itemId);
        if (!item) throw new Error("Item not found");
        item.quantity += qty;
        mockMovements.unshift({
            id: crypto.randomUUID(),
            item_id: itemId,
            type: "receive",
            quantity_delta: qty,
            notes,
            performed_by: "Current User",
            created_at: new Date().toISOString(),
        });
        return { ...item };
    },

    adjustStock: async (itemId: string, delta: number, notes: string, options?: { lot_number?: string; expiry_date?: string }): Promise<InventoryItem> => {
        await delay(300);
        const item = mockItems.find((i) => i.id === itemId);
        if (!item) throw new Error("Item not found");
        item.quantity = Math.max(0, item.quantity + delta);
        mockMovements.unshift({
            id: crypto.randomUUID(),
            item_id: itemId,
            type: delta > 0 ? "receive" : "adjust",
            quantity_delta: delta,
            notes,
            lot_number: options?.lot_number,
            expiry_date: options?.expiry_date,
            performed_by: "Current User",
            created_at: new Date().toISOString(),
        });
        if (options?.expiry_date) {
            const today = new Date().toISOString().split("T")[0];
            const upcoming = mockMovements
                .filter((m) => m.item_id === itemId && m.expiry_date && m.expiry_date >= today)
                .map((m) => m.expiry_date!);
            item.nearest_expiry = upcoming.length > 0 ? upcoming.sort()[0] : undefined;
        }
        return { ...item };
    },

    expireStock: async (itemId: string, qty: number, notes?: string, lot_number?: string): Promise<InventoryItem> => {
        await delay(300);
        const item = mockItems.find((i) => i.id === itemId);
        if (!item) throw new Error("Item not found");
        item.quantity = Math.max(0, item.quantity - qty);
        mockMovements.unshift({
            id: crypto.randomUUID(),
            item_id: itemId,
            type: "expire",
            quantity_delta: -qty,
            notes,
            lot_number,
            performed_by: "Current User",
            created_at: new Date().toISOString(),
        });
        // Recompute nearest_expiry (expired lot may now be gone)
        const today = new Date().toISOString().split("T")[0];
        const upcoming = mockMovements
            .filter((m) => m.item_id === itemId && m.expiry_date && m.expiry_date >= today)
            .map((m) => m.expiry_date!);
        item.nearest_expiry = upcoming.length > 0 ? upcoming.sort()[0] : undefined;
        return { ...item };
    },

    getMovements: async (itemId: string): Promise<StockMovement[]> => {
        await delay(200);
        return mockMovements.filter((m) => m.item_id === itemId);
    },

    getProcedures: async (): Promise<Procedure[]> => {
        await delay(300);
        return mockProcedures.filter((p) => p.is_active).map((p) => ({ ...p }));
    },

    createProcedure: async (proc: Omit<Procedure, "id">): Promise<Procedure> => {
        await delay(300);
        const created: Procedure = { ...proc, id: crypto.randomUUID(), is_active: true };
        mockProcedures.push(created);
        return { ...created };
    },

    updateProcedure: async (id: string, patch: Partial<Procedure>): Promise<Procedure> => {
        await delay(300);
        const idx = mockProcedures.findIndex((p) => p.id === id);
        if (idx === -1) throw new Error("Procedure not found");
        mockProcedures[idx] = { ...mockProcedures[idx], ...patch };
        return { ...mockProcedures[idx] };
    },

    deleteProcedure: async (id: string): Promise<void> => {
        await delay(300);
        const idx = mockProcedures.findIndex((p) => p.id === id);
        if (idx !== -1) mockProcedures[idx].is_active = false;
    },

    executeProcedure: async (
        procedureId: string,
        lines: ConsumableLineItem[],
        notes?: string
    ): Promise<ProcedureExecution> => {
        await delay(500);
        const procedure = mockProcedures.find((p) => p.id === procedureId);
        if (!procedure) throw new Error("Procedure not found");

        // Deduct stock
        for (const line of lines) {
            if (!line.checked) continue;
            const item = mockItems.find((i) => i.id === line.item_id);
            if (!item) continue;
            item.quantity = Math.max(0, item.quantity - line.adjusted_quantity);
            mockMovements.unshift({
                id: crypto.randomUUID(),
                item_id: line.item_id,
                type: "consume",
                quantity_delta: -line.adjusted_quantity,
                reference_type: "procedure_execution",
                performed_by: "Current User",
                created_at: new Date().toISOString(),
            });
        }

        const execution: ProcedureExecution = {
            id: crypto.randomUUID(),
            procedure_id: procedureId,
            procedure_name: procedure.name,
            performed_by: "Current User",
            notes,
            items: lines
                .filter((l) => l.checked)
                .map((l) => ({
                    item_id: l.item_id,
                    item_name: l.item_name,
                    quantity_consumed: l.adjusted_quantity,
                    unit: l.unit,
                })),
            created_at: new Date().toISOString(),
        };
        return execution;
    },
};
