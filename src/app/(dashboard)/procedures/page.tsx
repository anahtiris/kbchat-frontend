"use client";

import { useState, useEffect } from "react";
import { Stethoscope, CheckCircle2, X } from "lucide-react";
import { Procedure, InventoryItem, ProcedureExecution } from "@/lib/types";
import { inventoryService } from "@/lib/api/inventory-service";
import { ProcedureList } from "@/components/features/procedures/procedure-list";
import { ProcedureRunner } from "@/components/features/procedures/procedure-runner";
import { useAuth } from "@/components/features/auth/auth-context";
import { useTranslation } from "@/lib/i18n/context";
import { ROLES } from "@/lib/constants/auth";

export default function ProceduresPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [runningProcedure, setRunningProcedure] = useState<Procedure | null>(null);
    const [lastExecution, setLastExecution] = useState<ProcedureExecution | null>(null);

    useEffect(() => {
        Promise.all([inventoryService.getProcedures(), inventoryService.getItems()]).then(
            ([procs, invItems]) => {
                setProcedures(procs);
                setItems(invItems);
                setIsLoading(false);
            }
        );
    }, []);

    const handleSuccess = (execution: ProcedureExecution, updatedItems: InventoryItem[]) => {
        setItems(updatedItems);
        setRunningProcedure(null);
        setLastExecution(execution);
        setTimeout(() => setLastExecution(null), 5000);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Stethoscope className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t.procedures.title}</h2>
                    <p className="text-sm text-slate-500">{t.procedures.description}</p>
                </div>
            </div>

            {/* Success banner */}
            {lastExecution && (
                <div className="flex items-center justify-between rounded-lg border border-green-200 bg-green-50 p-4 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                        <div>
                            <p className="text-sm font-semibold text-green-800">{t.procedures.executionSuccess}</p>
                            <p className="text-xs text-green-700 mt-0.5">
                                <span className="font-medium">{lastExecution.procedure_name}</span>
                                {" — "}
                                {lastExecution.items.map((i) => `${i.item_name} ×${i.quantity_consumed}`).join(", ")}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => setLastExecution(null)} className="text-green-600 hover:text-green-800 ml-4 shrink-0">
                        <X className="h-4 w-4" />
                    </button>
                </div>
            )}

            {/* Procedure list */}
            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-3">
                    <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 animate-pulse">{t.common.loading}</p>
                </div>
            ) : (
                <ProcedureList
                    procedures={procedures}
                    onRun={setRunningProcedure}
                    isAdmin={user?.role === ROLES.ADMIN}
                />
            )}

            {/* Runner modal — only mounted when a procedure is selected */}
            {runningProcedure && (
                <ProcedureRunner
                    procedure={runningProcedure}
                    items={items}
                    onClose={() => setRunningProcedure(null)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}
