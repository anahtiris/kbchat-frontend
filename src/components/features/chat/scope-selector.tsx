"use client";

import * as React from "react";
import { Check, ChevronsUpDown, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { KnowledgeBaseService } from "@/lib/types";
import { useTranslation } from "@/lib/i18n/context";

export function ScopeSelector({
    services,
    selectedServiceId,
    selectedSubmodule,
    onSelectionChange,
}: {
    services: KnowledgeBaseService[];
    selectedServiceId: number | null;
    selectedSubmodule: string | null;
    onSelectionChange: (serviceId: number | null, submodule: string | null) => void;
}) {
    const [isServiceOpen, setIsServiceOpen] = React.useState(false);
    const [isSubmoduleOpen, setIsSubmoduleOpen] = React.useState(false);
    const { t } = useTranslation();

    const serviceRef = React.useRef<HTMLDivElement>(null);
    const submoduleRef = React.useRef<HTMLDivElement>(null);

    const selectedService = services.find(s => s.service_id === selectedServiceId);

    // Close dropdowns when clicking outside their containers
    React.useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (serviceRef.current && !serviceRef.current.contains(e.target as Node)) {
                setIsServiceOpen(false);
            }
            if (submoduleRef.current && !submoduleRef.current.contains(e.target as Node)) {
                setIsSubmoduleOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="flex flex-wrap items-center gap-2">
            {/* Service Selector */}
            <div ref={serviceRef} className="relative inline-block text-left">
                <Button
                    variant="outline"
                    onClick={() => setIsServiceOpen(!isServiceOpen)}
                    className="w-[180px] justify-between border-slate-300 bg-white text-slate-900 font-medium hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                >
                    <div className="flex items-center truncate">
                        <Filter className="mr-2 h-4 w-4 shrink-0 text-slate-500" />
                        <span className="truncate">
                            {selectedService ? selectedService.service_name : t.selector.servicePlaceholder}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                </Button>

                {isServiceOpen && (
                    <div className="absolute left-0 z-50 mt-1 max-h-60 w-[220px] overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        {services.length === 0 ? (
                            <div className="p-3 text-sm text-slate-500 italic">{t.selector.noServices}</div>
                        ) : (
                            services.map((service) => (
                                <div
                                    key={service.service_id}
                                    className={cn(
                                        "flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm transition-colors hover:bg-slate-100",
                                        selectedServiceId === service.service_id ? "bg-slate-50 text-slate-900 font-semibold" : "text-slate-700"
                                    )}
                                    onClick={() => {
                                        const defaultSub = service.submodules.length > 0 ? service.submodules[0] : null;
                                        onSelectionChange(service.service_id, defaultSub);
                                        setIsServiceOpen(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4 text-blue-600", selectedServiceId === service.service_id ? "opacity-100" : "opacity-0")} />
                                    <span className="truncate">{service.service_name}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>

            {/* Submodule Selector (Only visible if a service is selected) */}
            <div ref={submoduleRef} className="relative inline-block text-left">
                <Button
                    variant="outline"
                    disabled={!selectedService}
                    onClick={() => setIsSubmoduleOpen(!isSubmoduleOpen)}
                    className={cn(
                        "w-[200px] justify-between border-slate-300 bg-white text-slate-900 font-medium",
                        !selectedService ? "opacity-40 cursor-not-allowed" : "hover:bg-slate-50 hover:border-slate-400 shadow-sm"
                    )}
                >
                    <span className="truncate">
                        {selectedSubmodule || t.selector.submodulePlaceholder}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 text-slate-400" />
                </Button>

                {isSubmoduleOpen && selectedService && (
                    <div className="absolute left-0 z-50 mt-1 max-h-60 w-[240px] overflow-auto rounded-md border border-slate-200 bg-white p-1 shadow-lg ring-1 ring-black ring-opacity-5">
                        {selectedService.submodules.length === 0 ? (
                            <div className="p-3 text-sm text-slate-500 italic">No submodules</div>
                        ) : (
                            selectedService.submodules.map((sub) => (
                                <div
                                    key={sub}
                                    className={cn(
                                        "flex cursor-pointer items-center rounded-sm px-3 py-2 text-sm transition-colors hover:bg-slate-100",
                                        selectedSubmodule === sub ? "bg-slate-50 text-slate-900 font-semibold" : "text-slate-700"
                                    )}
                                    onClick={() => {
                                        onSelectionChange(selectedServiceId, sub);
                                        setIsSubmoduleOpen(false);
                                    }}
                                >
                                    <Check className={cn("mr-2 h-4 w-4 text-blue-600", selectedSubmodule === sub ? "opacity-100" : "opacity-0")} />
                                    <span className="truncate">{sub}</span>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
