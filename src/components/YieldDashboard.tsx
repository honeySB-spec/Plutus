"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import { ApyChart } from "@/components/ApyChart";
import { YieldData } from "@/lib/types";

export function YieldDashboard() {
    const [data, setData] = useState<YieldData[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState<string | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/yields");
            const json = await res.json();
            if (json.data) {
                setData(json.data);
                setLastUpdated(new Date().toLocaleTimeString());
            }
        } catch (error) {
            console.error("Failed to fetch yields", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 60 seconds
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, []);

    const getRiskColor = (risk: string) => {
        if (risk.includes("High")) return "bg-red-100 text-red-800 hover:bg-red-200 border-red-200";
        if (risk.includes("Medium")) return "bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border-yellow-200";
        return "bg-green-100 text-green-800 hover:bg-green-200 border-green-200";
    };

    const formatCurrency = (val: number) => {
        if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
        if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
        return `$${val.toFixed(2)}`;
    };

    return (
        <div className="w-full">
            <div className="grid grid-cols-1 gap-4">
                {/* Header Row (Hidden on mobile maybe, or just subtle) */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-sm font-medium text-slate-400">
                    <div className="col-span-3">Protocol / Chain</div>
                    <div className="col-span-2">Asset</div>
                    <div className="col-span-2">Trend</div>
                    <div className="col-span-1 text-right">APY</div>
                    <div className="col-span-2 text-right">TVL</div>
                    <div className="col-span-2 text-right">Risk</div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading market opportunities...</div>
                ) : data.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">No yield data available.</div>
                ) : (
                    data.map((item, index) => (
                        <div
                            key={`${item.protocol}-${item.symbol}-${index}`}
                            className="bg-white hover:bg-slate-50 transition-all duration-200 p-4 rounded-3xl flex flex-col md:grid md:grid-cols-12 gap-4 items-center shadow-sm border border-slate-100/50"
                        >
                            {/* Avatar/Icon Placeholder + Protocol Name */}
                            <div className="col-span-3 flex items-center gap-4 w-full md:w-auto">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl">
                                    {item.protocol.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900 text-base">
                                        {item.protocol.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </h4>
                                    <p className="text-xs text-slate-500 capitalize">{item.chain}</p>
                                </div>
                            </div>

                            {/* Asset */}
                            <div className="col-span-2 font-bold text-slate-700 w-full md:w-auto pl-16 md:pl-0">
                                {item.symbol}
                            </div>

                            {/* Chart (Trend) */}
                            <div className="col-span-2 w-full md:w-auto flex justify-center md:justify-start pl-16 md:pl-0">
                                <ApyChart poolId={item.poolId} />
                            </div>

                            {/* APY */}
                            <div className="col-span-1 w-full md:w-auto flex justify-between md:justify-end items-center md:pl-0 pl-16">
                                <span className="md:hidden text-slate-400 text-sm">APY:</span>
                                <span className={`font-bold ${item.apy > 10 ? 'text-emerald-600' : 'text-slate-900'}`}>
                                    +{item.apy.toFixed(2)}%
                                </span>
                            </div>

                            {/* TVL */}
                            <div className="col-span-2 w-full md:w-auto flex justify-between md:justify-end items-center md:pl-0 pl-16">
                                <span className="md:hidden text-slate-400 text-sm">TVL:</span>
                                <span className="text-slate-600 font-medium">{formatCurrency(item.tvl)}</span>
                            </div>

                            {/* Risk / Action */}
                            <div className="col-span-2 w-full md:w-auto flex justify-end">
                                <Badge variant="outline" className={`${getRiskColor(item.risk)} border-0 px-3 py-1 rounded-full font-bold`}>
                                    {item.risk}
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
