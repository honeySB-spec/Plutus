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
    apyBase: number;
    apyReward: number | null;
    tvl: number;
    chain: string;
    risk: string;
    poolId: string;
}

// Parameters for filtering and pagination
export interface YieldApiOptions {
    symbol?: string;    // Filter by symbol (e.g., 'USDC')
    protocol?: string;  // Filter by protocol name
    chain?: string;     // Filter by chain
    minTvl?: number;    // Minimum TVL
    minApy?: number;    // Minimum APY
    page?: number;      // Page number (1-based)
    limit?: number;     // Items per page
}

export interface PaginationMetadata {
    count: number;
    page: number;
    limit: number;
    totalPages: number;
    totalItems: number;
}

export interface GlobalMarketData {
    timestamp: string;
    data: YieldData[];
    pagination?: PaginationMetadata;
}
