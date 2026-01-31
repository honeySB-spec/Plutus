export interface DefiLlamaPool {
    chain: string;
    project: string;
    symbol: string;
    tvlUsd: number;
    apy: number;
    apyBase: number;
    apyReward: number | null;
    pool: string;
    stablecoin: boolean;
    ilRisk: string; // "yes" or "no"
}

export interface YieldData {
    protocol: string;
    symbol: string;
    apy: number;
    tvl: number;
    chain: string;
    risk: string;
    poolId: string;
}

export interface GlobalMarketData {
    timestamp: string;
    data: YieldData[];
}
