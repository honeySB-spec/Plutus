import { NextRequest, NextResponse } from 'next/server';
import { getGlobalMarketData } from '@/lib/aggregator';
import { YieldApiOptions } from '@/lib/types';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);

        const options: YieldApiOptions = {
            symbol: searchParams.get('symbol') || undefined,
            protocol: searchParams.get('protocol') || undefined,
            chain: searchParams.get('chain') || undefined,
            minTvl: searchParams.has('minTvl') ? Number(searchParams.get('minTvl')) : undefined,
            minApy: searchParams.has('minApy') ? Number(searchParams.get('minApy')) : undefined,
            page: searchParams.has('page') ? Number(searchParams.get('page')) : undefined,
            limit: searchParams.has('limit') ? Number(searchParams.get('limit')) : undefined,
        };

        const marketData = await getGlobalMarketData(options);
        return NextResponse.json(marketData);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}