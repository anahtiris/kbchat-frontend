"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n/context";
import { useAuth } from "@/components/features/auth/auth-context";

function AuthCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { refreshSession } = useAuth();
    const [error, setError] = useState<string | null>(null);

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

    useEffect(() => {
        const handleCallback = async () => {
            const code = searchParams.get("code");
            const state = searchParams.get("state");

            if (!code) {
                setError("No authorization code received from Azure.");
                return;
            }

            try {
                // Handshake with the backend to exchange code for a session.
                // The client_secret stays on the backend — never send it from the browser.
                const response = await fetch(`${backendUrl}/api/auth/callback`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        code,
                        state,
                        redirect_uri: `${window.location.origin}/auth/callback`
                    }),
                    credentials: "include", // Essential for receiving the session cookie
                });

                if (response.ok) {
                    // Success! The session cookie is now set.
                    // We must refresh the session in our context BEFORE navigating.
                    await refreshSession();
                    router.push("/dashboard");
                } else {
                    const data = await response.json();
                    setError(data.detail || "Authentication handshake failed.");
                }
            } catch (err) {
                console.error("Callback error:", err);
                setError("A connection error occurred during the authentication handshake.");
            }
        };

        handleCallback();
    }, [searchParams, router, backendUrl, clientSecret, refreshSession]);

    if (error) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
                <div className="w-full max-w-md rounded-xl border border-red-200 bg-white p-8 shadow-lg text-center">
                    <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Authentication Error</h2>
                    <p className="text-sm text-slate-500 mb-6">{error}</p>
                    <button
                        onClick={() => router.push("/login")}
                        className="w-full rounded-md bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 transition-colors"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
                <div className="text-center">
                    <h2 className="text-lg font-semibold text-slate-900">Completing Sign-in</h2>
                    <p className="text-sm text-slate-500 italic">Establishing secure session with Ondamed...</p>
                </div>
            </div>
        </div>
    );
}

export default function AuthCallbackPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
            </div>
        }>
            <AuthCallback />
        </Suspense>
    );
}
