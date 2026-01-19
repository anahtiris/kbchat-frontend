"use client";

import { useTranslation } from "@/lib/i18n/context";
import { Button } from "@/components/ui/button";
import { Globe } from "lucide-react";

export function LanguageSwitcher() {
    const { language, setLanguage } = useTranslation();

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={() => setLanguage(language === "en" ? "th" : "en")}
            className="text-slate-500 hover:text-slate-900"
        >
            <Globe className="mr-2 h-4 w-4" />
            {language === "en" ? "EN" : "TH"}
        </Button>
    );
}
