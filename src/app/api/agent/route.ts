import { NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI (It will look for OPENAI_API_KEY in .env)
// If you don't have a key, the 'catch' block below will use the fallback logic.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || "dummy",
});

export async function POST(request: Request) {
    const { marketData } = await request.json();

    try {
        // 1. Try to use Real AI (OpenAI)
        if (!process.env.OPENAI_API_KEY) throw new Error("No API Key");

        const prompt = `
      You are an expert DeFi Agent named "X402".
      Analyze these live yields: ${JSON.stringify(marketData)}.
      
      Rules:
      1. Identify the asset with the highest safe yield.
      2. If the difference between assets is < 0.5%, recommend "HOLD".
      3. If one is significantly higher, recommend "SWAP".
      4. Keep it short (max 2 sentences).
      5. Mention "x402 Protocol" in your reasoning.
    `;

        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: prompt }],
            model: "gpt-3.5-turbo",
        });

        return NextResponse.json({
            analysis: completion.choices[0].message.content,
            type: "AI_GENERATED"
        });

    } catch (error) {
        // 2. FALLBACK: Rule-Based Logic (If no API Key)
        // This ensures your demo works seamlessly during the hackathon!

        // Find highest APY
        const bestAsset = marketData.reduce((prev: any, current: any) =>
            (prev.apy > current.apy) ? prev : current
        );

        const worstAsset = marketData.reduce((prev: any, current: any) =>
            (prev.apy < current.apy) ? prev : current
        );

        const diff = bestAsset.apy - worstAsset.apy;
        let message = "";

        if (diff > 1.0) {
            message = `🚀 **X402 Strategy Alert:** Huge opportunity! Swap ${worstAsset.symbol} to ${bestAsset.symbol} immediately. The spread is ${diff.toFixed(2)}%. Executing via x402 protocol...`;
        } else if (diff > 0.2) {
            message = `ℹ️ **X402 Insight:** ${bestAsset.symbol} is slightly better (+${diff.toFixed(2)}%). Consider rebalancing portfolio using x402.`;
        } else {
            message = `🛡️ **X402 Status:** Market is stable. Yields are competitive. Recommendation: HOLD and accumulate rewards.`;
        }

        return NextResponse.json({
            analysis: message,
            type: "RULE_BASED"
        });
    }
}
