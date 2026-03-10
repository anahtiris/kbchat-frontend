import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/components/features/auth/auth-context";
import { ChatSettingsProvider } from "@/lib/contexts/chat-settings-context";
import { LanguageProvider } from "@/lib/i18n/context";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ondamed - Guidelines Assistant",
  description: "Manuals and instructions for Ondamed treatment machine",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <AuthProvider>
            <ChatSettingsProvider>
              {children}
            </ChatSettingsProvider>
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}
