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

import { fetchYieldData } from "./graph";

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

export async function getGlobalMarketData(options?: import("./types").YieldApiOptions): Promise<GlobalMarketData> {
    const [allPools, graphYields] = await Promise.all([
        fetchDefiLlamaYields(),
        fetchYieldData()
    ]);

    // 1. Initial Mapping & Defaults
    //    If specific filters are requested, we loosen the default asset filter.
    //    If NO filters are requested (default view), we enforce TARGET_ASSETS for the dashboard.
    const hasExplicitFilter = options && (options.symbol || options.protocol || options.chain);
    const TARGET_ASSETS = ['USDC', 'USDT', 'USDE', 'CEVUSD'];

    let normalizedPools: YieldData[] = allPools.map(pool => ({
        protocol: pool.project,
        symbol: pool.symbol,
        apy: pool.apy,
        apyBase: pool.apyBase || 0,
        apyReward: pool.apyReward || 0,
        tvl: pool.tvlUsd,
        chain: pool.chain,
        risk: pool.ilRisk === 'yes' ? 'High (Impermanent Loss)' : 'Low (Lending/Staking)',
        poolId: pool.pool
    }));

    // Add Mock Data (keep existing logic)
    const hasCevUsd = normalizedPools.some(p => p.symbol.toUpperCase() === 'CEVUSD');
    if (!hasCevUsd) {
        normalizedPools.push({
            protocol: 'ethena',
            symbol: 'CevUSD',
            apy: 15.4,
            apyBase: 10.0,
            apyReward: 5.4,
            tvl: 5000000,
            chain: 'Ethereum',
            risk: 'Medium',
            poolId: 'mock-cevusd-pool'
        });
    }

    // Merge Graph Data
    normalizedPools.push(...graphYields);

    // 2. Filtering
    const minTvl = options?.minTvl ?? 10000; // Default 10k TVL
    const minApy = options?.minApy ?? 0;

    normalizedPools = normalizedPools.filter(pool => {
        // Default Asset Filter (only if no explicit search filters provided)
        if (!hasExplicitFilter) {
            if (!TARGET_ASSETS.includes(pool.symbol.toUpperCase())) return false;
        }

        // TVL & APY
        if (pool.tvl < minTvl) return false;
        if (pool.apy < minApy) return false;

        // Explicit Filters
        if (options?.symbol && !pool.symbol.toLowerCase().includes(options.symbol.toLowerCase())) return false;
        if (options?.protocol && !pool.protocol.toLowerCase().includes(options.protocol.toLowerCase())) return false;
        if (options?.chain && !pool.chain.toLowerCase().includes(options.chain.toLowerCase())) return false;

        return true;
    });

    // 3. Sorting (Default by APY desc)
    normalizedPools.sort((a, b) => b.apy - a.apy);

    // 4. Pagination
    const totalItems = normalizedPools.length;
    const page = Math.max(1, options?.page ?? 1);
    const limit = Math.max(1, Math.min(100, options?.limit ?? 50)); // Default 50, max 100
    const totalPages = Math.ceil(totalItems / limit);

    const startIndex = (page - 1) * limit;
    const paginatedData = normalizedPools.slice(startIndex, startIndex + limit);

    return {
        timestamp: new Date().toISOString(),
        data: paginatedData,
        pagination: {
            count: paginatedData.length,
            page,
            limit,
            totalPages,
            totalItems
        }
    };
}
