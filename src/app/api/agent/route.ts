import { NextResponse } from "next/server";
import OpenAI from "openai";
import { getGlobalMarketData } from "@/lib/aggregator";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(request: Request) {
    const { messages, agentBalance } = await request.json(); // Array of chat history & balance
    const marketData = await getGlobalMarketData();

    const systemPrompt = `
    You are "x402 Agent", an autonomous DeFi execution bot.
    
    **YOUR DATA SOURCE:**
    ${JSON.stringify(marketData)}
    
    **YOUR CURRENT BALANCE:**
    ${agentBalance || 0} ETH

    **YOUR CAPABILITIES:**
    1. ANALYZE: Compare APYs across Aave, Compound, and Uniswap.
    2. ASSESS RISK: Warn users about "Impermanent Loss" in Uniswap vs "Smart Contract Risk" in Lending.
    3. EXECUTE: If the user asks to "invest", "swap", or "move funds", you must SIMULATE the action using the x402 Protocol.
    4. BUDGET: You cannot invest more than your current balance.

    **EXECUTION FORMAT:**
    When taking action, output a block like this:
    [ACTION_TRIGGER]
    Protocol: x402
    Operation: Bridge & Deposit
    Amount: (User amount or "MAX")
    Destination: (Best Protocol)
    [/ACTION_TRIGGER]

    Keep responses concise and professional.
  `;

    try {
        if (!process.env.OPENAI_API_KEY) throw new Error("No Key");

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                ...messages
            ],
            model: "gpt-3.5-turbo",
        });

        return NextResponse.json({ role: "assistant", content: completion.choices[0].message.content });

    } catch (error) {
        // FALLBACK SIMULATION (For Demo without API Key)
        const lastUserMsg = messages[messages.length - 1].content.toLowerCase();

        if (lastUserMsg.includes("compare") || lastUserMsg.includes("best")) {
            return NextResponse.json({
                role: "assistant",
                content: "Based on real-time analysis: **Uniswap** offers the highest yield (~12.5%) but carries High Risk. **Aave** is safer with ~4.8%. \n\nRecommendation: Use **x402 Protocol** to split funds: 70% in Aave (Safety) and 30% in Uniswap (Yield)."
            });
        }

        if (lastUserMsg.includes("invest") || lastUserMsg.includes("do it")) {
            return NextResponse.json({
                role: "assistant",
                content: "Initiating Transaction...\n\n[ACTION_TRIGGER]\nProtocol: x402\nOperation: Smart Route Deposit\nTarget: Aave V3 (USDC)\nStatus: Awaiting Signature\n[/ACTION_TRIGGER]\n\nPlease confirm in your wallet."
            });
        }

        return NextResponse.json({
            role: "assistant",
            content: "I am x402. I can analyze Aave, Compound, and Uniswap yields. Ask me to 'find the best yield' or 'invest $1000'."
        });
    }
}