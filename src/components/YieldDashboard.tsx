"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCcw, TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import { ApyChart } from "@/components/ApyChart";
import { YieldData } from "@/lib/types";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetDescription,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { ArrowRight, Info, ShieldCheck, Zap } from "lucide-react";

export function YieldDashboard() {
    const [data, setData] = useState<YieldData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedAsset, setSelectedAsset] = useState<string>("All");
    const [selectedPool, setSelectedPool] = useState<YieldData | null>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/yields");
            const json = await res.json();
            if (json.data) {
                setData(json.data);
            }
        } catch (error) {
            console.error("Failed to fetch yields", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        // Poll every 15 seconds for "real-time" feel
        const interval = setInterval(fetchData, 15000);
        return () => clearInterval(interval);
    }, []);

    const filteredData = selectedAsset === "All"
        ? data
        : data.filter(item => item.symbol.toUpperCase() === selectedAsset.toUpperCase());

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
        <div className="w-full space-y-6">
            {/* Asset Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {["All", "USDC", "USDT", "USDE", "CevUSD"].map((asset) => (
                    <Button
                        key={asset}
                        variant={selectedAsset === asset ? "default" : "outline"}
                        onClick={() => setSelectedAsset(asset)}
                        className={`rounded-full px-6 ${selectedAsset === asset ? 'bg-indigo-600 hover:bg-indigo-700' : 'border-slate-200 text-slate-600'}`}
                    >
                        {asset}
                    </Button>
                ))}
            </div>

            {/* Comparison Visualization (Only show if we have data) */}
            {!loading && filteredData.length > 0 && (
                <div className="bg-slate-50 rounded-2xl p-4 mb-6 border border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-slate-500 text-sm font-medium">
                        <TrendingUp className="h-4 w-4" />
                        Top Yield Opportunities Comparison
                    </div>
                    <div className="h-[200px] w-full flex items-end gap-2 px-2 overflow-x-auto">
                        {filteredData.slice(0, 10).map((item, idx) => (
                            <div key={idx} className="flex flex-col items-center gap-2 group min-w-[60px]" style={{ height: '100%' }}>
                                <div className="flex-1 w-full flex items-end justify-center relative">
                                    <div
                                        className="w-full bg-indigo-200 group-hover:bg-indigo-300 rounded-t-lg transition-all relative"
                                        style={{ height: `${Math.min((item.apy / 30) * 100, 100)}%` }} // Cap at 30% for visual scale
                                    >
                                        <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-bold text-indigo-700 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {item.apy.toFixed(1)}%
                                        </div>
                                    </div>
                                </div>
                                <div className="text-[10px] text-slate-500 font-medium truncate max-w-full text-center">
                                    {item.protocol}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 gap-3">
                {/* Header Row */}
                <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-2 text-sm font-medium text-slate-400">
                    <div className="col-span-3">Protocol / Chain</div>
                    <div className="col-span-2">Asset</div>
                    <div className="col-span-2">Trend</div>
                    <div className="col-span-1 text-right">APY</div>
                    <div className="col-span-2 text-right">TVL</div>
                    <div className="col-span-2 text-right">Risk</div>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-400">Loading real-time market opportunities...</div>
                ) : filteredData.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                        No opportunities found for {selectedAsset}.
                    </div>
                ) : (
                    filteredData.map((item, index) => (
                        <div
                            key={`${item.protocol}-${item.symbol}-${index}`}
                            onClick={() => setSelectedPool(item)}
                            className="bg-white hover:bg-slate-50 transition-all duration-200 p-4 rounded-3xl flex flex-col md:grid md:grid-cols-12 gap-4 items-center shadow-sm border border-slate-100/50 cursor-pointer active:scale-[0.99]"
                        >
                            {/* Avatar/Icon Placeholder + Protocol Name */}
                            <div className="col-span-3 flex items-center gap-4 w-full md:w-auto">
                                <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-xl text-slate-500 font-bold shrink-0">
                                    {item.protocol.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-bold text-slate-900 text-base truncate">
                                        {item.protocol.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                    </h4>
                                    <p className="text-xs text-slate-500 capitalize">{item.chain}</p>
                                </div>
                            </div>

                            {/* Asset */}
                            <div className="col-span-2 font-bold text-slate-700 w-full md:w-auto pl-16 md:pl-0 flex items-center gap-2">
                                <div className="bg-slate-100 px-2 py-1 rounded-md text-xs">{item.symbol}</div>
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
                                <Badge variant="outline" className={`${getRiskColor(item.risk)} border-0 px-3 py-1 rounded-full font-bold whitespace-nowrap`}>
                                    {item.risk}
                                </Badge>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Detail Sheet */}
            <Sheet open={!!selectedPool} onOpenChange={(open) => !open && setSelectedPool(null)}>
                <SheetContent className="overflow-y-auto sm:max-w-md w-full">
                    <SheetHeader className="space-y-4 pb-6 border-b border-slate-100">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-indigo-50 flex items-center justify-center text-2xl text-indigo-600 font-bold">
                                {selectedPool?.protocol.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <SheetTitle className="text-2xl font-bold text-slate-900">
                                    {selectedPool?.protocol.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                </SheetTitle>
                                <SheetDescription className="text-base text-slate-500 capitalize flex items-center gap-2">
                                    {selectedPool?.chain} Chain
                                </SheetDescription>
                            </div>
                        </div>
                    </SheetHeader>

                    {selectedPool && (
                        <div className="py-6 space-y-8">
                            {/* APY Breakdown */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Zap className="h-4 w-4 text-amber-500" />
                                    APY Breakdown
                                </h4>
                                <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-500">Total APY</span>
                                        <span className="text-3xl font-bold text-emerald-600">{selectedPool.apy.toFixed(2)}%</span>
                                    </div>
                                    <div className="h-px bg-slate-200"></div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Base Yield</p>
                                            <p className="font-semibold text-slate-700">{(selectedPool.apyBase || 0).toFixed(2)}%</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-slate-400 mb-1">Reward Yield</p>
                                            <p className="font-semibold text-slate-700">{(selectedPool.apyReward || 0).toFixed(2)}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Pool Details */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <Info className="h-4 w-4 text-indigo-500" />
                                    Pool Details
                                </h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                        <p className="text-xs text-slate-400 mb-1">Asset</p>
                                        <p className="font-bold text-slate-800 text-lg">{selectedPool.symbol}</p>
                                    </div>
                                    <div className="bg-white border border-slate-100 p-4 rounded-xl shadow-sm">
                                        <p className="text-xs text-slate-400 mb-1">TVL</p>
                                        <p className="font-bold text-slate-800 text-lg">{formatCurrency(selectedPool.tvl)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Risk Assessment */}
                            <div className="space-y-4">
                                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                    <ShieldCheck className="h-4 w-4 text-slate-500" />
                                    Risk Profile
                                </h4>
                                <div className={`p-4 rounded-xl border ${selectedPool.risk.includes("High") ? 'bg-red-50 border-red-100 text-red-800' : selectedPool.risk.includes("Medium") ? 'bg-yellow-50 border-yellow-100 text-yellow-800' : 'bg-green-50 border-green-100 text-green-800'}`}>
                                    <p className="font-medium flex items-center gap-2">
                                        {selectedPool.risk}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <SheetFooter className="mt-auto border-t border-slate-100 pt-6">
                        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl py-6 text-lg font-bold shadow-lg shadow-indigo-200" onClick={() => window.open(`https://defillama.com/yields/pool/${selectedPool?.poolId}`, '_blank')}>
                            Invest Now <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                    </SheetFooter>
                </SheetContent>
            </Sheet>
        </div>
    );
}
