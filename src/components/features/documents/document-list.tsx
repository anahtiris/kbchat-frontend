"use client";

import { useState, useEffect } from "react";
import { Upload, FileText, Settings, Plus, Search, Filter as FilterIcon, ChevronRight, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { mockApi } from "@/lib/api/mock-service";
import { Document, KnowledgeBaseService } from "@/lib/types";
import { BoundaryEditor } from "./boundary-editor";
import { DocumentRegistration } from "./document-registration";
import { useAuth } from "@/components/features/auth/auth-context";
import { Tooltip } from "@/components/ui/tooltip";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";
import { ROLES } from "@/lib/constants/auth";

export function DocumentList() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [services, setServices] = useState<KnowledgeBaseService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRegistering, setIsRegistering] = useState(false);
    const [editingDocId, setEditingDocId] = useState<string | null>(null);

    // Filters
    const [serviceFilter, setServiceFilter] = useState<string>("all");
    const [submoduleFilter, setSubmoduleFilter] = useState<string>("all");

    useEffect(() => {
        loadDocs();
        loadServices();
    }, []);

    const loadServices = async () => {
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
            const response = await fetch(`${backendUrl}/api/admin/services`);
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }
        } catch (error) {
            console.error("Failed to load services:", error);
        }
    };

    const loadDocs = async () => {
        setIsLoading(true);
        try {
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";
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
                    id: d.document_id ? `doc-${d.document_id}` : Math.random().toString(36).substring(2, 9),
                    document_id: d.document_id,
                    service_id: d.service_id,
                    service_name: d.service_name,
                    service_submodule: d.service_submodule,
                    blob_directory: d.blob_directory,
                    page_from_inclusive: d.page_from_inclusive,
                    page_to_inclusive: d.page_to_inclusive,
                    page_to_skip: d.page_to_skip,
                    created_date: d.created_date,
                    // Derived UI fields
                    filename: d.filename || (d.blob_directory ? d.blob_directory.split('/').pop() : d.service_submodule) || "Manual",
                    uploadedBy: d.uploadedBy || "System",
                    uploadedAt: d.created_date || new Date().toISOString(),
                    size: d.size || "N/A",
                    pageCount: (d.page_to_inclusive !== undefined && d.page_from_inclusive !== undefined)
                        ? d.page_to_inclusive - d.page_from_inclusive + 1
                        : 0,
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


    const canEdit = user?.role === ROLES.ADMIN;

    const filteredDocs = documents.filter(doc => {
        const matchesService = serviceFilter === "all" || doc.service_name === serviceFilter;
        const matchesSubmodule = submoduleFilter === "all" || doc.service_submodule === submoduleFilter;
        return matchesService && matchesSubmodule;
    });

    const activeSubmodules = serviceFilter === "all"
        ? []
        : services.find(s => s.service_name === serviceFilter)?.submodules || [];

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t.docs.tabManuals}</h2>
                    <p className="text-sm text-slate-500">{t.docs.description}</p>
                </div>
                {canEdit && (
                    <Button onClick={() => setIsRegistering(true)} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="mr-2 h-4 w-4" /> {t.docs.registerManual}
                    </Button>
                )}
            </div>

            {isRegistering && (
                <div className="mb-8">
                    <DocumentRegistration
                        services={services}
                        onSave={() => {
                            setIsRegistering(false);
                            loadDocs();
                        }}
                        onCancel={() => setIsRegistering(false)}
                    />
                </div>
            )}
            <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-2">
                    <FilterIcon className="h-4 w-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">{t.common.filters || "Filters"}:</span>
                </div>

                <select
                    value={serviceFilter}
                    onChange={(e) => {
                        setServiceFilter(e.target.value);
                        setSubmoduleFilter("all");
                    }}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">{t.docs.filterService}</option>
                    {services.map(s => (
                        <option key={s.service_id} value={s.service_name}>{s.service_name}</option>
                    ))}
                </select>

                <select
                    value={submoduleFilter}
                    onChange={(e) => setSubmoduleFilter(e.target.value)}
                    disabled={serviceFilter === "all"}
                    className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                >
                    <option value="all">{t.docs.filterSubmodule}</option>
                    {activeSubmodules.map(sub => (
                        <option key={sub} value={sub}>{sub}</option>
                    ))}
                </select>

                {(serviceFilter !== "all" || submoduleFilter !== "all") && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                            setServiceFilter("all");
                            setSubmoduleFilter("all");
                        }}
                        className="h-9 px-3 text-slate-500 hover:text-slate-900 hover:bg-slate-200/50"
                    >
                        <RotateCcw className="mr-2 h-3 w-3" />
                        {t.common.clearFilters}
                    </Button>
                )}

                <div className="ml-auto text-xs text-slate-500">
                    Showing {filteredDocs.length} Manuals
                </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center p-20 space-y-4">
                        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-500 animate-pulse">{t.common.loading}</p>
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="p-20 text-center text-slate-500">
                        <FileText className="mx-auto mb-4 h-16 w-16 text-slate-200" />
                        <p className="text-lg font-medium">{t.docs.noDocs}</p>
                        <p className="text-sm">Try adjusting your filters or add a new manual.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-slate-100">
                        {filteredDocs.map((doc) => (
                            <div key={doc.id} className="p-4 transition-colors hover:bg-slate-50">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
                                            <FileText className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-semibold text-slate-900">{doc.filename}</h4>
                                                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-600 tracking-wider">
                                                    ID: {doc.document_id}
                                                </span>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="flex h-1.5 w-1.5 rounded-full bg-blue-500"></span>
                                                    <span className="font-medium text-slate-700">{doc.service_name}</span>
                                                    <ChevronRight className="h-3 w-3 text-slate-300" />
                                                    <span className="font-medium text-slate-900">{doc.service_submodule}</span>
                                                </div>
                                                <span className="text-slate-300">|</span>
                                                <span className="flex items-center gap-1">
                                                    <FileText className="h-3 w-3" />
                                                    {doc.pageCount} {t.docs.pages} ({doc.page_from_inclusive}-{doc.page_to_inclusive})
                                                </span>
                                                <span className="hidden sm:inline text-slate-300">|</span>
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
