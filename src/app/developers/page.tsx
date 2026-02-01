"use client";

import { Code, Terminal, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from 'react';

export default function DevelopersPage() {
    const baseUrl = "https://dash-eth.vercel.app/api/yields";
    const [copied, setCopied] = useState("");

    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopied(id);
        setTimeout(() => setCopied(""), 2000);
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col space-y-2">
                <h1 className="text-3xl font-bold text-slate-900">Developer API</h1>
                <p className="text-slate-500">
                    Build powerful DeFi applications with our real-time aggregated yield data.
                </p>
            </div>

            {/* Overview Card */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                    <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                        <Code className="h-5 w-5" /> API Overview
                    </div>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                    <p className="text-slate-600">
                        The Yield API provides programmatic access to existing liquidity pools, lending rates, and yield farming opportunities across multiple protocols.
                    </p>
                    <div className="flex items-center gap-2 p-4 bg-slate-100 rounded-xl font-mono text-sm text-slate-700">
                        <span className="font-bold text-indigo-600">GET</span>
                        <span className="flex-1 truncate">{baseUrl}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-slate-500 hover:text-indigo-600"
                            onClick={() => copyToClipboard(baseUrl, 'url')}
                        >
                            {copied === 'url' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Query Parameters */}
            <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
                <CardHeader>
                    <CardTitle className="text-xl text-slate-900">Query Parameters</CardTitle>
                    <CardDescription>Filter and paginate results to find exactly what you need.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-slate-50 text-slate-500 border-b border-slate-100">
                                <tr>
                                    <th className="p-4 font-medium">Parameter</th>
                                    <th className="p-4 font-medium">Type</th>
                                    <th className="p-4 font-medium">Description</th>
                                    <th className="p-4 font-medium">Default</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-slate-600">
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-mono text-indigo-600">symbol</td>
                                    <td className="p-4">string</td>
                                    <td className="p-4">Filter by asset symbol (e.g., 'USDC').</td>
                                    <td className="p-4 italic text-slate-400">Target Assets*</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-mono text-indigo-600">protocol</td>
                                    <td className="p-4">string</td>
                                    <td className="p-4">Filter by protocol name.</td>
                                    <td className="p-4 italic text-slate-400">All</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-mono text-indigo-600">chain</td>
                                    <td className="p-4">string</td>
                                    <td className="p-4">Filter by blockchain network.</td>
                                    <td className="p-4 italic text-slate-400">All</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-mono text-indigo-600">minTvl</td>
                                    <td className="p-4">number</td>
                                    <td className="p-4">Minimum TVL in USD.</td>
                                    <td className="p-4 font-mono text-slate-500">10000</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-mono text-indigo-600">minApy</td>
                                    <td className="p-4">number</td>
                                    <td className="p-4">Minimum APY percentage.</td>
                                    <td className="p-4 font-mono text-slate-500">0</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-mono text-indigo-600">page</td>
                                    <td className="p-4">number</td>
                                    <td className="p-4">Page number.</td>
                                    <td className="p-4 font-mono text-slate-500">1</td>
                                </tr>
                                <tr className="hover:bg-slate-50/50">
                                    <td className="p-4 font-mono text-indigo-600">limit</td>
                                    <td className="p-4">number</td>
                                    <td className="p-4">Items per page (max 100).</td>
                                    <td className="p-4 font-mono text-slate-500">50</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div className="p-4 bg-amber-50 text-amber-800 text-xs border-t border-amber-100">
                        *If no filters are provided, returns curated top yields for stablecoins.
                    </div>
                </CardContent>
            </Card>

            {/* Examples & Response */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Terminal className="h-5 w-5 text-slate-400" /> Usage Examples
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 flex-1">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">cURL</p>
                            <div className="bg-slate-900 rounded-xl p-4 relative group">
                                <code className="text-green-400 font-mono text-sm break-all">
                                    curl "{baseUrl}?symbol=ETH&minTvl=50000"
                                </code>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">JavaScript (Fetch)</p>
                            <div className="bg-slate-900 rounded-xl p-4 relative group">
                                <pre className="text-blue-300 font-mono text-xs leading-relaxed overflow-x-auto">
                                    {`const res = await fetch(
  '/api/yields?protocol=aave&chain=arbitrum'
);
const data = await res.json();`}
                                </pre>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden flex flex-col">
                    <CardHeader>
                        <CardTitle>Response Format</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1">
                        <div className="bg-slate-900 rounded-xl p-4 h-full overflow-hidden">
                            <pre className="text-yellow-100 font-mono text-xs leading-relaxed overflow-auto h-full max-h-[300px]">
                                {`{
  "timestamp": "2023-10-27T10:30:00.000Z",
  "data": [
    {
      "protocol": "Aave V3",
      "symbol": "USDC",
      "apy": 4.5,
      "tvl": 1500000,
      "chain": "Ethereum",
      "risk": "Low"
    }
  ],
  "pagination": {
      "count": 1,
      "page": 1,
      "limit": 50,
      "totalPages": 10,
      "totalItems": 500
  }
}`}
                            </pre>
                        </div>
                    </CardContent>
                </Card>
            </div>

        </div>
    );
}
