"use client";

import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowUpRight, ArrowDownLeft, Wallet, History, Clock } from "lucide-react";

// Mock Allocation Data
const allocationData = [
    { name: 'ETH', value: 45, color: '#10b981' }, // Emerald
    { name: 'USDC', value: 30, color: '#3b82f6' }, // Blue
    { name: 'WBTC', value: 15, color: '#f59e0b' }, // Amber
    { name: 'Others', value: 10, color: '#6366f1' }, // Indigo
];

// Mock Transaction History
const transactions = [
    { id: 1, type: 'Deposit', asset: 'USDC', amount: '500.00', date: 'Today, 10:23 AM', status: 'Completed', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-100' },
    { id: 2, type: 'Swap', asset: 'ETH -> USDC', amount: '0.45', date: 'Yesterday, 2:15 PM', status: 'Completed', icon: History, color: 'text-blue-600', bg: 'bg-blue-100' },
    { id: 3, type: 'Withdraw', asset: 'AAVE', amount: '12.50', date: 'Jan 28, 2024', status: 'Pending', icon: ArrowUpRight, color: 'text-amber-600', bg: 'bg-amber-100' },
    { id: 4, type: 'Deposit', asset: 'ETH', amount: '1.20', date: 'Jan 25, 2024', status: 'Completed', icon: ArrowDownLeft, color: 'text-emerald-600', bg: 'bg-emerald-100' },
];

export default function WalletPage() {
    const { address, isConnected } = useAccount();
    const { data: balance } = useBalance({ address });

    const formattedBalance = balance
        ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)
        : "0.00";

    if (!isConnected) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] text-center space-y-4">
                <div className="bg-slate-100 p-6 rounded-full">
                    <Wallet className="h-12 w-12 text-slate-400" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Wallet Not Connected</h2>
                <p className="text-slate-500 max-w-md">Please connect your wallet using the button in the top navigation to view your portfolio and transactions.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-900">My Wallet</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                {/* TOTAL BALANCE CARD */}
                <Card className="md:col-span-2 bg-[#1a1b1e] border-0 text-white rounded-3xl overflow-hidden relative">
                    <CardContent className="p-8 flex flex-col justify-center h-full relative z-10">
                        <p className="text-slate-400 font-medium mb-1">Total Net Worth</p>
                        <h2 className="text-5xl font-bold mb-4">
                            {balance ? `${formattedBalance} ${balance.symbol}` : "$0.00"}
                        </h2>
                        <div className="flex gap-3">
                            <span className="bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                <ArrowUpRight className="h-3 w-3" /> +2.4%
                            </span>
                            <span className="bg-slate-700/50 text-slate-300 px-3 py-1 rounded-full text-sm font-medium">
                                {address?.slice(0, 6)}...{address?.slice(-4)}
                            </span>
                        </div>
                    </CardContent>
                    {/* Decorative Background Circles */}
                    <div className="absolute -top-24 -right-24 h-64 w-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 h-64 w-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
                </Card>

                {/* ASSET ALLOCATION CHART */}
                <Card className="bg-white border-slate-100 rounded-3xl shadow-sm">
                    <CardHeader className="pb-0">
                        <CardTitle className="text-base font-bold text-slate-900">Asset Allocation</CardTitle>
                    </CardHeader>
                    <CardContent className="h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={allocationData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={50}
                                    outerRadius={70}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {allocationData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Legend */}
                        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-3 text-xs text-slate-500">
                            {allocationData.map((item) => (
                                <div key={item.name} className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                    {item.name}
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* RECENT TRANSACTIONS */}
            <Card className="bg-white border-slate-100 rounded-3xl shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-slate-900">Recent Transactions</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {transactions.map((tx) => (
                            <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full ${tx.bg} flex items-center justify-center`}>
                                        <tx.icon className={`h-5 w-5 ${tx.color}`} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900">{tx.type}</p>
                                        <p className="text-xs text-slate-500">{tx.date}</p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`font-bold ${tx.type === 'Deposit' ? 'text-emerald-600' : 'text-slate-900'}`}>
                                        {tx.type === 'Deposit' ? '+' : ''}{tx.amount} <span className="text-xs text-slate-500 font-normal">{tx.asset}</span>
                                    </p>
                                    <p className="text-xs text-slate-400 capitalize">{tx.status}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
