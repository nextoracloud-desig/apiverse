import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "APIverse",
    description: "Next-generation API marketplace and discovery platform",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body className={inter.className}>
                <Providers>
                    <div className="flex min-h-screen bg-background text-foreground">
                        {/* Desktop Sidebar - hidden on mobile */}
                        <Sidebar />

                        <div className="flex-1 flex flex-col min-h-screen md:pl-64 transition-all duration-300">
                            <Header />
                            <main className="flex-1 p-4 md:p-8 pt-6 max-w-7xl mx-auto w-full animate-in fade-in duration-500">
                                {children}
                            </main>
                        </div>
                    </div>
                </Providers>
            </body>
        </html>
    );
}
