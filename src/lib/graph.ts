import axios from 'axios';

// Your API Key
const API_KEY = process.env.GRAPH_API_KEY;

// Aave V3 Subgraph
const GRAPH_ENDPOINT = `https://gateway.thegraph.com/api/${API_KEY.trim()}/subgraphs/id/JCNWRypm7FYwV8fx5HhzZPSFaMxgkPuw4TnR3Gpi81zk`;

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

export async function fetchYieldData() {
    try {
        const response = await axios.post(GRAPH_ENDPOINT, { query: QUERY });

        if (response.data.errors) {
            console.error("GraphQL Errors:", response.data.errors);
            return [];
        }

        const markets = response.data.data.markets;

        return markets.map((market: any) => {
            // 1. Get symbol from the nested object
            const symbol = market.inputToken.symbol;
            const name = market.inputToken.name;

            // 2. Find Supply Rate (Lender)
            const supplyRate = market.rates.find((r: any) => r.side === "LENDER");
            const apy = supplyRate ? Number(supplyRate.rate) : 0;

            return {
                symbol: symbol,
                name: name,
                apy: apy,
                tvl: Number(market.totalValueLockedUSD),
                timestamp: new Date().toISOString()
            };
        });
    } catch (error) {
        console.error("Error fetching Graph data:", error);
        return [];
    }
}

// TEMPORARY TEST
fetchYieldData().then(data => console.log("Final Data:", data));