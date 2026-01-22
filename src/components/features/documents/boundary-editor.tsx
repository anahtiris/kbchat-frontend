"use client";

import { useState, useMemo } from "react";
import { Plus, Trash2, AlertTriangle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Document, RagBoundary } from "@/lib/types";
import { mockApi } from "@/lib/api/mock-service";
import { cn } from "@/lib/utils";
import { validateBoundaries } from "@/lib/validation/boundaries";
import { useTranslation } from "@/lib/i18n/context";

export function BoundaryEditor({
    document,
    onSave,
    onCancel
}: {
    document: Document;
    onSave: () => void;
    onCancel: () => void;
}) {
    const { t } = useTranslation();
    const [boundaries, setBoundaries] = useState<RagBoundary[]>(document.boundaries || []);
    const [isSaving, setIsSaving] = useState(false);

    const { isValid, errors } = useMemo(() =>
        validateBoundaries(boundaries, document.pageCount),
        [boundaries, document.pageCount]
    );

    const getErrorsForIndex = (index: number) => errors.filter(e => e.index === index);

    const addBoundary = (type: "include" | "exclude") => {
        setBoundaries([...boundaries, { type, pageStart: 1, pageEnd: 1 }]);
    };

    const removeBoundary = (index: number) => {
        setBoundaries(boundaries.filter((_, i) => i !== index));
    };

    const updateBoundary = (index: number, field: keyof RagBoundary, value: any) => {
        const newBoundaries = [...boundaries];
        newBoundaries[index] = { ...newBoundaries[index], [field]: value };
        setBoundaries(newBoundaries);
    };

    const handleSave = async () => {
        if (!isValid) return;
        setIsSaving(true);
        await mockApi.updateDocumentBoundaries(document.id, boundaries);
        setIsSaving(false);
        onSave();
    };

    const translateError = (err: any) => {
        switch (err.code) {
            case "PAGE_MIN": return t.docs.pageMinError;
            case "PAGE_MAX": return `${t.docs.pageMaxError} ${err.params?.max}`;
            case "INVALID_RANGE": return t.docs.rangeError;
            case "OVERLAP": return `${t.docs.overlapErrorWith}${err.params?.otherIndex}`;
            default: return t.common.unknownError;
        }
    };

    return (
        <div className="space-y-4 rounded-lg border border-slate-200 bg-slate-50 p-4 shadow-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:justify-between sm:items-start">
                <div>
                    <h3 className="font-semibold text-slate-900">{t.docs.configTitle}</h3>
                    <p className="text-sm text-slate-500">
                        {t.docs.totalPages}: <span className="font-medium text-slate-900">{document.pageCount}</span>
                    </p>
                </div>
            </div>

            <div className="space-y-4">
                {boundaries.map((boundary, index) => {
                    const fieldErrors = getErrorsForIndex(index);
                    const hasError = fieldErrors.length > 0;

                    return (
                        <div key={index} className={cn(
                            "group relative rounded-md border bg-white p-3 transition-all",
                            hasError ? "border-red-300 bg-red-50/30" : "border-slate-200"
                        )}>
                            <div className="flex flex-wrap items-center gap-3">
                                <select
                                    value={boundary.type}
                                    onChange={(e) => updateBoundary(index, "type", e.target.value)}
                                    className="h-9 w-24 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900"
                                >
                                    <option value="include">{t.docs.include}</option>
                                    <option value="exclude">{t.docs.exclude}</option>
                                </select>

                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-slate-500 w-10 text-right">{t.docs.from}</span>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={boundary.pageStart}
                                        onChange={(e) => updateBoundary(index, "pageStart", parseInt(e.target.value) || 0)}
                                        className={cn("h-9 w-20 border-slate-300",
                                            fieldErrors.some(e => e.field === 'pageStart') && "border-red-500 ring-red-200"
                                        )}
                                    />
                                    <span className="text-sm text-slate-500 w-6 text-center">{t.docs.to}</span>
                                    <Input
                                        type="number"
                                        min={1}
                                        value={boundary.pageEnd}
                                        onChange={(e) => updateBoundary(index, "pageEnd", parseInt(e.target.value) || 0)}
                                        className={cn("h-9 w-20 border-slate-300",
                                            fieldErrors.some(e => e.field === 'pageEnd') && "border-red-500 ring-red-200"
                                        )}
                                    />
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="ml-auto text-slate-400 hover:text-red-500 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
                                    onClick={() => removeBoundary(index)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>

                            {/* Error Messages */}
                            {hasError && (
                                <div className="mt-2 text-xs text-red-600 flex flex-col gap-0.5 animate-in slide-in-from-top-1">
                                    {fieldErrors.map((err, i) => (
                                        <span key={i} className="flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> {translateError(err)}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}

                {boundaries.length === 0 && (
                    <div className="py-6 text-center text-sm text-slate-400 border-2 border-dashed border-slate-300 rounded-md bg-slate-50/50">
                        {t.docs.noBoundaries}
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => addBoundary("include")} className="bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50">
                    <Plus className="mr-1 h-3 w-3 text-slate-600" /> {t.docs.include}
                </Button>
                <Button variant="outline" size="sm" onClick={() => addBoundary("exclude")} className="bg-white border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50">
                    <Plus className="mr-1 h-3 w-3 text-slate-600" /> {t.docs.exclude}
                </Button>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                <span className="hidden sm:inline-flex items-center text-xs text-slate-500">
                    <AlertTriangle className="mr-1 h-3 w-3 text-amber-500" />
                    {t.docs.boundaryAffect}
                </span>
                <div className="flex gap-2 w-full sm:w-auto justify-end">
                    <Button variant="ghost" onClick={onCancel} disabled={isSaving}>{t.common.cancel}</Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving || !isValid}
                        className={cn(!isValid && "opacity-50 cursor-not-allowed")}
                    >
                        {isSaving ? t.common.saving : t.common.save}
                    </Button>
                </div>
            </div>
        </div>
    );
}
