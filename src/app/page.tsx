"use client";

import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Activity, DollarSign, TrendingUp, Wifi, Bot, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type AssetData = {
  symbol: string;
  name: string;
  apy: number;
  tvl: number;
  timestamp: string;
};

export default function Dashboard() {
  const [data, setData] = useState<AssetData[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // 1. Connect to our custom server
    const socket = io({
      path: "/api/socket",
    });

    socket.on("connect", () => {
      console.log("Connected to WebSocket");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
    });

    // 2. Listen for the 'yield-update' event
    socket.on("yield-update", (newData: AssetData[]) => {
      setData(newData);

      // 3. Update Chart History (Keep last 15 points)
      setHistory((prev) => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });

        // Transform data for the chart: { time: "10:00:00", USDC: 4.5, USDT: 3.2 }
        const chartPoint = {
          time: timestamp,
          ...newData.reduce((acc, item) => ({ ...acc, [item.symbol]: item.apy }), {})
        };

        const newHistory = [...prev, chartPoint];
        return newHistory.slice(-15); // Keep chart moving
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const runAiAnalysis = async () => {
    if (data.length === 0) return;

    setIsAnalyzing(true);
    setAiAnalysis("🤖 X402 Agent is analyzing on-chain opportunities...");

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ marketData: data }),
      });
      const json = await res.json();
      setAiAnalysis(json.analysis);
    } catch (err) {
      setAiAnalysis("⚠️ Agent connection failed. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
              <Activity className="h-8 w-8 text-blue-600" />
              Yield Watch
            </h1>
            <p className="text-slate-500">Real-time Aave V3 Market Data</p>
          </div>
          <Badge variant={isConnected ? "default" : "destructive"} className="px-4 py-2 text-sm flex gap-2">
            <Wifi className="h-4 w-4" />
            {isConnected ? "Live Socket Connected" : "Connecting..."}
          </Badge>
        </div>

        {/* AI AGENT SECTION */}
        <Card className="border-blue-200 bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xl flex items-center gap-2 text-blue-800">
              <Bot className="h-6 w-6" />
              Agent X402
            </CardTitle>
            <Button
              onClick={runAiAnalysis}
              disabled={isAnalyzing}
              size="sm"
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isAnalyzing ? (
                <>
                  <Sparkles className="mr-2 h-4 w-4 animate-spin" /> Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" /> Run Analysis
                </>
              )}
            </Button>
          </CardHeader>
          <CardContent>
            {aiAnalysis ? (
              <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2">
                <div className="mt-1 bg-blue-100 p-1.5 rounded-full">
                  <Bot className="h-4 w-4 text-blue-700" />
                </div>
                <div className="text-slate-700 text-sm leading-relaxed">
                  {/* Allows bolding in the response */}
                  <span dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic">
                Ready to analyze live market data via x402 Protocol optimization engine...
              </p>
            )}
          </CardContent>
        </Card>

        {/* ASSET CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.map((asset) => (
            <Card key={asset.symbol} className="shadow-sm hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-medium">{asset.name}</CardTitle>
                <Badge variant="secondary">{asset.symbol}</Badge>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-sm font-medium text-slate-500">Supply APY</p>
                    <div className="text-3xl font-bold text-blue-600 flex items-center gap-2">
                      {asset.apy.toFixed(2)}%
                      <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Total Value Locked</p>
                    <p className="text-sm font-semibold flex items-center justify-end">
                      <DollarSign className="h-3 w-3" />
                      {(asset.tvl / 1_000_000).toFixed(1)}M
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* SKELETON LOADER (Shows if no data yet) */}
          {data.length === 0 && (
            <p className="text-slate-400 col-span-full text-center py-10">Waiting for next data pulse (10s)...</p>
          )}
        </div>

        {/* LIVE CHART */}
        <Card className="p-6 shadow-sm">
          <CardHeader className="px-0 pt-0">
            <CardTitle>Live APY Trends</CardTitle>
          </CardHeader>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorUSDC" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUSDT" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200" />
                <XAxis dataKey="time" className="text-xs" />
                <YAxis domain={['auto', 'auto']} className="text-xs" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                />
                <Area
                  type="monotone"
                  dataKey="USDC"
                  stroke="#2563eb"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUSDC)"
                />
                <Area
                  type="monotone"
                  dataKey="USDT"
                  stroke="#16a34a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorUSDT)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

      </div>
    </div>
  );
}