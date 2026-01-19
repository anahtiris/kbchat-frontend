"use client";

import { useAuth, Role } from "@/components/features/auth/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BadgePlus, LayoutDashboard, ShieldCheck } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";

export default function LoginPage() {
    const { login, isLoading } = useAuth();
    const { t } = useTranslation();

    const handleLogin = async (role: Role) => {
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
                        className="w-full bg-[#2F2F2F] hover:bg-[#1a1a1a] text-white"
                        disabled={isLoading}
                        onClick={() => handleLogin('doctor')}
                    >
                        {isLoading ? "Signing in..." : t.login.signInButton}
                    </Button>

                    <div className="mt-6 rounded-md bg-yellow-50 p-4 border border-yellow-100">
                        <p className="text-xs font-medium text-yellow-800 mb-2">{t.login.modeLabel}</p>
                        <div className="grid grid-cols-3 gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleLogin('admin')} disabled={isLoading} className="text-xs">
                                <ShieldCheck className="mr-1 h-3 w-3" /> {t.login.roles.admin}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleLogin('doctor')} disabled={isLoading} className="text-xs">
                                <BadgePlus className="mr-1 h-3 w-3" /> {t.login.roles.doctor}
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleLogin('staff')} disabled={isLoading} className="text-xs">
                                {t.login.roles.staff}
                            </Button>
                        </div>
                    </div>
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
