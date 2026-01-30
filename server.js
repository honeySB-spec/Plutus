const { createServer } = require("http");
const next = require("next");
const { Server } = require("socket.io");
const axios = require("axios");

const dev = process.env.NODE_ENV !== "production";
const { loadEnvConfig } = require('@next/env');
loadEnvConfig(process.cwd(), dev);

const app = next({ dev });
const handle = app.getRequestHandler();

// --- CONFIGURATION ---
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

// --- DATA FETCHING FUNCTION ---
async function fetchYieldData() {
    try {
        const response = await axios.post(GRAPH_ENDPOINT, { query: QUERY });
        if (response.data.errors) return [];

        return response.data.data.markets.map((market) => {
            const supplyRate = market.rates.find((r) => r.side === "LENDER");
            return {
                symbol: market.inputToken.symbol,
                name: market.inputToken.name,
                apy: supplyRate ? Number(supplyRate.rate) : 0,
                tvl: Number(market.totalValueLockedUSD),
                timestamp: new Date().toISOString()
            };
        });
    } catch (error) {
        console.error("Fetch error:", error.message);
        return [];
    }
}

// --- SERVER SETUP ---
app.prepare().then(() => {
    const httpServer = createServer((req, res) => {
        handle(req, res);
    });

    const io = new Server(httpServer, {
        path: "/api/socket", // Custom path so it doesn't conflict with Next.js
    });

    io.on("connection", (socket) => {
        console.log(`Client connected: ${socket.id}`);
    });

    // BACKGROUND JOB: Fetch every 10 seconds and broadcast
    setInterval(async () => {
        const data = await fetchYieldData();
        if (data.length > 0) {
            console.log(`Broadcasting update for ${data.length} assets`);
            io.emit("yield-update", data); // Push to frontend
        }
    }, 10000);

    const PORT = 3000;
    httpServer.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
        console.log(`> WebSocket Server active on /api/socket`);
    });
});
