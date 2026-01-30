import { NextResponse } from 'next/server';
import axios from 'axios';

// Re-using the same config as the server
// (In a large app, we'd put this config in a shared file, but this is fine for a hackathon)
const API_KEY = process.env.GRAPH_API_KEY;
const GRAPH_ENDPOINT = `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/JCNWRypm7FYwV8fx5HhzZPSFaMxgkPuw4TnR3Gpi81zk`;

const ASSETS = [
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
];

const QUERY = `
{
  markets(where: { inputToken_in: ${JSON.stringify(ASSETS)} }) {
    inputToken { symbol name }
    rates { rate side }
    totalValueLockedUSD
  }
}
`;

export async function GET() {
    try {
        const response = await axios.post(GRAPH_ENDPOINT, { query: QUERY });

        if (response.data.errors) {
            return NextResponse.json({ error: "Graph API Error" }, { status: 500 });
        }

        const markets = response.data.data.markets;
        const cleanData = markets.map((market: any) => {
            const supplyRate = market.rates.find((r: any) => r.side === "LENDER");
            return {
                symbol: market.inputToken.symbol,
                name: market.inputToken.name,
                apy: supplyRate ? Number(supplyRate.rate) : 0,
                tvl: Number(market.totalValueLockedUSD),
                source: "Aave V3"
            };
        });

        return NextResponse.json({
            timestamp: new Date().toISOString(),
            data: cleanData
        });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}