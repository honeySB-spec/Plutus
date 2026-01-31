"use client";

import { useState, useEffect } from "react";
import { Bot, Sparkles, TrendingUp, MoreHorizontal, ArrowUpRight, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChatBot } from "@/components/ChatBot";
import { YieldDashboard } from "@/components/YieldDashboard";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";

// Mock data for charts (keep for aesthetic visualization)
const chartData = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 550 },
  { name: 'Thu', value: 450 },
  { name: 'Fri', value: 600 },
  { name: 'Sat', value: 400 },
  { name: 'Sun', value: 300 },
];

export default function Dashboard() {
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [topApy, setTopApy] = useState(0);

  // Wagmi Hooks
  const { address, isConnected } = useAccount();
  const { data: balance } = useBalance({
    address,
  });

  // Fetch highest yield for the "Sales/Yield" card
  useEffect(() => {
    const fetchYields = async () => {
      try {
        const res = await fetch("/api/yields");
        const json = await res.json();
        if (json.data && json.data.length > 0) {
          // Find highest APY
          const max = Math.max(...json.data.map((i: any) => i.apy));
          setTopApy(max);
        }
      } catch (e) {
        console.error("Failed to fetch top yields");
      }
    };
    fetchYields();
  }, []);

  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    setAiAnalysis("🤖 X402 Agent is analyzing on-chain opportunities...");

    try {
      const dataRes = await fetch("/api/yields");
      const { data } = await dataRes.json();

      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Analyze current market data and give investment advice." }],
          marketData: data
        }),
      });
      const json = await res.json();
      setAiAnalysis(json.content);
    } catch (err) {
      setAiAnalysis("⚠️ Agent connection failed. Try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formattedBalance = balance
    ? parseFloat(formatUnits(balance.value, balance.decimals)).toFixed(4)
    : "0.00";

  return (
    <div className="space-y-8">

      {/* METRIC CARDS ROW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {/* CARD 1: BALANCE - Real Data */}
        <div className="bg-[#d1e7dd] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-[200px]">
          <div className="flex justify-between items-start">
            <div className="bg-[#b8dBC9] p-2 rounded-full">
              <span className="text-emerald-800 font-bold px-2 text-xs">$</span>
            </div>
            {isConnected && (
              <div className="bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-emerald-800 flex items-center gap-1">
                Connected
              </div>
            )}
          </div>
          <div className="relative z-10">
            <p className="text-emerald-800 text-sm font-medium mb-1">
              {isConnected ? "Wallet Balance" : "Connect Wallet"}
            </p>
            <h3 className="text-3xl font-bold text-[#1f4b3f]">
              {isConnected ? `${formattedBalance} ${balance?.symbol || 'ETH'}` : "---"}
            </h3>
          </div>
          {/* Decorative chart line */}
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="value" stroke="#1f4b3f" fill="none" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARD 2: YIELD - Real Data (Top APY) */}
        <div className="bg-[#f5cf87] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-between h-[200px]">
          <div className="flex justify-between items-start">
            <div className="bg-[#eac47e] p-2 rounded-full">
              <TrendingUp className="h-4 w-4 text-amber-900" />
            </div>
            <div className="bg-white/50 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-amber-900 flex items-center gap-1">
              Top Opportunity
            </div>
          </div>
          <div className="relative z-10">
            <p className="text-amber-900 text-sm font-medium mb-1">Highest APY Available</p>
            <h3 className="text-4xl font-bold text-[#5c4015]">{topApy.toFixed(2)}%</h3>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-16 opacity-40">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <Area type="monotone" dataKey="value" stroke="#5c4015" fill="none" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CARD 3: AGENT */}
        <div className="bg-[#dad7fe] rounded-3xl p-6 relative overflow-hidden flex flex-col justify-center items-center text-center h-[200px]">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Sparkles className="h-32 w-32 text-indigo-900" />
          </div>

          <h3 className="text-2xl font-bold text-indigo-900 mb-2 relative z-10">
            Agent X402
          </h3>
          <p className="text-indigo-800/80 text-sm mb-6 max-w-[200px] relative z-10">
            Get AI-powered insights and automate your yield farming.
          </p>
          <Button
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-500/30 px-8 py-6 relative z-10"
          >
            {isAnalyzing ? "Analyzing..." : "Run Analysis"}
          </Button>
        </div>
      </div>

      {/* AI ANALYSIS RESULT */}
      {aiAnalysis && (
        <Card className="border-0 shadow-sm bg-white rounded-3xl overflow-hidden">
          <CardHeader className="bg-indigo-50/50 border-b border-indigo-100/50 pb-4">
            <CardTitle className="flex items-center gap-2 text-indigo-900">
              <Bot className="h-5 w-5" /> Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
              <span dangerouslySetInnerHTML={{ __html: aiAnalysis.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* MAIN YIELD DASHBOARD SECTION */}
      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-900">Market Opportunities</h3>
          <Button variant="ghost" size="sm" className="text-slate-400">
            <MoreHorizontal className="h-5 w-5" />
          </Button>
        </div>
        <YieldDashboard />
      </div>

      <ChatBot />
    </div>
  );
}