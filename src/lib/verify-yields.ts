import { getGlobalMarketData } from "./aggregator";

async function verify() {
    console.log("Fetching global market data...");

    try {
        const data = await getGlobalMarketData();
        console.log(`Fetched ${data.data.length} pools.`);

        if (data.data.length > 0) {
            const counts: Record<string, number> = {};
            data.data.forEach(p => {
                counts[p.protocol] = (counts[p.protocol] || 0) + 1;
            });

            console.log("\nPools per Protocol:");
            Object.entries(counts).forEach(([proto, count]) => {
                console.log(`- ${proto}: ${count}`);
            });

            console.log("\nTop 5 Pools:");
            data.data.slice(0, 5).forEach(pool => {
                console.log(`- ${pool.protocol} (${pool.chain}): ${pool.symbol} - APY: ${pool.apy.toFixed(2)}% - TVL: $${(pool.tvl / 1000000).toFixed(2)}M`);
            });
        } else {
            console.error("No data returned!");
        }
    } catch (error) {
        console.error("Verification failed:", error);
    }
}

verify();
