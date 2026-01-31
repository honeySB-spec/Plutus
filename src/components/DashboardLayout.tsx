"use client";

import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen bg-background flex">
            {/* SIDEBAR */}
            <Sidebar />

            {/* MAIN CONTENT AREA */}
            <main className="flex-1 flex flex-col ml-0 lg:ml-64 transition-all duration-300 min-h-screen">
                <TopNav />

                <div className="flex-1 p-6 lg:p-10 overflow-auto">
                    {children}
                </div>
            </main>
        </div>
    );
}
