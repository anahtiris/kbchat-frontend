"use client";

import { useState } from "react";
import { Play, Clock, Layers, Search, Plus } from "lucide-react";
import { Procedure } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useTranslation } from "@/lib/i18n/context";

interface ProcedureListProps {
    procedures: Procedure[];
    onRun: (procedure: Procedure) => void;
    isAdmin: boolean;
}

export function ProcedureList({ procedures, onRun, isAdmin }: ProcedureListProps) {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");

    const filtered = procedures.filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search procedures..."
                        className="pl-9"
                    />
                </div>
                {isAdmin && (
                    <Button className="bg-blue-600 hover:bg-blue-700 shrink-0">
                        <Plus className="mr-2 h-4 w-4" /> {t.procedures.addProcedure}
                    </Button>
                )}
            </div>

            {filtered.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-12 text-center">
                    <Layers className="mx-auto mb-4 h-12 w-12 text-slate-300" />
                    <p className="text-slate-500">{search ? "No procedures match your search." : t.procedures.noProcedures}</p>
                </div>
            ) : (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered.map((proc) => (
                        <div
                            key={proc.id}
                            className="flex flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex-1 space-y-2 mb-4">
                                <h4 className="font-bold text-slate-900 leading-snug">{proc.name}</h4>
                                <div className="flex flex-wrap gap-1.5">
                                    {proc.category && <Badge variant="blue">{proc.category}</Badge>}
                                    {proc.estimated_duration_min && (
                                        <Badge variant="slate">
                                            <Clock className="mr-1 h-2.5 w-2.5" />
                                            {proc.estimated_duration_min} min
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-xs text-slate-500">
                                    {proc.consumables.length} consumable{proc.consumables.length !== 1 ? "s" : ""}
                                    {proc.consumables.filter((c) => c.is_optional).length > 0 && (
                                        <span className="text-slate-400">
                                            {" "}({proc.consumables.filter((c) => c.is_optional).length} optional)
                                        </span>
                                    )}
                                </p>
                                {proc.notes && (
                                    <p className="text-xs text-slate-500 line-clamp-2">{proc.notes}</p>
                                )}
                            </div>

                            <Button
                                className="w-full bg-blue-600 hover:bg-blue-700"
                                onClick={() => onRun(proc)}
                            >
                                <Play className="mr-2 h-4 w-4" />
                                {t.procedures.runProcedure}
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
