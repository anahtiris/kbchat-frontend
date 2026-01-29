"use client";

import { useState, useEffect } from "react";
import { X, Check, Loader2, AlertCircle, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KnowledgeBaseService } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

interface RegistrationProps {
    services: KnowledgeBaseService[];
    onSave: () => void;
    onCancel: () => void;
}

export function DocumentRegistration({ services, onSave, onCancel }: RegistrationProps) {
    const { t } = useTranslation();
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Form State
    const [serviceId, setServiceId] = useState<number | "">("");
    const [submodule, setSubmodule] = useState<string>("");
    const [blobDirectory, setBlobDirectory] = useState<string>("");
    const [pageFrom, setPageFrom] = useState<number>(1);
    const [pageTo, setPageTo] = useState<number>(1);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

    const selectedService = services.find(s => s.service_id === serviceId);

    const handleSave = async () => {
        if (!serviceId || !submodule || !blobDirectory) {
            setError("All fields are required");
            return;
        }

        if (pageFrom > pageTo) {
            setError(t.docs.rangeError);
            return;
        }

        setIsSaving(true);
        setError(null);

        try {
            const response = await fetch(`${backendUrl}/api/admin/documents`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_id: serviceId,
                    service_submodule: submodule,
                    blob_directory: blobDirectory,
                    page_from_inclusive: pageFrom,
                    page_to_inclusive: pageTo
                })
            });

            if (response.ok) {
                onSave();
            } else {
                const errData = await response.json();
                setError(errData.detail || "Failed to register manual");
            }
        } catch (err) {
            console.error("Registration error:", err);
            setError("Connection error. Please check your backend.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="rounded-xl border border-blue-200 bg-white shadow-lg animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 p-4">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <FileText className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900">{t.docs.registerManual}</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={onCancel} className="h-8 w-8 text-slate-400">
                    <X className="h-4 w-4" />
                </Button>
            </div>

            <div className="p-6 space-y-6">
                {error && (
                    <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 border border-red-100">
                        <AlertCircle className="h-4 w-4" />
                        {error}
                    </div>
                )}

                <div className="grid gap-6 sm:grid-cols-2">
                    {/* Service Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{t.docs.selectService}</label>
                        <select
                            value={serviceId}
                            onChange={(e) => {
                                setServiceId(Number(e.target.value));
                                setSubmodule("");
                            }}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="">{t.selector.servicePlaceholder}</option>
                            {services.map(s => (
                                <option key={s.service_id} value={s.service_id}>{s.service_name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Submodule Selection */}
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700">{t.docs.selectSubmodule}</label>
                        <select
                            value={submodule}
                            onChange={(e) => setSubmodule(e.target.value)}
                            disabled={!serviceId}
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            <option value="">{t.selector.submodulePlaceholder}</option>
                            {selectedService?.submodules.map(sub => (
                                <option key={sub} value={sub}>{sub}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* File Upload Section */}
                <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700">{t.docs.uploadFile}</label>
                    <div className="relative">
                        <input
                            type="file"
                            accept=".pdf"
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                    setBlobDirectory(`https://kbchathaprodstg.blob.core.windows.net/uploads/${file.name}`);
                                }
                            }}
                            className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0"
                        />
                        <div className={cn(
                            "flex items-center justify-between rounded-lg border-2 border-dashed p-4 transition-colors",
                            blobDirectory ? "border-blue-200 bg-blue-50/30" : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                        )}>
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "flex h-10 w-10 items-center justify-center rounded-lg shadow-sm",
                                    blobDirectory ? "bg-blue-600 text-white" : "bg-white text-slate-400"
                                )}>
                                    <Upload className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-slate-900">
                                        {blobDirectory ? blobDirectory.split('/').pop() : t.docs.chooseFile}
                                    </p>
                                    <p className="text-xs text-slate-500">PDF (Max 50MB)</p>
                                </div>
                            </div>
                            {blobDirectory && (
                                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                                    <Check className="h-3 w-3" />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Boundaries */}
                <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700">{t.docs.boundaries}</label>
                    <div className="flex items-center gap-4 rounded-lg bg-slate-50 p-4 border border-slate-100">
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs text-slate-500 uppercase font-bold tracking-tight">{t.docs.from}</label>
                            <Input
                                type="number"
                                value={pageFrom}
                                onChange={(e) => setPageFrom(parseInt(e.target.value) || 1)}
                                min={1}
                                className="bg-white"
                            />
                        </div>
                        <div className="flex-1 space-y-1.5">
                            <label className="text-xs text-slate-500 uppercase font-bold tracking-tight">{t.docs.to}</label>
                            <Input
                                type="number"
                                value={pageTo}
                                onChange={(e) => setPageTo(parseInt(e.target.value) || 1)}
                                min={1}
                                className="bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-slate-100 p-4 bg-slate-50/50">
                <Button variant="ghost" onClick={onCancel} disabled={isSaving}>
                    {t.common.cancel}
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-blue-600 hover:bg-blue-700 min-w-[100px]">
                    {isSaving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {t.common.saving}
                        </>
                    ) : (
                        <>
                            <Check className="mr-2 h-4 w-4" />
                            {t.docs.addManual}
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
