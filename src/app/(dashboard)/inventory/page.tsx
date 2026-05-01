"use client";

import { useState, useEffect } from "react";
import { Package } from "lucide-react";
import { InventoryItem } from "@/lib/types";
import { inventoryService } from "@/lib/api/inventory-service";
import { InventoryList } from "@/components/features/inventory/inventory-list";
import { useAuth } from "@/components/features/auth/auth-context";
import { useTranslation } from "@/lib/i18n/context";
import { ROLES } from "@/lib/constants/auth";

export default function InventoryPage() {
    const { user } = useAuth();
    const { t } = useTranslation();
    const [items, setItems] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        inventoryService.getItems().then((data) => {
            setItems(data);
            setIsLoading(false);
        });
    }, []);

    const handleItemUpdated = (updated: InventoryItem) => {
        setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Package className="h-5 w-5" />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-slate-900">{t.inventory.title}</h2>
                    <p className="text-sm text-slate-500">{t.inventory.description}</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex flex-col items-center justify-center p-20 gap-3">
                    <div className="h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                    <p className="text-slate-500 animate-pulse">{t.common.loading}</p>
                </div>
            ) : (
                <InventoryList
                    items={items}
                    isAdmin={user?.role === ROLES.ADMIN}
                    onItemUpdated={handleItemUpdated}
                />
            )}
        </div>
    );
}
