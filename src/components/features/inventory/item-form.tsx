"use client";

import { useState } from "react";
import { X, Save, Loader2 } from "lucide-react";
import { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/api/inventory-service";
import { Button } from "@/components/ui/button";
import { useTranslation } from "@/lib/i18n/context";

const CATEGORIES = ["injectable", "consumable", "topical", "solution", "equipment"];
const UNITS = ["vial", "syringe", "tube", "bottle", "piece", "pair", "ml", "g"];

const inputCls =
    "w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100";

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

interface ItemFormProps {
    item?: InventoryItem;
    onClose: () => void;
    onSaved: (item: InventoryItem) => void;
}

export function ItemForm({ item, onClose, onSaved }: ItemFormProps) {
    const { t } = useTranslation();
    const isEdit = !!item;

    const [name, setName] = useState(item?.name ?? "");
    const [sku, setSku] = useState(item?.sku ?? "");
    const [category, setCategory] = useState(item?.category ?? "");
    const [unit, setUnit] = useState(item?.unit ?? "");
    const [quantity, setQuantity] = useState<number>(item?.quantity ?? 0);
    const [minThreshold, setMinThreshold] = useState<string>(
        item?.min_threshold !== undefined ? String(item.min_threshold) : ""
    );
    const [supplierName, setSupplierName] = useState(item?.supplier_name ?? "");
    const [trackExpiry, setTrackExpiry] = useState(item?.track_expiry !== false);
    const [expiryCriticalDays, setExpiryCriticalDays] = useState<string>(
        item?.expiry_critical_days !== undefined ? String(item.expiry_critical_days) : ""
    );
    const [expiryWarningDays, setExpiryWarningDays] = useState<string>(
        item?.expiry_warning_days !== undefined ? String(item.expiry_warning_days) : ""
    );
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSave = async () => {
        if (!name.trim() || !unit) {
            setError(t.inventory.allFieldsRequired);
            return;
        }
        setIsSaving(true);
        setError(null);
        try {
            const payload = {
                name: name.trim(),
                sku: sku.trim() || undefined,
                category: category || undefined,
                unit,
                quantity: Number(quantity),
                min_threshold: minThreshold !== "" ? Number(minThreshold) : undefined,
                supplier_name: supplierName.trim() || undefined,
                track_expiry: trackExpiry,
                expiry_critical_days: trackExpiry && expiryCriticalDays !== "" ? Number(expiryCriticalDays) : undefined,
                expiry_warning_days: trackExpiry && expiryWarningDays !== "" ? Number(expiryWarningDays) : undefined,
                is_active: item?.is_active ?? true,
            };
            const saved = isEdit
                ? await inventoryService.updateItem(item!.id, payload)
                : await inventoryService.createItem(payload as Omit<InventoryItem, "id" | "created_at" | "updated_at">);
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
            <div className="fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-white dark:bg-slate-900 shadow-2xl">
                <div className="flex h-14 items-center justify-between border-b border-slate-200 dark:border-slate-700 px-5">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                        {isEdit ? t.inventory.editItem : t.inventory.addItem}
                    </h3>
                    <button
                        onClick={onClose}
                        className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto p-5">
                    <Field label={t.inventory.itemName} required>
                        <input
                            className={inputCls}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Botox Vial 100u"
                        />
                    </Field>

                    <Field label={t.inventory.sku}>
                        <input
                            className={inputCls}
                            value={sku}
                            onChange={(e) => setSku(e.target.value)}
                            placeholder="e.g. BTX-100"
                        />
                    </Field>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label={t.inventory.category}>
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

                        <Field label={t.inventory.unit} required>
                            <select
                                className={inputCls}
                                value={unit}
                                onChange={(e) => setUnit(e.target.value)}
                            >
                                <option value="">Select...</option>
                                {UNITS.map((u) => (
                                    <option key={u} value={u}>
                                        {u}
                                    </option>
                                ))}
                            </select>
                        </Field>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Field label={t.inventory.quantity}>
                            <input
                                className={inputCls}
                                type="number"
                                min={0}
                                value={quantity}
                                onChange={(e) => setQuantity(Number(e.target.value))}
                            />
                        </Field>

                        <Field label={t.inventory.minThreshold}>
                            <input
                                className={inputCls}
                                type="number"
                                min={0}
                                value={minThreshold}
                                onChange={(e) => setMinThreshold(e.target.value)}
                                placeholder="Optional"
                            />
                        </Field>
                    </div>

                    <Field label={t.inventory.supplier}>
                        <input
                            className={inputCls}
                            value={supplierName}
                            onChange={(e) => setSupplierName(e.target.value)}
                            placeholder="Optional"
                        />
                    </Field>

                    {/* Expiry alerts */}
                    <div className="rounded-lg border border-slate-200 dark:border-slate-700 p-4 space-y-3">
                        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.inventory.expiryAlerts}</p>
                        <label className="flex items-center gap-2.5 cursor-pointer">
                            <input
                                type="checkbox"
                                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 accent-blue-600"
                                checked={trackExpiry}
                                onChange={(e) => setTrackExpiry(e.target.checked)}
                            />
                            <span className="text-sm text-slate-600 dark:text-slate-400">{t.inventory.trackExpiry}</span>
                        </label>
                        {trackExpiry && (
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                <Field label={t.inventory.expiryWarningDays}>
                                    <input
                                        className={inputCls}
                                        type="number"
                                        min={1}
                                        value={expiryWarningDays}
                                        onChange={(e) => setExpiryWarningDays(e.target.value)}
                                        placeholder={t.inventory.expiryThresholdHint}
                                    />
                                </Field>
                                <Field label={t.inventory.expiryCriticalDays}>
                                    <input
                                        className={inputCls}
                                        type="number"
                                        min={1}
                                        value={expiryCriticalDays}
                                        onChange={(e) => setExpiryCriticalDays(e.target.value)}
                                        placeholder={t.inventory.expiryThresholdHint}
                                    />
                                </Field>
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
