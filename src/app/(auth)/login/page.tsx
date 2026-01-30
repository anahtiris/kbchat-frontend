"use client";

import { useAuth, Role } from "@/components/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BadgePlus, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { ROLES } from "@/lib/constants/auth";

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const { t } = useTranslation();

    const isDev = process.env.NEXT_PUBLIC_ENV_NAME === "DEV";

    const handleAzureLogin = () => {
        const clientId = process.env.NEXT_PUBLIC_AZURE_AD_CLIENT_ID;
        const tenantId = process.env.NEXT_PUBLIC_AZURE_AD_TENANT_ID;
        const redirectUri = process.env.NEXT_PUBLIC_AZURE_AD_REDIRECT_URI || `${window.location.origin}/auth/callback`;
        const scope = encodeURIComponent("openid profile email");
        const state = Math.random().toString(36).substring(7);

        const azureUrl = `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${scope}&state=${state}`;
        window.location.href = azureUrl;
    };

    const handleMockLogin = async (role: Role) => {
        await login(role);
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50">
            <Card className="w-full max-w-md border-0 shadow-xl ring-1 ring-slate-900/5">
                <CardHeader className="space-y-1 text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-blue-600 text-white shadow-lg shadow-blue-600/20">
                        <LayoutDashboard className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-slate-900">
                        {t.login.title}
                    </CardTitle>
                    <p className="text-sm text-slate-500">
                        {t.login.subtitle}
                    </p>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-slate-200" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">
                                {t.auth.signIn}
                            </span>
                        </div>
                    </div>

                    <Button
                        className="w-full bg-[#0078d4] hover:bg-[#005a9e] text-white flex items-center justify-center gap-3 py-6"
                        disabled={isLoading}
                        onClick={handleAzureLogin}
                    >
                        <svg className="h-5 w-5" viewBox="0 0 23 23">
                            <path fill="#f3f3f3" d="M0 0h11.5v11.5H0z" /><path fill="#f3f3f3" d="M11.5 0H23v11.5H11.5z" /><path fill="#f3f3f3" d="M0 11.5h11.5V23H0z" /><path fill="#f3f3f3" d="M11.5 11.5H23V23H11.5z" />
                        </svg>
                        {t.login.signInButton}
                    </Button>

                    {isDev && (
                        <div className="mt-6 space-y-3 pt-4 border-t border-dashed border-slate-200">
                            <div className="flex items-center gap-2">
                                <span className="h-px flex-1 bg-slate-100" />
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.login.modeLabel}</span>
                                <span className="h-px flex-1 bg-slate-100" />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMockLogin(ROLES.ADMIN)}
                                    disabled={isLoading}
                                    className="text-[10px] h-8 border-slate-200 hover:bg-slate-50"
                                >
                                    <ShieldCheck className="mr-1 h-3 w-3 text-slate-500" /> {t.login.roles.admin}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleMockLogin(ROLES.VIEWER)}
                                    disabled={isLoading}
                                    className="text-[10px] h-8 border-slate-200 hover:bg-slate-50"
                                >
                                    <BadgePlus className="mr-1 h-3 w-3 text-slate-500" /> {t.login.roles.viewer}
                                </Button>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <p className="text-center text-xs text-blue-600 animate-pulse font-medium">
                            {t.common.signingIn}
                        </p>
                    )}
                </CardContent>
                <CardFooter className="justify-center border-t border-slate-100 bg-slate-50/50 py-4">
                    <p className="text-xs text-slate-400">
                        &copy; {new Date().getFullYear()} {t.login.copyright}
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
}
