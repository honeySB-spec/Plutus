"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, CreditCard, Sparkles, User, Wallet, ArrowRight } from "lucide-react";
import { useAccount, useBalance, useSendTransaction, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, formatEther } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export function AgentFullView() {
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I am Agent X402. I'm connected to the live market data. Ask me about high-yield opportunities, risk assessments, or let me manage your portfolio." }
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // --- AGENT WALLET LOGIC ---
    const [agentAddress, setAgentAddress] = useState<`0x${string}` | null>(null);
    const [isFunding, setIsFunding] = useState(false);

    // Load or Create Agent Wallet
    useEffect(() => {
        const storedKey = localStorage.getItem("x402_agent_key");
        let account;
        if (storedKey) {
            account = privateKeyToAccount(storedKey as `0x${string}`);
        } else {
            // Create new for demo
            const newKey = generatePrivateKey();
            localStorage.setItem("x402_agent_key", newKey);
            account = privateKeyToAccount(newKey);
        }
        setAgentAddress(account.address);
    }, []);

    // Get Real Agent Balance
    const { data: balanceData, refetch: refetchBalance } = useBalance({
        address: agentAddress || undefined,
    });
    const agentBalanceEth = balanceData ? parseFloat(formatEther(balanceData.value)) : 0;

    // Funding Logic (User -> Agent)
    const { sendTransaction, data: txHash, isPending: isTxPending } = useSendTransaction();
    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash: txHash,
    });

    const handleFundAgent = () => {
        if (!agentAddress) return;
        sendTransaction({
            to: agentAddress,
            value: parseEther("0.01"), // Fund 0.01 ETH Fixed for demo
        });
    };

    useEffect(() => {
        if (isConfirmed) {
            refetchBalance();
            setIsFunding(false);
            setMessages(prev => [...prev, { role: "assistant", content: `**System Update:** Received funding! My new balance is ${agentBalanceEth + 0.01} ETH.` }]);
        }
    }, [isConfirmed]);
    // --------------------------

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = async () => {
        if (!input.trim()) return;

        const newMsg: Message = { role: "user", content: input };
        setMessages((prev) => [...prev, newMsg]);
        setInput("");
        setIsLoading(true);

        try {
            // Re-fetch yields to have fresh data context
            const dataRes = await fetch("/api/yields");
            const { data } = await dataRes.json();

            const res = await fetch("/api/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    messages: [...messages, newMsg],
                    marketData: data,
                    agentBalance: agentBalanceEth // Pass REAL balance to agent
                }),
            });
            const responseData = await res.json();
            setMessages((prev) => [...prev, responseData]);
        } catch (e) {
            setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection Error. The Agent is offline." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-100px)] w-full bg-white rounded-xl border border-slate-200 shadow-sm font-sans overflow-hidden">
            {/* HEADER */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white z-10">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 bg-black text-white rounded-full flex items-center justify-center">
                        <Bot className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold text-slate-900 tracking-tight">Agent X402</h1>
                        <div className="flex items-center gap-2">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <p className="text-slate-500 text-xs font-medium uppercase tracking-wide">Online • Base Sepolia</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block">
                        <p className="text-slate-400 text-xs uppercase font-medium">Agent Balance</p>
                        <p className="text-lg font-mono font-bold text-slate-900">{agentBalanceEth.toFixed(4)} ETH</p>
                    </div>
                    <Button
                        onClick={() => setIsFunding(!isFunding)}
                        variant="outline"
                        className="h-10 px-4 border-slate-200 text-slate-700 hover:bg-slate-50 font-medium"
                    >
                        <Wallet className="h-4 w-4 mr-2" />
                        {isFunding ? "Cancel" : "Fund Agent"}
                    </Button>
                </div>
            </div>

            {/* FUNDING DRAWER */}
            {isFunding && (
                <div className="bg-slate-50 border-b border-slate-100 p-4 transition-all animate-in slide-in-from-top-2">
                    <div className="flex items-center justify-between max-w-md mx-auto bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center text-amber-700">
                                <Wallet className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Deposit 0.01 ETH</p>
                                <p className="text-xs text-slate-500">Base Sepolia Testnet</p>
                            </div>
                        </div>
                        <Button
                            onClick={handleFundAgent}
                            disabled={isTxPending || isConfirming}
                            className="bg-black text-white hover:bg-slate-800"
                        >
                            {isTxPending ? "Sign..." : isConfirming ? "Confirming..." : "Confirm Deposit"}
                            {!isTxPending && !isConfirming && <ArrowRight className="ml-2 h-4 w-4" />}
                        </Button>
                    </div>
                </div>
            )}

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth bg-white" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`flex max-w-[80%] gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                            {/* Avatar */}
                            <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center border ${m.role === 'user' ? 'bg-slate-100 border-slate-200' : 'bg-black text-white border-black'}`}>
                                {m.role === 'user' ? <User className="h-4 w-4 text-slate-500" /> : <Sparkles className="h-4 w-4" />}
                            </div>

                            {/* Bubble */}
                            <div className="flex flex-col gap-1">
                                <div
                                    className={`px-5 py-3 text-[15px] leading-relaxed rounded-2xl ${m.role === 'user'
                                        ? 'bg-slate-100 text-slate-900 rounded-tr-sm'
                                        : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                                        }`}
                                >
                                    {/* Render Special Action Blocks */}
                                    {m.content.includes("[ACTION_TRIGGER]") ? (
                                        <div className="space-y-3 pt-1">
                                            <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                                                <CreditCard className="h-4 w-4" />
                                                <span>Action Required</span>
                                            </div>
                                            <div className="bg-slate-50 p-3 rounded border border-slate-100 text-sm font-mono text-slate-600">
                                                {m.content.replace("[ACTION_TRIGGER]", "").replace("[/ACTION_TRIGGER]", "")}
                                            </div>
                                            <Button className="w-full bg-black text-white hover:bg-slate-800 rounded-lg h-10 text-sm transition-colors">
                                                Execute
                                            </Button>
                                        </div>
                                    ) : (
                                        <span dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<b class="text-slate-900 font-semibold">$1</b>').replace(/\n/g, '<br/>') }} />
                                    )}
                                </div>
                                {/* Timestamp */}
                                <span className={`text-[10px] text-slate-400 font-medium uppercase ${m.role === "user" ? "text-right pr-1" : "text-left pl-1"}`}>
                                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start items-center gap-4 pt-2">
                        <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <Bot className="h-4 w-4 text-slate-400" />
                        </div>
                        <div className="flex gap-1.5 bg-white px-4 py-3 rounded-2xl border border-slate-100 shadow-sm items-center">
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-0" />
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-100" />
                            <span className="h-1.5 w-1.5 bg-slate-400 rounded-full animate-bounce delay-200" />
                        </div>
                    </div>
                )}
            </div>

            {/* INPUT AREA */}
            <div className="p-6 pt-2 bg-white">
                <div className="relative">
                    <form
                        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                        className="flex w-full gap-3"
                    >
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Type a command..."
                            className="flex-1 h-12 px-4 rounded-lg bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-1 focus-visible:ring-slate-900 focus-visible:border-slate-900 transition-all text-sm shadow-none"
                        />
                        <Button
                            type="submit"
                            disabled={isLoading || !input.trim()}
                            className="h-12 w-12 rounded-lg bg-black hover:bg-slate-800 text-white shrink-0 transition-colors shadow-none"
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
