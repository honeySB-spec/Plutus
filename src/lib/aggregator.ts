import { DefiLlamaPool, YieldData, GlobalMarketData } from "./types";

const PROTOCOL_SLUGS = [
    "uniswap-v3",
    "aerodrome",
    "aerodrome-v1",
    "aerodrome-slipstream",
    "aave-v3",
    "morpho",
    "morpho-v1",
    "pendle",
    "curve-dex",
    "silo-finance",
    "silo-v2"
];

async function fetchDefiLlamaYields(): Promise<DefiLlamaPool[]> {
    try {
        const response = await fetch("https://yields.llama.fi/pools");
        if (!response.ok) {
            throw new Error(`Failed to fetch yields: ${response.statusText}`);
        }
        const json = await response.json();
        return json.data;
    } catch (error) {
        console.error("Error fetching DefiLlama yields:", error);
        return [];
    }
}

export async function getGlobalMarketData(): Promise<GlobalMarketData> {
    const allPools = await fetchDefiLlamaYields();

    // Map to normalized format first so we can sort uniformally
    const normalizedPools: YieldData[] = allPools
        .filter(pool =>
            PROTOCOL_SLUGS.includes(pool.project) &&
            pool.tvlUsd > 100000 // Lower TVL threshold to $100k to ensure we capture smaller protocols
        )
        .map(pool => ({
            protocol: pool.project,
            symbol: pool.symbol,
            apy: pool.apy,
            tvl: pool.tvlUsd,
            chain: pool.chain,
            risk: pool.ilRisk === 'yes' ? 'High (Impermanent Loss)' : 'Low (Lending/Staking)',
            poolId: pool.pool
        }));

    // Group by protocol and take top 5 from each
    const diverifiedPools: YieldData[] = [];

    PROTOCOL_SLUGS.forEach(slug => {
        const protocolPools = normalizedPools.filter(p => p.protocol === slug);
        protocolPools.sort((a, b) => b.tvl - a.tvl);
        diverifiedPools.push(...protocolPools.slice(0, 5));
    });

    // Sort final list by APY to highlight high yields
    diverifiedPools.sort((a, b) => b.apy - a.apy);

    return {
        timestamp: new Date().toISOString(),
        data: diverifiedPools
    };
}
