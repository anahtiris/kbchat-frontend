"use client";

import { useState } from "react";
import { X, Save, Loader2, Plus, Trash2 } from "lucide-react";
import { Procedure, ProcedureConsumable, InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/api/inventory-service";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

const inputCls =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

const CATEGORIES = ["Botox", "Filler", "Laser", "Facial", "Wellness", "Other"];

function Field({
    label,
    required = false,
    children,
}: {
    label: string;
    required?: boolean;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
                {label}
                {required && <span className="ml-0.5 text-red-500">*</span>}
            </label>
            {children}
        </div>
    );
}

interface ProcedureFormProps {
    procedure?: Procedure;
    availableItems: InventoryItem[];
    onClose: () => void;
    onSaved: (procedure: Procedure) => void;
}

type DraftConsumable = Pick<ProcedureConsumable, "item_id" | "default_quantity" | "is_optional">;

export function ProcedureForm({ procedure, availableItems, onClose, onSaved }: ProcedureFormProps) {
    const { t } = useTranslation();
    const isEdit = !!procedure;

    const [name, setName] = useState(procedure?.name ?? "");
    const [category, setCategory] = useState(procedure?.category ?? "");
    const [notes, setNotes] = useState(procedure?.notes ?? "");
    const [consumables, setConsumables] = useState<DraftConsumable[]>(
        procedure?.consumables.map((c) => ({
            item_id: c.item_id,
            default_quantity: c.default_quantity,
            is_optional: c.is_optional,
        })) ?? []
    );

    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const addConsumable = () => {
        const firstItem = availableItems[0];
        if (!firstItem) return;
        setConsumables((prev) => [
            ...prev,
            { item_id: firstItem.id, default_quantity: 1, is_optional: false },
        ]);
    };

    const updateConsumable = (idx: number, patch: Partial<DraftConsumable>) => {
        setConsumables((prev) => prev.map((c, i) => (i === idx ? { ...c, ...patch } : c)));
    };

    const removeConsumable = (idx: number) => {
        setConsumables((prev) => prev.filter((_, i) => i !== idx));
    };

    const buildConsumableList = (): ProcedureConsumable[] =>
        consumables.map((c) => {
            const item = availableItems.find((i) => i.id === c.item_id);
            return {
                item_id: c.item_id,
                item_name: item?.name ?? "",
                unit: item?.unit ?? "",
                default_quantity: Number(c.default_quantity),
                is_optional: c.is_optional,
            };
        });

    const handleSave = async () => {
        if (!name.trim()) {
            setError("Procedure name is required.");
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            const payload: Omit<Procedure, "id"> = {
                name: name.trim(),
                category: category || undefined,
                notes: notes.trim() || undefined,
                is_active: procedure?.is_active ?? true,
                consumables: buildConsumableList(),
            };
            const saved = isEdit
                ? await inventoryService.updateProcedure(procedure!.id, payload)
                : await inventoryService.createProcedure(payload);
            onSaved(saved);
        } catch (err) {
            setError(err instanceof Error ? err.message : t.common.unknownError);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-lg flex-col bg-white dark:bg-slate-900 shadow-2xl">
                <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {isEdit ? t.procedures.editProcedure : t.procedures.addProcedure}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    <Field label={t.procedures.procedureName} required>
                        <input
                            className={inputCls}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Botox Forehead"
                        />
                    </Field>

                    <Field label={t.procedures.category}>
                        <select
                            className={inputCls}
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                        >
                            <option value="">Select...</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </Field>

                    <Field label={t.procedures.notes}>
                        <textarea
                            className={`${inputCls} min-h-[72px] resize-none`}
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Optional notes..."
                        />
                    </Field>

                    {/* Consumables editor */}
                    <div className="space-y-2">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.procedures.consumables}</label>
                            <button
                                onClick={addConsumable}
                                disabled={availableItems.length === 0}
                                className="flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                            >
                                <Plus className="h-3 w-3" /> {t.procedures.addConsumable}
                            </button>
                        </div>

                        {consumables.length === 0 ? (
                            <p className="rounded-md border border-dashed border-slate-200 py-4 text-center text-xs text-slate-400">
                                {t.procedures.noConsumables}
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {consumables.map((c, idx) => {
                                    const item = availableItems.find((i) => i.id === c.item_id);
                                    return (
                                        <div
                                            key={idx}
                                            className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 p-2.5 dark:border-slate-700 dark:bg-slate-800"
                                        >
                                            <select
                                                className="flex-1 rounded border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                                                value={c.item_id}
                                                onChange={(e) => updateConsumable(idx, { item_id: e.target.value })}
                                            >
                                                {availableItems.map((i) => (
                                                    <option key={i.id} value={i.id}>
                                                        {i.name}
                                                    </option>
                                                ))}
                                            </select>

                                            <div className="flex items-center gap-1 shrink-0">
                                                <input
                                                    type="number"
                                                    min={c.is_optional ? 0 : 1}
                                                    value={c.default_quantity}
                                                    onChange={(e) =>
                                                        updateConsumable(idx, {
                                                            default_quantity: Number(e.target.value),
                                                        })
                                                    }
                                                    className="w-14 rounded border border-slate-200 bg-white px-1.5 py-1.5 text-center text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
                                                />
                                                <span className="text-[10px] text-slate-400 shrink-0">{item?.unit ?? ""}</span>
                                            </div>

                                            <label className="flex items-center gap-1 shrink-0 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={c.is_optional}
                                                    onChange={(e) =>
                                                        updateConsumable(idx, { is_optional: e.target.checked })
                                                    }
                                                    className="h-3 w-3 accent-blue-600"
                                                />
                                                <span className="text-[10px] text-slate-500">{t.procedures.optional}</span>
                                            </label>

                                            <button
                                                onClick={() => removeConsumable(idx)}
                                                className="shrink-0 rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {error && <p className="text-sm text-red-600">{error}</p>}
                </div>

                <div className="flex gap-3 border-t border-slate-200 dark:border-slate-700 p-5">
                    <Button variant="outline" className="flex-1" onClick={onClose} disabled={isSaving}>
                        {t.common.cancel}
                    </Button>
                    <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Save className="mr-2 h-4 w-4" />
                        )}
                        {t.common.save}
                    </Button>
                </div>
            </div>
        </>
    );
}
