"use client";

import { Search, Bell, Menu } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ConnectButton } from '@rainbow-me/rainbowkit';

export function TopNav() {
    return (
        <header className="flex h-20 items-center justify-between px-6 lg:px-10 border-b border-border/5 bg-transparent">
            {/* MOBILE TRIGGER (visible only on small screens) */}
            <Button variant="ghost" size="icon" className="lg:hidden mr-4">
                <Menu className="h-6 w-6" />
            </Button>

            <div className="flex-1 flex items-center">
                {/* PAGE TITLE / BREADCRUMB could go here */}
                <div className="hidden md:block">
                    <h2 className="text-xl font-bold text-foreground">Dashboard</h2>
                    <p className="text-sm text-muted-foreground">Payments Updates</p>
                </div>
            </div>

            <div className="flex items-center gap-4">
                {/* Connect Button handles the wallet logic */}
                <ConnectButton showBalance={false} />
            </div>
        </header>
    );
}
