"use client";

import { YieldDashboard } from "@/components/YieldDashboard";
import { Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MarketPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Market Opportunities</h1>
                    <p className="text-slate-500">Explore high-yield DeFi protocols across multiple chains.</p>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="flex items-center gap-2">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search protocols..."
                            className="pl-9 h-10 w-[250px] bg-white border-slate-200 rounded-xl"
                        />
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-slate-200">
                        <Filter className="h-4 w-4 text-slate-600" />
                    </Button>
                </div>
            </div>

            {/* Main Yield Table */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <YieldDashboard />
            </div>
        </div>
    );
}
