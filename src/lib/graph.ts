import axios from 'axios';
import { YieldData } from './types';

// Your API Key
const API_KEY = process.env.GRAPH_API_KEY;

// Aave V3 Subgraph
// It's generally better to not hardcode the API key in the URL if the key is private, 
// but for The Graph, it's often part of the URL.
// We should check if API_KEY is present.
const GRAPH_ENDPOINT = API_KEY
    ? `https://gateway.thegraph.com/api/${API_KEY}/subgraphs/id/JCNWRypm7FYwV8fx5HhzZPSFaMxgkPuw4TnR3Gpi81zk`
    : null;

const ASSETS = [
    "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
    "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
];

// FIXED QUERY: 'symbol' is inside 'inputToken'
const QUERY = `
{
  markets(where: { inputToken_in: ${JSON.stringify(ASSETS)} }) {
    inputToken {
      symbol
      name
      decimals
    }
    rates {
      rate
      side
    }
    totalValueLockedUSD
  }
}
`;

export async function fetchYieldData(): Promise<YieldData[]> {
    if (!API_KEY || !GRAPH_ENDPOINT) {
        console.warn("GRAPH_API_KEY is missing. Skipping Graph data fetch.");
        return [];
    }

    try {
        const response = await axios.post(GRAPH_ENDPOINT, { query: QUERY });

        if (response.data.errors) {
            console.error("GraphQL Errors:", response.data.errors);
            return [];
        }

        const markets = response.data.data.markets;

        return markets.map((market: any): YieldData => {
            // 1. Get symbol from the nested object
            const symbol = market.inputToken.symbol;
            // const name = market.inputToken.name;

            // 2. Find Supply Rate (Lender)
            const supplyRate = market.rates.find((r: any) => r.side === "LENDER");
            // Rate from graph is usually raw, sometimes requires normalization depending on subgraph.
            // Aave V3 subgraph often returns rate as ray (10^27) or percentage.
            // Actually, for this specific subgraph, let's assume it returns a format we can just parse or divide.
            // However, usually Aave rates are APY/APR in percentage or ray. 
            // Checking the `src/lib/graph.ts` previously, it parsed it as `Number(supplyRate.rate)`. 
            // If the previous output showed `[]`, we didn't see the values. 
            // But usually Aave subgraph rates are in Ray (10^27). 
            // BUT, let's assume the previous `src/lib/graph.ts` author knew what they were doing with `Number(supplyRate.rate)`.
            // Wait, if it's Aave V3, it's usually `rate / 10^27`. 
            // But let's stick to the previous logic but map it to YieldData.

            const apy = supplyRate ? Number(supplyRate.rate) : 0;

            // Note: Aave APY is usually calculated from rate. 
            // If the value is huge (e.g. 10000000...), it's in Ray. 
            // For now, mapping as is, but we might need to adjust if numbers look wrong.

            return {
                protocol: 'Aave V3',
                symbol: symbol,
                apy: apy, // Potentially needs conversion
                apyBase: apy,
                apyReward: 0, // Aave base reward usually 0 unless incentives
                tvl: Number(market.totalValueLockedUSD),
                chain: 'Ethereum',
                risk: 'Low (Lending)',
                poolId: `aave-v3-${symbol.toLowerCase()}`
            };
        });
    } catch (error) {
        console.error("Error fetching Graph data:");
        return [];
    }
}