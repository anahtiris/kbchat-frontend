"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockApi } from "@/lib/api/mock-service";
import { Document } from "@/lib/types";
import { BoundaryEditor } from "./boundary-editor";
import { useAuth } from "@/components/features/auth/auth-context";
import { Tooltip } from "@/components/ui/tooltip";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function DocumentList() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [editingDocId, setEditingDocId] = useState<string | null>(null);

    useEffect(() => {
        loadDocs();
    }, []);

    const loadDocs = async () => {
        setIsLoading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";
            console.log("Fetching documents from:", `${backendUrl}/api/admin/documents`);
            const response = await fetch(`${backendUrl}/api/admin/documents`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();

                // Map backend response fields to our Document type
                const mapBackendDoc = (d: any): Document => ({
                    id: d.id || d.service_submodule || Math.random().toString(36).substring(2, 9),
                    service_id: d.service_id,
                    service_submodule: d.service_submodule,
                    blob_directory: d.blob_directory,
                    page_from_inclusive: d.page_from_inclusive,
                    page_to_inclusive: d.page_to_inclusive,
                    // Derived UI fields
                    filename: d.filename || (d.blob_directory ? d.blob_directory.split('/').pop() : d.service_submodule) || "Manual",
                    uploadedBy: d.uploadedBy || "System",
                    uploadedAt: d.uploadedAt || d.uploaded_at || new Date().toISOString(),
                    size: d.size || "N/A",
                    pageCount: d.pageCount || (d.page_to_inclusive !== undefined ? d.page_to_inclusive - d.page_from_inclusive + 1 : 0),
                    boundaries: d.boundaries || (d.page_from_inclusive !== undefined ? [
                        { type: "include", pageStart: d.page_from_inclusive, pageEnd: d.page_to_inclusive || d.page_from_inclusive }
                    ] : [])
                });

                const docs = (Array.isArray(data) ? data : data ? [data] : []).map(mapBackendDoc);
                setDocuments(docs);
            } else {
                console.error("Failed to load documents", response.status);
            }
        } catch (error) {
            console.error("Error loading documents:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            await mockApi.uploadDocument(file);
            await loadDocs();
        } finally {
            setUploading(false);
        }
    };

    const canEdit = user?.role === "admin";

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-slate-900">{t.docs.title}</h2>
                    <p className="text-sm text-slate-500">{t.docs.description}</p>
                </div>
                <div className="relative">
                    {canEdit ? (
                        <>
                            <input
                                type="file"
                                className="absolute inset-0 cursor-pointer opacity-0"
                                accept=".pdf"
                                onChange={handleUpload}
                                disabled={uploading}
                            />
                            <Button disabled={uploading} className="cursor-pointer">
                                {uploading ? (
                                    t.common.uploading
                                ) : (
                                    <><Upload className="mr-2 h-4 w-4" /> {t.common.upload}</>
                                )}
                            </Button>
                        </>
                    ) : (
                        <Tooltip content={t.docs.permUpload}>
                            <div className="inline-block">
                                <Button disabled variant="outline">
                                    <Upload className="mr-2 h-4 w-4" /> {t.common.upload}
                                </Button>
                            </div>
                        </Tooltip>
                    )}
                </div>
            </div>

            <div className="rounded-md border border-slate-200 bg-white">
                {isLoading ? (
                    <div className="p-8 text-center text-slate-400">{t.common.loading}</div>
                ) : documents.length === 0 ? (
                    <div className="p-12 text-center text-slate-500">
                        <FileText className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <p>{t.docs.noDocs}</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {documents.map((doc) => (
                            <div key={doc.id} className="p-4 transition-colors hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-slate-900">{doc.filename}</h4>
                                            <div className="flex items-center gap-1 text-xs text-slate-500">
                                                <span>{doc.size}</span>
                                                <span>•</span>
                                                <span>{doc.pageCount} {t.docs.pages}</span>
                                                <span className="hidden sm:inline">•</span>
                                                <span className="hidden sm:inline">{t.docs.uploadedBy} {doc.uploadedBy}</span>
                                                <span className="hidden sm:inline">{t.docs.uploadedOn} {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {canEdit ? (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setEditingDocId(editingDocId === doc.id ? null : doc.id)}
                                                className={cn(
                                                    "border-slate-300 text-slate-700 hover:text-slate-900 hover:bg-slate-50",
                                                    editingDocId === doc.id ? "bg-slate-100 border-slate-400 text-slate-900" : ""
                                                )}
                                            >
                                                <Settings className="mr-2 h-3 w-3" />
                                                {t.docs.configure}
                                            </Button>
                                        ) : (
                                            <Tooltip content={t.docs.permEdit}>
                                                <div className="inline-block">
                                                    <Button variant="outline" size="sm" disabled>
                                                        <Settings className="mr-2 h-3 w-3" />
                                                        {t.docs.configure}
                                                    </Button>
                                                </div>
                                            </Tooltip>
                                        )}
                                    </div>
                                </div>

                                {editingDocId === doc.id && (
                                    <div className="mt-4 pl-14">
                                        <BoundaryEditor
                                            document={doc}
                                            onSave={() => {
                                                setEditingDocId(null);
                                                loadDocs();
                                            }}
                                            onCancel={() => setEditingDocId(null)}
                                        />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
