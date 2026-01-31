"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bot, Send, CreditCard, Sparkles, User } from "lucide-react";

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
                    marketData: data
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
        <div className="flex flex-col h-[calc(100vh-120px)] bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-100">
            {/* HERDER */}
            <div className="bg-indigo-600 p-6 flex items-center gap-4 text-white">
                <div className="bg-white/20 p-3 rounded-full">
                    <Bot className="h-8 w-8" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold">Agent X402</h1>
                    <p className="text-indigo-100 text-sm">Autonomous DeFi Portfolio Manager</p>
                </div>
            </div>

            {/* MESSAGES AREA */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50" ref={scrollRef}>
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                        <div className={`flex max-w-[80%] gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>

                            {/* Avatar */}
                            <div className={`h-10 w-10 min-w-[2.5rem] rounded-full flex items-center justify-center shadow-sm ${m.role === "user" ? "bg-slate-200" : "bg-indigo-100"
                                }`}>
                                {m.role === "user" ? <User className="h-6 w-6 text-slate-500" /> : <Sparkles className="h-6 w-6 text-indigo-600" />}
                            </div>

                            {/* Bubble */}
                            <div
                                className={`rounded-2xl p-5 text-base leading-relaxed shadow-sm ${m.role === "user"
                                        ? "bg-indigo-600 text-white rounded-tr-sm"
                                        : "bg-white border border-slate-100 text-slate-800 rounded-tl-sm"
                                    }`}
                            >
                                {/* Render Special Action Blocks */}
                                {m.content.includes("[ACTION_TRIGGER]") ? (
                                    <div className="space-y-4">
                                        <div className="font-semibold text-emerald-600 flex items-center gap-2 border-b border-emerald-100 pb-2">
                                            <CreditCard className="h-5 w-5" /> Proposed Action
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-lg text-sm font-mono border border-slate-200 text-slate-600">
                                            {m.content.replace("[ACTION_TRIGGER]", "").replace("[/ACTION_TRIGGER]", "")}
                                        </div>
                                        <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-500/20">
                                            Confirm & Execute Transaction
                                        </Button>
                                    </div>
                                ) : (
                                    <span dangerouslySetInnerHTML={{ __html: m.content.replace(/\*\*(.*?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br/>') }} />
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                            <Bot className="h-6 w-6 text-indigo-600 animate-pulse" />
                        </div>
                        <div className="bg-white px-4 py-2 rounded-full text-sm text-slate-500 border border-slate-100 shadow-sm animate-pulse">
                            Thinking...
                        </div>
                    </div>
                )}
            </div>

            {/* INPUT AREA */}
            <div className="p-6 bg-white border-t border-slate-100">
                <form
                    onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                    className="flex w-full gap-4 max-w-4xl mx-auto"
                >
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask agent to analyze fees, find yields, or swap tokens..."
                        className="h-14 px-6 rounded-full bg-slate-50 text-base focus-visible:ring-indigo-500 shadow-inner"
                    />
                    <Button type="submit" size="icon" disabled={isLoading} className="h-14 w-14 rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 shrink-0">
                        <Send className="h-6 w-6" />
                    </Button>
                </form>
                <div className="text-center mt-3 text-xs text-slate-400">
                    AI Agent can make mistakes. Please verify important financial decisions.
                </div>
            </div>
        </div>
    );
}
