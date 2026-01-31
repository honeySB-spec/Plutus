"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    BarChart2,
    CreditCard,
    Bot,
    Settings,
    LogOut,
    Hexagon
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
    { label: "Dashboard", href: "/", icon: LayoutDashboard },
    { label: "Market", href: "/market", icon: BarChart2 },
    { label: "Wallet", href: "/wallet", icon: CreditCard },
    { label: "AI Agent", href: "/agent", icon: Bot },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="fixed left-0 top-0 h-screen w-20 lg:w-64 bg-sidebar text-sidebar-foreground flex flex-col border-r border-sidebar-border z-50 transition-all duration-300">
            {/* LOGO */}
            <div className="h-20 flex items-center justify-center lg:justify-start lg:px-8 border-b border-sidebar-border/10">
                <Hexagon className="h-8 w-8 text-white fill-white" />
                <span className="hidden lg:block ml-3 text-xl font-bold text-white tracking-wide">Zarss</span>
            </div>

            {/* USER PROFILE (Simplified) */}
            <div className="flex flex-col items-center py-8">
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-3">
                    <span className="text-white font-bold text-lg">Y</span>
                </div>
                <div className="hidden lg:block text-center">
                    <p className="text-lg font-bold text-white">Yield Watch</p>
                </div>
            </div>

            {/* NAVIGATION */}
            <nav className="flex-1 px-2 lg:px-4 space-y-1 overflow-y-auto py-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center justify-center lg:justify-start px-4 py-3 rounded-xl transition-all duration-200 group relative",
                                isActive
                                    ? "text-sidebar-accent-foreground"
                                    : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-white"
                            )}
                        >
                            {isActive && (
                                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-sidebar-primary rounded-r-lg" />
                            )}
                            <item.icon className={cn("h-6 w-6", isActive && "text-sidebar-primary")} />
                            <span className={cn("hidden lg:block ml-4 font-medium", isActive && "text-white")}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </nav>

            {/* BOTTOM ACTIONS */}
            <div className="p-4 space-y-1 mt-auto">
                <Link
                    href="/settings"
                    className="flex items-center justify-center lg:justify-start px-4 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-white transition-colors"
                >
                    <Settings className="h-6 w-6" />
                    <span className="hidden lg:block ml-4 font-medium">Settings</span>
                </Link>
                <button
                    className="w-full flex items-center justify-center lg:justify-start px-4 py-3 rounded-xl text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-white transition-colors"
                >
                    <LogOut className="h-6 w-6" />
                    <span className="hidden lg:block ml-4 font-medium">Log Out</span>
                </button>
            </div>
        </aside>
    );
}
