"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Edit2, Check, X, Layers, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { KnowledgeBaseService } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/context";
import { cn } from "@/lib/utils";

export function ServiceManager() {
    const { t } = useTranslation();
    const [services, setServices] = useState<KnowledgeBaseService[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newServiceName, setNewServiceName] = useState("");
    const [newServiceSubmodules, setNewServiceSubmodules] = useState<string[]>([]);
    const [editingServiceId, setEditingServiceId] = useState<number | null>(null);
    const [editingSubmodules, setEditingSubmodules] = useState<string[]>([]);
    const [newSubmodule, setNewSubmodule] = useState("");
    const [deletePendingId, setDeletePendingId] = useState<number | null>(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

    const loadServices = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${backendUrl}/api/admin/services`);
            if (response.ok) {
                const data = await response.json();
                setServices(data);
            }
        } catch (error) {
            console.error("Failed to load services:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadServices();
    }, []);

    const handleCreateService = async () => {
        if (!newServiceName.trim()) return;
        try {
            const response = await fetch(`${backendUrl}/api/admin/services`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    service_name: newServiceName,
                    submodules: newServiceSubmodules
                })
            });
            if (response.ok) {
                setNewServiceName("");
                setNewServiceSubmodules([]);
                setIsCreating(false);
                loadServices();
            }
        } catch (error) {
            console.error("Failed to create service:", error);
        }
    };

    const handleUpdateSubmodules = async (id: number) => {
        try {
            const response = await fetch(`${backendUrl}/api/admin/services/${id}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ submodules: editingSubmodules })
            });
            if (response.ok) {
                setEditingServiceId(null);
                loadServices();
            }
        } catch (error) {
            console.error("Failed to update submodules:", error);
        }
    };

    const handleDeleteService = async () => {
        if (deletePendingId === null) return;
        try {
            const response = await fetch(`${backendUrl}/api/admin/services/${deletePendingId}`, {
                method: "DELETE",
                credentials: "include",
            });
            if (response.ok) {
                loadServices();
            }
        } catch (error) {
            console.error("Failed to delete service:", error);
        } finally {
            setDeletePendingId(null);
        }
    };

    const startEditing = (service: KnowledgeBaseService) => {
        setEditingServiceId(service.service_id);
        setEditingSubmodules([...service.submodules]);
    };

    const addSubmodule = () => {
        if (!newSubmodule.trim()) return;
        if (editingSubmodules.includes(newSubmodule.trim())) return;
        setEditingSubmodules([...editingSubmodules, newSubmodule.trim()]);
        setNewSubmodule("");
    };

    const removeSubmodule = (sub: string) => {
        setEditingSubmodules(editingSubmodules.filter(s => s !== sub));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-slate-900">{t.docs.managementTitle}</h3>
                    <p className="text-sm text-slate-500">{t.docs.managementDesc}</p>
                </div>
                <Button onClick={() => setIsCreating(true)} disabled={isCreating}>
                    <Plus className="mr-2 h-4 w-4" /> {t.docs.addService}
                </Button>
            </div>

            {isCreating && (
                <div className="rounded-lg border border-blue-200 bg-blue-50/50 p-6 animate-in fade-in slide-in-from-top-2 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t.docs.serviceName}</label>
                            <Input
                                value={newServiceName}
                                onChange={(e) => setNewServiceName(e.target.value)}
                                placeholder={t.docs.servicePlaceholder}
                                className="bg-white"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-700">{t.docs.submodules}</label>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                                {newServiceSubmodules.map((sub) => (
                                    <span key={sub} className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                                        {sub}
                                        <button
                                            onClick={() => setNewServiceSubmodules(newServiceSubmodules.filter(s => s !== sub))}
                                            className="ml-1.5 text-blue-400 hover:text-red-500"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-2">
                                <Input
                                    value={newSubmodule}
                                    onChange={(e) => setNewSubmodule(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            e.preventDefault();
                                            if (newSubmodule.trim() && !newServiceSubmodules.includes(newSubmodule.trim())) {
                                                setNewServiceSubmodules([...newServiceSubmodules, newSubmodule.trim()]);
                                                setNewSubmodule("");
                                            }
                                        }
                                    }}
                                    placeholder={t.docs.submodulePlaceholder}
                                    className="bg-white text-sm"
                                />
                                <Button
                                    size="sm"
                                    variant="outline"
                                    className="bg-white border-slate-300"
                                    onClick={() => {
                                        if (newSubmodule.trim() && !newServiceSubmodules.includes(newSubmodule.trim())) {
                                            setNewServiceSubmodules([...newServiceSubmodules, newSubmodule.trim()]);
                                            setNewSubmodule("");
                                        }
                                    }}
                                >
                                    <Plus className="h-4 w-4 text-slate-600" />
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 border-t border-blue-100 pt-4">
                        <Button variant="ghost" onClick={() => {
                            setIsCreating(false);
                            setNewServiceSubmodules([]);
                            setNewServiceName("");
                        }}>{t.common.cancel}</Button>
                        <Button onClick={handleCreateService} disabled={!newServiceName.trim()}>
                            {t.common.save}
                        </Button>
                    </div>
                </div>
            )}

            <div className="grid gap-4">
                {isLoading ? (
                    <div className="py-12 text-center text-slate-400">{t.common.loading}</div>
                ) : services.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                        <Layers className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                        <p className="text-slate-500">{t.selector.noServices}</p>
                    </div>
                ) : (
                    services.map((service) => (
                        <div key={service.service_id} className="rounded-lg border border-slate-200 bg-white p-4 transition-all hover:shadow-md">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="font-bold text-slate-900 flex items-center gap-2">
                                        <Layers className="h-4 w-4 text-slate-400" />
                                        {service.service_name}
                                        <span className="text-xs font-normal text-slate-400">(ID: {service.service_id})</span>
                                    </h4>
                                    <div className="flex flex-wrap gap-1.5 pt-2">
                                        {editingServiceId === service.service_id ? (
                                            <div className="w-full space-y-3">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {editingSubmodules.map((sub) => (
                                                        <span key={sub} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">
                                                            {sub}
                                                            <button
                                                                onClick={() => removeSubmodule(sub)}
                                                                className="ml-1.5 text-slate-400 hover:text-red-500"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <Input
                                                        value={newSubmodule}
                                                        onChange={(e) => setNewSubmodule(e.target.value)}
                                                        onKeyDown={(e) => e.key === "Enter" && addSubmodule()}
                                                        placeholder={t.docs.submodulePlaceholder}
                                                        className="h-9 text-sm"
                                                    />
                                                    <Button size="sm" onClick={addSubmodule} variant="outline" className="border-slate-300">
                                                        <Plus className="h-4 w-4 text-slate-600" />
                                                    </Button>
                                                </div>
                                                <div className="flex justify-end gap-2 pt-2">
                                                    <Button variant="ghost" size="sm" onClick={() => setEditingServiceId(null)}>
                                                        {t.common.cancel}
                                                    </Button>
                                                    <Button size="sm" onClick={() => handleUpdateSubmodules(service.service_id)}>
                                                        <Check className="mr-1 h-4 w-4" /> {t.common.save}
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                {service.submodules.length === 0 ? (
                                                    <span className="text-xs italic text-slate-400">No submodules defined</span>
                                                ) : (
                                                    service.submodules.map((sub) => (
                                                        <span key={sub} className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                                                            {sub}
                                                        </span>
                                                    ))
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>

                                {editingServiceId !== service.service_id && (
                                    <div className="flex gap-1">
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900" onClick={() => startEditing(service)}>
                                            <Edit2 className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500" onClick={() => setDeletePendingId(service.service_id)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <Dialog open={deletePendingId !== null} onClose={() => setDeletePendingId(null)}>
                <div className="flex flex-col gap-4 pt-2">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
                            <AlertTriangle className="h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-semibold text-slate-900">{t.docs.deleteServiceConfirmTitle}</p>
                            <p className="text-sm text-slate-500">{t.docs.deleteServiceConfirm}</p>
                        </div>
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setDeletePendingId(null)}>{t.common.cancel}</Button>
                        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={handleDeleteService}>{t.docs.deleteService}</Button>
                    </div>
                </div>
            </Dialog>
        </div>
    );
}
