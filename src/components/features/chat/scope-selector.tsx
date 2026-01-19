"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Document } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/context";

export function ScopeSelector({
    documents,
    selectedIds,
    onSelectionChange,
}: {
    documents: Document[];
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
}) {
    const [isOpen, setIsOpen] = React.useState(false);
    const { t } = useTranslation();

    const toggleSelection = (id: string) => {
        if (selectedIds.includes(id)) {
            onSelectionChange(selectedIds.filter((i) => i !== id));
        } else {
            onSelectionChange([...selectedIds, id]);
        }
    };

    return (
        <div className="relative inline-block text-left">
            <div>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-[200px] sm:w-[250px] justify-between border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:border-slate-400"
                >
                    <div className="flex items-center truncate">
                        <Filter className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        {selectedIds.length === 0
                            ? <span className="text-slate-600">{t.selector.placeholder}</span>
                            : <span className="text-slate-900 font-medium">{selectedIds.length} {t.selector.selected}</span>}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
            </div>

            {isOpen && (
                <div className="absolute left-0 right-0 z-50 mt-1 max-h-60 w-[300px] overflow-auto rounded-md border border-slate-300 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-slate-900">
                    {documents.length === 0 ? (
                        <div className="p-2 text-sm text-slate-500">{t.selector.noDocs}</div>
                    ) : (
                        <div className="space-y-1">
                            {documents.map((doc) => (
                                <div
                                    key={doc.id}
                                    className={cn(
                                        "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-slate-100",
                                        selectedIds.includes(doc.id) ? "bg-slate-50" : ""
                                    )}
                                    onClick={() => toggleSelection(doc.id)}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            selectedIds.includes(doc.id) ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    <span className="truncate">{doc.filename}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Overlay to close on click outside - makeshift */}
                    <div
                        className="fixed inset-0 -z-10"
                        onClick={() => setIsOpen(false)}
                    />
                </div>
            )}
        </div>
    );
}
