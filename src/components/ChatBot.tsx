"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Bot, X, Send, CreditCard } from "lucide-react";

type Message = {
    role: "user" | "assistant";
    content: string;
};

export function ChatBot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: "assistant", content: "Hello! I am the x402 Agent. I can analyze risks across protocols and execute trades. How can I help?" }
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
            const res = await fetch("/api/agent", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ messages: [...messages, newMsg] }),
            });
            const data = await res.json();
            setMessages((prev) => [...prev, data]);
        } catch (e) {
            setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Connection Error. Try again." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            {!isOpen && (
                <Button
                    onClick={() => setIsOpen(true)}
                    className="h-14 w-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl flex items-center justify-center"
                >
                    <Bot className="h-8 w-8 text-white" />
                </Button>
            )}

            {isOpen && (
                <Card className="w-[380px] h-[500px] flex flex-col shadow-2xl border-blue-200 animate-in slide-in-from-bottom-5">
                    <CardHeader className="bg-blue-600 text-white rounded-t-lg py-3 flex flex-row justify-between items-center">
                        <CardTitle className="text-sm flex items-center gap-2">
                            <Bot className="h-5 w-5" /> x402 AI Agent
                        </CardTitle>
                        <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-blue-700 h-8 w-8">
                            <X className="h-5 w-5" />
                        </Button>
                    </CardHeader>

                    <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50" ref={scrollRef}>
                        {messages.map((m, i) => (
                            <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                                <div
                                    className={`max-w-[85%] rounded-lg p-3 text-sm ${m.role === "user"
                                        ? "bg-blue-600 text-white"
                                        : "bg-white border border-slate-200 text-slate-800 shadow-sm"
                                        }`}
                                >
                                    {/* Render Special Action Blocks */}
                                    {m.content.includes("[ACTION_TRIGGER]") ? (
                                        <div className="space-y-2">
                                            <p className="font-semibold text-green-600 flex items-center gap-2">
                                                <CreditCard className="h-4 w-4" /> Executing Transaction
                                            </p>
                                            <div className="bg-slate-100 p-2 rounded text-xs font-mono border border-slate-300">
                                                {m.content.replace("[ACTION_TRIGGER]", "").replace("[/ACTION_TRIGGER]", "")}
                                            </div>
                                            <Button size="sm" className="w-full bg-green-600 hover:bg-green-700 mt-2">
                                                Confirm in Wallet
                                            </Button>
                                        </div>
                                    ) : (
                                        m.content
                                    )}
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex justify-start">
                                <div className="bg-slate-200 rounded-lg p-3 text-xs animate-pulse">Thinking...</div>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="p-3 border-t bg-white">
                        <form
                            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                            className="flex w-full gap-2"
                        >
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about yields or risks..."
                                className="focus-visible:ring-blue-500"
                            />
                            <Button type="submit" size="icon" disabled={isLoading} className="bg-blue-600">
                                <Send className="h-4 w-4" />
                            </Button>
                        </form>
                    </CardFooter>
                </Card>
            )}
        </div>
    );
}